import type { SearchSuggestion } from '../types/SearchSuggestion';

/**
 * GeoSearchContext — geographic context for full search filtering.
 *
 * Passed from SearchBar to the engine on full search (Enter key) only.
 * Contains the user's GPS coordinates and the current map viewport bounds.
 *
 * This context is used by the backend to determine the appropriate
 * geographic filter (_geoRadius or _geoBoundingBox).
 *
 * Autocomplete does NOT use this context.
 */
export interface GeoSearchContext {
  /** User's current GPS coordinates (if available). */
  userGps?: { lat: number; lng: number };
  /** Current map viewport bounding box (if available). */
  bounds?: {
    ne: { lat: number; lng: number };
    sw: { lat: number; lng: number };
  };
}

/**
 * SearchEngine — the Dependency Inversion boundary.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ARCHITECTURE FREEZE (Phase 7.4)                            │
 * │  This interface is permanently frozen.                      │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Rules:
 *   - Both methods always return SearchSuggestion[] — never provider types
 *   - locationBias is passed per-call so the adapter remains stateless
 *   - Adding a new engine requires implementing this interface only
 *   - SearchBar never references any concrete implementation
 */
export interface SearchEngine {
  /**
   * Returns lightweight autocomplete suggestions for the dropdown.
   * Always resolves to SearchSuggestion[] regardless of provider.
   */
  autocomplete(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]>;

  /**
   * Performs a full search (Enter key → listing panel).
   * Always resolves to SearchSuggestion[] regardless of provider.
   *
   * @param geoContext — optional geographic context for geo-filtered search.
   *   Only used by PlaceSearchEngine for full search. ProductSearchEngine
   *   and autocomplete calls ignore this parameter.
   */
  search(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
    geoContext?: GeoSearchContext,
  ): Promise<SearchSuggestion[]>;
}
