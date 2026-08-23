import { Request, Response } from "express";
import { PoiSearchService } from "../meilisearch/services/PoiSearchService";
import { Map4dBackendService } from "../services/map4d.service";
import { CategoryDetectionService } from "../services/CategoryDetectionService";
import type { PoiListingItem } from "../meilisearch/models/PoiListingItem";

const poiSearchService = new PoiSearchService();

export class PlaceSearchController {

    /**
     * GET /api/places/search?query=<term>&location=<lat,lng>&limit=<n>&offset=<n>
     *     &bounds=<neLat,neLng,swLat,swLng>&userLat=<lat>&userLng=<lng>
     *
     * Place Search architecture:
     *   1. Detect category from the query (exact-match against Category Dictionary)
     *   2. Determine geographic filter based on GPS-in-viewport relationship
     *   3. Search internal POI Meilisearch index with the ORIGINAL query + geo filter
     *   4. If Meilisearch returns results → return them (source: "meilisearch")
     *   5. If Meilisearch returns zero results → Map4D Text Search fallback (source: "map4d")
     *
     * Meilisearch errors are NOT treated as "zero results" — they are actual failures.
     *
     * Geographic filter rules:
     *   - GPS inside viewport + category  → _geoRadius(gpsLat, gpsLng, 1000)
     *   - GPS inside viewport + !category → _geoRadius(gpsLat, gpsLng, 9000)
     *   - GPS outside viewport            → _geoBoundingBox([neLat, neLng], [swLat, swLng])
     *   - No geo data available            → no filter (existing behavior)
     */
    async search(req: Request, res: Response): Promise<void> {

        try {

            // ── Parse existing parameters ──────────────────────────────────
            const query =
                String(req.query.query ?? "").trim();

            const limit =
                Number(req.query.limit ?? 20);

            const offset =
                Number(req.query.offset ?? 0);

            const location =
                req.query.location
                    ? String(req.query.location)
                    : undefined;

            if (!query) {

                res.status(400).json({
                    success: false,
                    message: "Query is required.",
                });

                return;

            }

            // ── Parse NEW geographic parameters ────────────────────────────
            const userLat =
                req.query.userLat !== undefined
                    ? parseFloat(String(req.query.userLat))
                    : undefined;

            const userLng =
                req.query.userLng !== undefined
                    ? parseFloat(String(req.query.userLng))
                    : undefined;

            // bounds = "neLat,neLng,swLat,swLng"
            let neLat: number | undefined;
            let neLng: number | undefined;
            let swLat: number | undefined;
            let swLng: number | undefined;

            if (req.query.bounds) {
                const parts = String(req.query.bounds).split(",").map(Number);
                if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
                    [neLat, neLng, swLat, swLng] = parts;
                }
            }

            const hasUserGps =
                userLat !== undefined && !isNaN(userLat) &&
                userLng !== undefined && !isNaN(userLng);

            const hasBounds =
                neLat !== undefined && neLng !== undefined &&
                swLat !== undefined && swLng !== undefined;

            // ── Category detection (does NOT modify originalQuery) ─────────
            const { isCategory } = CategoryDetectionService.detect(query);

            // ── Determine GPS-in-viewport relationship ─────────────────────
            let gpsInsideViewport = false;

            if (hasUserGps && hasBounds) {
                gpsInsideViewport =
                    userLat! >= swLat! && userLat! <= neLat! &&
                    userLng! >= swLng! && userLng! <= neLng!;
            }

            // ── Construct geographic filter ────────────────────────────────
            let geoFilter: string | undefined;

            if (gpsInsideViewport && hasUserGps) {
                // GPS is inside viewport → use _geoRadius centered on user GPS
                const radiusMeters = isCategory ? 1000 : 9000;
                geoFilter = `_geoRadius(${userLat}, ${userLng}, ${radiusMeters})`;
            } else if (hasBounds) {
                // GPS is outside viewport (or unavailable) → use _geoBoundingBox
                geoFilter = `_geoBoundingBox([${neLat}, ${neLng}], [${swLat}, ${swLng}])`;
            }
            // else: no geographic data available → geoFilter remains undefined
            // (existing behavior: search returns all matching POIs)

            // ── STEP 1: Search internal POI Meilisearch index ──────────────
            // The ORIGINAL query is sent to Meilisearch — never the normalized
            // category detection copy.
            const selectedRule = (gpsInsideViewport && hasUserGps)
                ? (isCategory ? 'Rule1' : 'Rule2')
                : (hasBounds ? 'Rule3' : 'NoGeo');

            console.log(
                `[PlaceSearchController] ` +
                `query="${query}" isCategory=${isCategory} ` +
                `hasUserGps=${hasUserGps} hasBounds=${hasBounds} ` +
                `gpsInsideViewport=${gpsInsideViewport} ` +
                `userLat=${userLat ?? '(none)'} userLng=${userLng ?? '(none)'} ` +
                `rule=${selectedRule} ` +
                `geoFilter=${geoFilter ?? "(none)"}`
            );

            const meiliResult =
                await poiSearchService.search(query, limit, offset, geoFilter, userLat, userLng);

            console.log(
                `[PlaceSearchController] Meilisearch returned ${meiliResult.items.length} item(s)` +
                ` (estimatedTotalHits=${meiliResult.estimatedTotalHits})`
            );

            // ── STEP 2: If internal POIs found, return them ────────────────
            if (meiliResult.items.length > 0) {

                res.status(200).json({
                    success: true,
                    data: meiliResult,
                });

                return;

            }

            // ── STEP 3: Map4D Text Search fallback ─────────────────────────
            try {

                const map4dData =
                    await Map4dBackendService.textSearch(query, location);

                const map4dItems: PoiListingItem[] = [];

                if (map4dData && map4dData.result && Array.isArray(map4dData.result)) {
                    for (const item of map4dData.result) {
                        map4dItems.push({
                            id: item.id || Math.random().toString(),
                            name: item.name || "Unknown Place",
                            dia_chi: item.address || "",
                            lat: item.location?.lat ?? 0,
                            lng: item.location?.lng ?? 0,
                        });
                    }
                }

                res.status(200).json({
                    success: true,
                    data: {
                        query,
                        processingTimeMs: 0,
                        estimatedTotalHits: map4dItems.length,
                        items: map4dItems,
                        source: "map4d",
                    },
                });

            } catch (map4dError) {

                console.error("[PlaceSearchController] Map4D fallback failed:", map4dError);

                // Return the empty Meilisearch result rather than a 500
                // so the frontend sees "no results" instead of an error.
                res.status(200).json({
                    success: true,
                    data: meiliResult,
                });

            }

        }

        catch (error) {

            console.error("[PlaceSearchController] search error:", error);

            res.status(500).json({
                success: false,
                message: "Place search failed.",
            });

        }

    }

}
