/**
 * PoiListingItem — REST DTO for the POI/place search listing.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Anti-Corruption Layer                                      │
 * │  This DTO is the ONLY shape the /api/places/search and      │
 * │  /api/places/autocomplete endpoints expose to the frontend. │
 * │  The internal Meilisearch document (PoiSearchDocument)      │
 * │  must never be serialised directly into a REST response.    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Fields:
 *   id      — stable document identifier (Meilisearch primary key / Supabase POI id)
 *   name    — POI display name (maps to SearchSuggestion.title)
 *   dia_chi — POI address (maps to SearchSuggestion.description)
 *   lat     — latitude coordinate
 *   lng     — longitude coordinate
 */
export interface PoiListingItem {
    id: string;
    name: string;
    dia_chi: string;
    lat: number;
    lng: number;
}
