import { SearchService } from '@/services/map4d/search.service';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import { SearchSuggestionMapper } from './SearchSuggestionMapper';
import type { SearchEngine } from './SearchEngine';

/**
 * Map4DSearchEngine — concrete SearchEngine implementation for Map4D.
 *
 * Single responsibility:
 *   Delegate to SearchService (Map4D REST proxy) and convert
 *   all results to SearchSuggestion[] via SearchSuggestionMapper.
 *
 * locationBias is accepted per-call (not in the constructor) so the
 * adapter can remain stateless and SearchBar does not need to recreate
 * the adapter when the map center changes.
 */
export class Map4DSearchEngine implements SearchEngine {
  /**
   * Autocomplete: PlaceSuggestion[] → SearchSuggestion[]
   */
  async autocomplete(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const places = await SearchService.searchPlaces(query, locationBias, signal);
    return SearchSuggestionMapper.fromPlaces(places);
  }

  /**
   * Full search: PlaceSuggestion[] → SearchSuggestion[]
   * location is preserved in the mapped DTO so clicking a listing item
   * still moves the map marker.
   */
  async search(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const places = await SearchService.searchPlaces(query, locationBias, signal);
    return SearchSuggestionMapper.fromPlaces(places);
  }
}
