import { PlaceSearchService } from '@/services/meilisearch/placeSearch.service';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import { SearchSuggestionMapper } from './SearchSuggestionMapper';
import type { SearchEngine, GeoSearchContext } from './SearchEngine';

/**
 * PlaceSearchEngine — composite SearchEngine for Place Search.
 *
 * Orchestrates:
 *   autocomplete() → Meilisearch ONLY (no Map4D)
 *   search()       → Meilisearch first → Map4D fallback if zero results
 *
 * The fallback logic is encapsulated here so SearchBar remains
 * completely provider-agnostic. SearchBar only calls:
 *   adapter.autocomplete(...)
 *   adapter.search(...)
 *
 * locationBias is accepted per-call to satisfy the SearchEngine interface.
 * It is forwarded to the backend for the Map4D fallback path (where Map4D
 * uses it for geographic relevance). The Meilisearch POI index does not
 * currently use geo-ranking — this is a documented limitation.
 */
export class PlaceSearchEngine implements SearchEngine {
  /**
   * Autocomplete: Meilisearch POI index ONLY → SearchSuggestion[]
   *
   * Map4D is NOT called for autocomplete. If Meilisearch returns
   * zero results, the dropdown simply shows no suggestions.
   */
  async autocomplete(
    query: string,
    _locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const response = await PlaceSearchService.autocomplete(query, signal);
    return SearchSuggestionMapper.fromPlaceItems(response.items);
  }

  /**
   * Full search: Meilisearch first → Map4D fallback → SearchSuggestion[]
   *
   * The backend /api/places/search endpoint handles the fallback internally:
   *   - If Meilisearch has results → returns them (source: "meilisearch")
   *   - If Meilisearch has zero results → calls Map4D → returns those (source: "map4d")
   *
   * The `source` field in the response is preserved in `original` so the
   * selection handler can distinguish internal POIs from Map4D results.
   *
   * geoContext provides the user's GPS coordinates and map viewport bounds
   * for geographic filtering (category-aware _geoRadius / _geoBoundingBox).
   * This context is forwarded to the backend via query parameters.
   */
  async search(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
    geoContext?: GeoSearchContext,
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const response = await PlaceSearchService.search(query, locationBias, signal, 20, 0, geoContext);
    return SearchSuggestionMapper.fromPlaceItems(response.items, response.source);
  }
}

