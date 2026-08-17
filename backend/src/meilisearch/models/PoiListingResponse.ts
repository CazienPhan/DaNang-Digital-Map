import { PoiListingItem } from "./PoiListingItem";

/**
 * PoiListingResponse — the complete REST envelope returned by
 * GET /api/places/search?query=...
 * GET /api/places/autocomplete?query=...
 *
 * This is the typed contract shared between:
 *   backend → PlaceSearchController / PlaceAutocompleteController
 *   frontend → PlaceSearchService
 *
 * The `source` field enables the frontend to distinguish whether results
 * came from the internal Meilisearch POI index or the Map4D fallback,
 * without leaking provider-specific knowledge into UI components.
 */
export interface PoiListingResponse {
    query: string;
    processingTimeMs: number;
    estimatedTotalHits: number;
    items: PoiListingItem[];
    source: "meilisearch" | "map4d";
}
