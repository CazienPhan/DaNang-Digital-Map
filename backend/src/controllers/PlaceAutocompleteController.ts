import { Request, Response } from "express";
import { PoiSearchService } from "../meilisearch/services/PoiSearchService";

export class PlaceAutocompleteController {

    private readonly poiSearchService =
        new PoiSearchService();

    /**
     * GET /api/places/autocomplete?query=<term>&limit=<n>
     *
     * Meilisearch ONLY — no Map4D fallback for autocomplete.
     * Returns lightweight POI suggestions for the dropdown.
     */
    async autocomplete(
        req: Request,
        res: Response
    ): Promise<void> {

        try {

            const query =
                String(req.query.query ?? "").trim();

            if (!query) {

                res.status(400).json({

                    success: false,

                    message: "Query is required."

                });

                return;

            }

            const limit =
                Number(req.query.limit ?? 7);

            const result =
                await this.poiSearchService.autocomplete(
                    query,
                    limit
                );

            res.status(200).json({

                success: true,

                data: result

            });

        }

        catch (error) {

            console.error("[PlaceAutocompleteController] autocomplete FAILED");
            console.error("  query      :", req.query.query);
            console.error("  index name : pois");
            console.error("  error      :", error);
            if (error instanceof Error) {
                console.error("  stack      :", error.stack);
            }

            res.status(500).json({

                success: false,

                message: "Place autocomplete failed."

            });

        }

    }

}
