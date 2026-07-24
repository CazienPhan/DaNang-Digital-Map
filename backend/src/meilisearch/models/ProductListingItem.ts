/**
 * ProductListingItem — REST DTO for the product full-search listing.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Anti-Corruption Layer                                      │
 * │  This DTO is the ONLY shape the /api/products/search        │
 * │  endpoint exposes to the frontend.                          │
 * │  The internal Meilisearch document (ProductSearchDocument)  │
 * │  must never be serialised directly into a REST response.    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Fields:
 *   id               — stable document identifier (Meilisearch primary key)
 *   name             — product display name (maps to SearchSuggestion.title)
 *   short_description— one-line description (maps to SearchSuggestion.description)
 *   image            — optional thumbnail URL; null until images are indexed
 */
export interface ProductListingItem {
    id: string;
    name: string;
    short_description: string;
    image: string | null;
}
