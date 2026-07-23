import { Request, Response } from "express";
import { ProductSearchService } from "../meilisearch/services/ProductSearchService";

const productSearchService = new ProductSearchService();

export class ProductSearchController {

    async search(req: Request, res: Response): Promise<void> {

        try {

            const query =
                String(req.query.query ?? "").trim();

            const limit =
                Number(req.query.limit ?? 10);

            const offset =
                Number(req.query.offset ?? 0);

            if (!query) {

                res.status(400).json({
                    success: false,
                    message: "Query is required."
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

                data: result

            });

        }

        catch (error) {

            console.error(error);

            res.status(500).json({

                success: false,

                message: "Search failed."

            });

        }

    }

}