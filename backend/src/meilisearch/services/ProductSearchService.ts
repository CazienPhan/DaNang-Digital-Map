import { meiliClientPromise } from "../client";
import { INDEXES } from "../indexes";
import { AutocompleteResponse } from "../models/AutocompleteResponse";
import { AutocompleteItem } from "../models/AutocompleteItem";
import { ProductListingItem } from "../models/ProductListingItem";
import { ProductListingResponse } from "../models/ProductListingResponse";
import { ProductSearchDocument } from "../documents/ProductTypeDocument";

export class ProductSearchService {

    /**
     * Full product search — returns a typed ProductListingResponse.
     *
     * ┌─────────────────────────────────────────────────────────────┐
     * │  Anti-Corruption: Meilisearch hits are mapped to            │
     * │  ProductListingItem[] before leaving this method.           │
     * │  Raw ProductSearchDocument is NEVER returned to callers.    │
     * └─────────────────────────────────────────────────────────────┘
     *
     * Retrieves only the fields needed for listing (id, name, short_description).
     * image is always null until the field is added to the Meilisearch index —
     * the DTO slot is preserved so adding the field later is a 1-line change here.
     */
    async search(
        query: string,
        limit = 20,
        offset = 0
    ): Promise<ProductListingResponse> {

        const client = await meiliClientPromise;

        const result = await client
            .index(INDEXES.PRODUCTS)
            .search<ProductSearchDocument>(query, {
                limit,
                offset,
                attributesToRetrieve: ["id", "name", "short_description"],
            });

        const items: ProductListingItem[] = result.hits.map((hit) => ({
            id: hit.id,
            name: hit.name,
            short_description: hit.short_description ?? "",
            image: null, // Reserved: populate once images are indexed
        }));

        return {
            query: result.query,
            processingTimeMs: result.processingTimeMs,
            estimatedTotalHits: result.estimatedTotalHits ?? 0,
            items,
        };

    }

    /**
     * Returns lightweight suggestions for the autocomplete dropdown.
     *
     * Only retrieves { name } — intentionally minimal for fast dropdown UX.
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
            estimatedTotalHits: result.estimatedTotalHits ?? 0,
            items,
        };

    }

    /**
     * Find one product by its id.
     * (Implemented in Phase 8 — Product Detail.)
     */
    async getById(id: string): Promise<never> {
        throw new Error(`getById("${id}") — Not implemented (Phase 8).`);
    }

}