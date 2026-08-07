import { Request, Response } from "express";
import { ProductSearchService } from "../meilisearch/services/ProductSearchService";

export class ProductAutocompleteController {

    private readonly productSearchService =
        new ProductSearchService();

    /**
     * GET /api/products/autocomplete
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
                Number(req.query.limit ?? 5);

            const result =
                await this.productSearchService.autocomplete(
                    query,
                    limit
                );

            res.status(200).json({

                success: true,

                data: result

            });

        }

        catch (error) {

            console.error("[ProductAutocompleteController] autocomplete FAILED");
            console.error("  query      :", req.query.query);
            console.error("  index name : products");
            console.error("  error      :", error);
            if (error instanceof Error) {
                console.error("  stack      :", error.stack);
            }

            res.status(500).json({

                success: false,

                message: "Autocomplete failed."

            });

        }

    }

}