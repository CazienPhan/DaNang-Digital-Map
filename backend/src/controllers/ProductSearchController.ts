import { Request, Response } from "express";
import { ProductSearchService } from "../meilisearch/services/ProductSearchService";

const productSearchService = new ProductSearchService();

export class ProductSearchController {

    /**
     * GET /api/products/search?query=<term>&limit=<n>&offset=<n>
     *
     * Returns a ProductListingResponse — never a raw Meilisearch document.
     * The service layer is responsible for the Meilisearch → DTO mapping.
     */
    async search(req: Request, res: Response): Promise<void> {

        try {

            const query =
                String(req.query.query ?? "").trim();

            const limit =
                Number(req.query.limit ?? 20);

            const offset =
                Number(req.query.offset ?? 0);

            if (!query) {

                res.status(400).json({
                    success: false,
                    message: "Query is required.",
                });

                return;

            }

            const result =
                await productSearchService.search(
                    query,
                    limit,
                    offset
                );

            res.status(200).json({
                success: true,
                data: result,
            });

        }

        catch (error) {

            console.error("[ProductSearchController] search error:", error);

            res.status(500).json({
                success: false,
                message: "Search failed.",
            });

        }

    }

}