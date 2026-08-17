/**
 * ============================================================================
 * Place Search Service
 * ----------------------------------------------------------------------------
 * Responsibility:
 * - Communicate with Place Search Backend APIs.
 * - Hide all HTTP implementation details.
 * - SearchBar / Hooks never know Backend implementation.
 *
 * Architecture:
 *
 * SearchBar
 *      ↓
 * SearchEngineAdapter → PlaceSearchEngine
 *      ↓
 * PlaceSearchService
 *      ↓
 * Backend REST API
 *      ↓
 * Meilisearch (+ Map4D fallback on backend)
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
 * PlaceAutocompleteItem
 * Matches the backend PoiListingItem model.
 * Used for both autocomplete and full search results.
 *
 * Response envelope:
 *   GET /api/places/autocomplete?query=...
 *   GET /api/places/search?query=...
 *   → { success, data: { query, processingTimeMs, estimatedTotalHits, items, source } }
 * ========================================================================== */

export interface PlaceListingItem {
    id: string;
    name: string;
    dia_chi: string;
    lat: number;
    lng: number;
}

/* ============================================================================
 * PlaceListingResponse
 * Mirrors backend: PoiListingResponse
 * Response envelope for both autocomplete and search.
 * ========================================================================== */

export interface PlaceListingResponse {
    query: string;
    processingTimeMs: number;
    estimatedTotalHits: number;
    items: PlaceListingItem[];
    source: 'meilisearch' | 'map4d';
}

/* ============================================================================
 * Place Search Service
 * ========================================================================== */

export class PlaceSearchService {

    /**
     * ------------------------------------------------------------------------
     * Place Autocomplete
     * ------------------------------------------------------------------------
     * Backend endpoint: GET /api/places/autocomplete?query=<term>
     * Meilisearch ONLY — no Map4D fallback.
     *
     * Returns PlaceListingItem[] for the dropdown.
     */
    static async autocomplete(
        query: string,
        signal?: AbortSignal
    ): Promise<PlaceListingResponse> {

        if (!query.trim()) {
            return {
                query: '',
                processingTimeMs: 0,
                estimatedTotalHits: 0,
                items: [],
                source: 'meilisearch',
            };
        }

        const response = await fetch(
            `${API_URL}/api/places/autocomplete?query=${encodeURIComponent(query)}`,
            { signal }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch place autocomplete.");
        }

        const envelope = await response.json() as {
            success: boolean;
            data: PlaceListingResponse;
        };

        return envelope.data ?? {
            query,
            processingTimeMs: 0,
            estimatedTotalHits: 0,
            items: [],
            source: 'meilisearch',
        };
    }

    /**
     * ------------------------------------------------------------------------
     * Place Full Search (Listing)
     * ------------------------------------------------------------------------
     * Backend endpoint: GET /api/places/search?query=<term>&location=<lat,lng>
     * Backend performs: Meilisearch first → Map4D fallback if zero results.
     *
     * Returns PlaceListingResponse with `source` indicating the provider.
     */
    static async search(
        query: string,
        location?: string,
        signal?: AbortSignal,
        limit: number = 20,
        offset: number = 0
    ): Promise<PlaceListingResponse> {

        if (!query.trim()) {
            return {
                query: '',
                processingTimeMs: 0,
                estimatedTotalHits: 0,
                items: [],
                source: 'meilisearch',
            };
        }

        let url = `${API_URL}/api/places/search?query=${encodeURIComponent(query)}&limit=${limit}&offset=${offset}`;
        if (location) {
            url += `&location=${encodeURIComponent(location)}`;
        }

        const response = await fetch(url, { signal });

        if (!response.ok) {
            throw new Error("Failed to search places.");
        }

        const envelope = await response.json() as {
            success: boolean;
            data: PlaceListingResponse;
        };

        return envelope.data ?? {
            query,
            processingTimeMs: 0,
            estimatedTotalHits: 0,
            items: [],
            source: 'meilisearch',
        };
    }

}
