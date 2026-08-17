import { Request, Response } from "express";
import { PoiSearchService } from "../meilisearch/services/PoiSearchService";
import { Map4dBackendService } from "../services/map4d.service";
import type { PoiListingItem } from "../meilisearch/models/PoiListingItem";

const poiSearchService = new PoiSearchService();

export class PlaceSearchController {

    /**
     * GET /api/places/search?query=<term>&location=<lat,lng>&limit=<n>&offset=<n>
     *
     * Sequential fallback architecture:
     *   1. Search internal POI Meilisearch index
     *   2. If Meilisearch returns results → return them (source: "meilisearch")
     *   3. If Meilisearch returns zero results → call Map4D Text Search fallback
     *   4. Return Map4D results normalized to the same PoiListingItem shape (source: "map4d")
     *
     * Meilisearch errors are NOT treated as "zero results" — they are actual failures.
     */
    async search(req: Request, res: Response): Promise<void> {

        try {

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

            // STEP 1: Search internal POI Meilisearch index
            const meiliResult =
                await poiSearchService.search(query, limit, offset);

            // STEP 2: If internal POIs found, return them
            if (meiliResult.items.length > 0) {

                res.status(200).json({
                    success: true,
                    data: meiliResult,
                });

                return;

            }

            // STEP 3: Map4D Text Search fallback
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
