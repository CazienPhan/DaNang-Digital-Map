import { meiliClientPromise } from "../client";
import { INDEXES } from "../indexes";
import { SearchResult } from "../types/SearchResult";
import { AutocompleteResponse } from "../models/AutocompleteResponse";
import { AutocompleteItem } from "../models/AutocompleteItem";
// import { ProductSearchDocument } from "../documents/ProductTypeDocument";

export class ProductSearchService {

    /**
     * Search products by keyword.
     */
    async search(
        query: string,
        limit = 10,
        offset = 0
    ): Promise<SearchResult> {

        const client = await meiliClientPromise;

        return client
            .index(INDEXES.PRODUCTS)
            .search(query, {
                limit,
                offset,
            });

    }
    /**
     * Return autocomplete suggestions.
     *
     * (Will be implemented in the next phase.)
     */
    /**
     * Returns lightweight suggestions for the autocomplete dropdown.
     */
    async autocomplete(
        query: string,
        limit = 5
    ): Promise<AutocompleteResponse> {

        const client = await meiliClientPromise;

        const result = await client
            .index(INDEXES.PRODUCTS)
            .search(query, {
                limit,
                attributesToRetrieve: ["name"],
            });

        const items: AutocompleteItem[] = result.hits.map((hit) => ({
            name: hit.name,
        }));

        return {
            query: result.query,
            processingTimeMs: result.processingTimeMs,
            estimatedTotalHits: result.estimatedTotalHits,
            items
        };
    }
    /**
     * Find one product by its id.
     *
     * (Will be implemented in the next phase.)
     */
    async getById(id: string) {

        throw new Error("Not implemented.");

    }

}