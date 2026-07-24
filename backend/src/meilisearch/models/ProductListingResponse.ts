import { ProductListingItem } from "./ProductListingItem";

/**
 * ProductListingResponse — the complete REST envelope returned by
 * GET /api/products/search?query=...
 *
 * This is the typed contract shared between:
 *   backend → ProductSearchController
 *   frontend → ProductSearchService.search()
 *
 * Never contains raw Meilisearch fields (slugs, danh_muc, overview, etc.)
 */
export interface ProductListingResponse {
    query: string;
    processingTimeMs: number;
    estimatedTotalHits: number;
    items: ProductListingItem[];
}
