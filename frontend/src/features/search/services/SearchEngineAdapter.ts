import type { SearchMode } from '../types/SearchMode';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import type { SearchEngine } from './SearchEngine';
import { Map4DSearchEngine } from './Map4DSearchEngine';
import { ProductSearchEngine } from './ProductSearchEngine';

/**
 * SearchEngineAdapter — Strategy Pattern gateway.
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ARCHITECTURE FREEZE (Phase 7.4)                            │
 * │  This is the ONLY class SearchBar depends on for search.    │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Responsibilities:
 *   1. Select the correct concrete SearchEngine based on the active mode.
 *   2. Expose a uniform autocomplete() / search() API to SearchBar.
 *   3. Forward locationBias per-call — adapter itself is stateless.
 *
 * Open/Closed Principle: adding a third engine requires one new class
 * and one new branch in the constructor. SearchBar never changes.
 *
 * SearchBar NEVER imports:
 *   SearchService, ProductSearchService, Map4DSearchEngine, ProductSearchEngine
 */
export class SearchEngineAdapter {
  private readonly engine: SearchEngine;

  constructor(mode: SearchMode) {
    if (mode === 'place') {
      this.engine = new Map4DSearchEngine();
    } else {
      this.engine = new ProductSearchEngine();
    }
  }

  /**
   * Autocomplete — always returns SearchSuggestion[] regardless of engine.
   * locationBias is forwarded to the engine per-call.
   */
  autocomplete(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    return this.engine.autocomplete(query, locationBias, signal);
  }

  /**
   * Full search — always returns SearchSuggestion[] regardless of engine.
   * locationBias is forwarded to the engine per-call.
   */
  search(
    query: string,
    locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    return this.engine.search(query, locationBias, signal);
  }
}
