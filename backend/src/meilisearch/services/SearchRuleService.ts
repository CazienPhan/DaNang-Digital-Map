import dotenv from "dotenv";
import https from "https";

dotenv.config();

/**
 * SearchRuleService
 * =================
 * Single responsibility: retrieve the `search_instant_business` Dynamic
 * Search Rule from Meilisearch Cloud and expose the number of pinned
 * documents it configures.
 *
 * WHY this exists
 * ---------------
 * Meilisearch's `pin` action is ADDITIVE: pinned documents are injected at
 * their specified positions and the remaining result slots are filled by
 * organic search results.  For an `isEmpty: true` rule the entire index
 * (3 000+ documents) qualifies as "organic", so a `limit=20` empty-query
 * search returns 2 pinned + 18 random organic docs.
 *
 * The correct Meilisearch-native fix is to cap `limit` to the number of
 * pinned documents.  When the caller sends `limit=<pinCount>` only the
 * pinned positions are populated — Meilisearch has no more slots to fill.
 *
 * This service reads the pin count from the LIVE rule so:
 *   - no document IDs are hardcoded anywhere in the application,
 *   - Meilisearch remains the single source of truth,
 *   - if a Meilisearch admin changes the rule (adds/removes pins) the
 *     application automatically adapts after the next cache expiry.
 *
 * Caching
 * -------
 * The rule is cached for 5 minutes (CACHE_TTL_MS).  On every empty-search
 * request that falls within the TTL the controller uses the cached value
 * directly.  This keeps the per-request cost at zero while still reflecting
 * rule changes reasonably quickly.
 *
 * Failure handling
 * ----------------
 * If the Meilisearch API is unreachable the last cached value is returned
 * (stale-while-revalidate approach).  If there is no cached value at all a
 * safe fallback of 2 is returned so the search still works with a
 * reasonable result set.
 */

const RULE_UID = "search_instant_business";
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_PIN_COUNT = 5; // matches current rule (5 pins); used only if Meilisearch is unreachable

interface CacheEntry {
    pinCount: number;
    fetchedAt: number;
}

export class SearchRuleService {

    private static cache: CacheEntry | null = null;

    /**
     * Returns the number of documents pinned by the `search_instant_business`
     * rule.  Uses a cached value if it is still fresh.
     */
    static async getEmptySearchPinCount(): Promise<number> {

        const now = Date.now();

        // Return cached value if still fresh
        if (
            SearchRuleService.cache &&
            now - SearchRuleService.cache.fetchedAt < CACHE_TTL_MS
        ) {
            return SearchRuleService.cache.pinCount;
        }

        try {
            const pinCount = await SearchRuleService.fetchPinCount();
            SearchRuleService.cache = { pinCount, fetchedAt: now };
            console.log(
                `[SearchRuleService] Fetched pin count for "${RULE_UID}": ${pinCount}`
            );
            return pinCount;
        } catch (err) {
            console.error(
                `[SearchRuleService] Failed to fetch rule "${RULE_UID}":`,
                err instanceof Error ? err.message : err
            );

            // Stale-while-revalidate: return the last known value if we have one
            if (SearchRuleService.cache) {
                console.warn(
                    `[SearchRuleService] Returning stale cached pin count: ${SearchRuleService.cache.pinCount}`
                );
                return SearchRuleService.cache.pinCount;
            }

            // Absolute fallback — keeps the search working even if Meilisearch
            // is temporarily unreachable on the very first request.
            console.warn(
                `[SearchRuleService] No cache available; using fallback pin count: ${FALLBACK_PIN_COUNT}`
            );
            return FALLBACK_PIN_COUNT;
        }
    }

    /**
     * Fetches the raw rule from the Meilisearch Cloud API and extracts the
     * pin count.  Uses Node's built-in `https` module to avoid adding new
     * dependencies.
     */
    private static fetchPinCount(): Promise<number> {

        return new Promise((resolve, reject) => {

            const host = process.env.MEILISEARCH_HOST ?? "";
            const apiKey = process.env.MEILISEARCH_ADMIN_KEY ?? "";

            if (!host || !apiKey) {
                reject(new Error("MEILISEARCH_HOST or MEILISEARCH_ADMIN_KEY is not set."));
                return;
            }

            // Strip protocol prefix for the `https` module
            const hostWithoutProtocol = host.replace(/^https?:\/\//, "");

            const options: https.RequestOptions = {
                hostname: hostWithoutProtocol,
                path: `/dynamic-search-rules/${RULE_UID}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            };

            const req = https.request(options, (res) => {

                let raw = "";
                res.on("data", (chunk: Buffer) => { raw += chunk.toString(); });
                res.on("end", () => {
                    try {
                        if (res.statusCode !== 200) {
                            reject(
                                new Error(
                                    `Meilisearch returned HTTP ${res.statusCode} for rule "${RULE_UID}": ${raw}`
                                )
                            );
                            return;
                        }

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const rule = JSON.parse(raw) as Record<string, any>;
                        const pins: unknown[] = rule?.actions?.pin ?? [];

                        if (!Array.isArray(pins) || pins.length === 0) {
                            reject(
                                new Error(
                                    `Rule "${RULE_UID}" has no pin actions — cannot determine pin count.`
                                )
                            );
                            return;
                        }

                        resolve(pins.length);

                    } catch (parseErr) {
                        reject(
                            new Error(`Failed to parse rule response: ${String(parseErr)}`)
                        );
                    }
                });
            });

            req.on("error", reject);
            req.end();
        });
    }

    /** Invalidate the cache (useful after rule updates or in tests). */
    static invalidateCache(): void {
        SearchRuleService.cache = null;
    }
}
