/**
 * ============================================================================
 * Product Search Service
 * ----------------------------------------------------------------------------
 * Responsibility:
 * - Communicate with Product Search Backend APIs.
 * - Hide all HTTP implementation details.
 * - SearchBar / Hooks never know Backend implementation.
 *
 * Architecture:
 *
 * SearchBar
 *      ↓
 * SearchEngineAdapter → ProductSearchEngine
 *      ↓
 * ProductSearchService
 *      ↓
 * Backend REST API
 *      ↓
 * Meilisearch
 *
 * This service MUST NOT contain:
 * - React state
 * - React hooks
 * - Debounce
 * - Loading state
 * - Error state
 * ============================================================================
 */

const API_URL = import.meta.env.VITE_BACKEND_URL;

/* ============================================================================
 * AutocompleteItem
 * Matches the backend AutocompleteItem model exactly.
 * Backend: src/meilisearch/models/AutocompleteItem.ts → { name: string }
 * Response envelope:
 *   GET /api/products/autocomplete?query=...
 *   → { success, data: { query, processingTimeMs, estimatedTotalHits, items: AutocompleteItem[] } }
 * ========================================================================== */

export interface AutocompleteItem {
    name: string;
}

/* ============================================================================
 * ProductSuggestion
 * Kept for backward compatibility with hooks that predate the adapter pattern.
 * The adapter layer now uses AutocompleteItem — not ProductSuggestion — for
 * the autocomplete flow.
 * ========================================================================== */

// export interface ProductSuggestion {
//     id: string;
//     slug: string;
//     name: string;
//     name_en: string;
//     danh_muc: string;
// }

/* ============================================================================
 * ProductListingItem
 * Mirrors backend: src/meilisearch/models/ProductListingItem.ts
 * This is the DTO returned inside GET /api/products/search → data.items[]
 *
 * Fields used by SearchSuggestionMapper.fromProduct():
 *   id               → SearchSuggestion.id
 *   name             → SearchSuggestion.title
 *   short_description→ SearchSuggestion.description
 *   image            → SearchSuggestion.image (null = render placeholder)
 * ========================================================================== */

export interface ProductListingItem {
    id: string;
    name: string;
    short_description: string;
    image: string | null;
}

/* ============================================================================
 * ProductListingResponse
 * Mirrors backend: src/meilisearch/models/ProductListingResponse.ts
 * Response envelope for GET /api/products/search?query=...
 * Wrapped inside { success: true, data: ProductListingResponse }
 * ========================================================================== */

export interface ProductListingResponse {
    query: string;
    processingTimeMs: number;
    estimatedTotalHits: number;
    items: ProductListingItem[];
}

/* ============================================================================
 * Product Search Service
 * ========================================================================== */

export class ProductSearchService {

    /**
     * ------------------------------------------------------------------------
     * Product Autocomplete
     * ------------------------------------------------------------------------
     * Backend endpoint: GET /api/products/autocomplete?query=<term>
     * Backend query param: "query" (NOT "q")
     * Backend response envelope:
     *   {
     *     success: true,
     *     data: {
     *       query: string,
     *       processingTimeMs: number,
     *       estimatedTotalHits: number,
     *       items: AutocompleteItem[]   ← only { name } per item
     *     }
     *   }
     */
    static async autocomplete(
        query: string,
        signal?: AbortSignal
    ): Promise<AutocompleteItem[]> {

        if (!query.trim()) {
            return [];
        }

        const response = await fetch(
            `${API_URL}/api/products/autocomplete?query=${encodeURIComponent(query)}`,
            { signal }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch product autocomplete.");
        }

        const envelope = await response.json() as {
            success: boolean;
            data: {
                query: string;
                processingTimeMs: number;
                estimatedTotalHits: number;
                items: AutocompleteItem[];
            };
        };

        return envelope.data?.items ?? [];
    }

    /**
     * ------------------------------------------------------------------------
     * Product Full Search (Listing)
     * ------------------------------------------------------------------------
     * Backend endpoint: GET /api/products/search?query=<term>&limit=<n>&offset=<n>
     * Backend query param: "query" (NOT "q" — controller reads req.query.query)
     * Backend response envelope:
     *   {
     *     success: true,
     *     data: ProductListingResponse {
     *       query: string,
     *       processingTimeMs: number,
     *       estimatedTotalHits: number,
     *       items: ProductListingItem[]
     *     }
     *   }
     *
     * Returns ProductListingItem[] — never raw Meilisearch documents.
     */
    static async search(
        query: string,
        signal?: AbortSignal,
        limit: number = 20,
        offset: number = 0
    ): Promise<ProductListingItem[]> {

        if (!query.trim()) {
            return [];
        }

        const response = await fetch(
            `${API_URL}/api/products/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`,
            { signal }
        );

        if (!response.ok) {
            throw new Error("Failed to search products.");
        }

        const envelope = await response.json() as {
            success: boolean;
            data: ProductListingResponse;
        };

        return envelope.data?.items ?? [];

    }

}