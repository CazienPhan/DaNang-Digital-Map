import type { SearchSuggestion } from '../types/SearchSuggestion';

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
   */
  search(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]>;
}
