import { ProductSearchService } from '@/services/meilisearch/productSearch.service';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import { SearchSuggestionMapper } from './SearchSuggestionMapper';
import type { SearchEngine } from './SearchEngine';

/**
 * ProductSearchEngine — concrete SearchEngine implementation for products.
 *
 * Single responsibility:
 *   Delegate to ProductSearchService (Backend REST → Meilisearch) and convert
 *   all results to SearchSuggestion[] via SearchSuggestionMapper.
 *
 * locationBias is accepted per-call but intentionally ignored — product
 * search has no geographic component. The parameter exists only to satisfy
 * the SearchEngine interface contract.
 *
 * Autocomplete vs Search:
 *   autocomplete() → /api/products/autocomplete → AutocompleteItem[] (name only)
 *   search()       → /api/products/search       → ProductListingItem[] (full listing data)
 *   Each uses the appropriate mapper method.
 */
export class ProductSearchEngine implements SearchEngine {
  /**
   * Autocomplete: AutocompleteItem[] → SearchSuggestion[]
   *
   * The backend autocomplete endpoint returns lightweight { name } items.
   * The mapper converts these to SearchSuggestion using name as both id and title.
   */
  async autocomplete(
    query: string,
    _locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const items = await ProductSearchService.autocomplete(query, signal);
    return SearchSuggestionMapper.fromAutocompleteItems(items);
  }

  /**
   * Full product search: ProductListingItem[] → SearchSuggestion[]
   *
   * Calls the dedicated /api/products/search endpoint which returns rich
   * ProductListingItem objects (id, name, short_description, image).
   * The mapper converts these into the frozen SearchSuggestion DTO so the
   * shared SearchListing / SearchListingCard UI can render them without
   * any knowledge of the product domain.
   */
  async search(
    query: string,
    _locationBias?: string,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> {
    if (!query.trim()) return [];

    const items = await ProductSearchService.search(query, signal);
    return SearchSuggestionMapper.fromProducts(items);
  }
}
