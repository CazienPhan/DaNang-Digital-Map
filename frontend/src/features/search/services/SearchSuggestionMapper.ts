import type { PlaceSuggestion } from '@/services/map4d/search.service';
import type {
  AutocompleteItem,
  ProductListingItem,
} from '@/services/meilisearch/productSearch.service';
import type { SearchSuggestion } from '../types/SearchSuggestion';

/**
 * SearchSuggestionMapper
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  ARCHITECTURE FREEZE (Phase 7.4)                            │
 * │  This is the ONLY place that converts provider types to     │
 * │  SearchSuggestion. No UI component may perform this         │
 * │  conversion. No engine may skip the mapper.                 │
 * └─────────────────────────────────────────────────────────────┘
 *
 * Rules:
 *   ✅ Pure functions — no side effects
 *   ✅ No React, no hooks, no state
 *   ✅ No UI logic, no rendering
 *   ✅ No network calls
 *   ✅ One direction only: provider DTO → SearchSuggestion
 */
export class SearchSuggestionMapper {
  /**
   * Maps a Map4D PlaceSuggestion to the frozen SearchSuggestion DTO.
   *
   * title       = place name
   * description = address (secondary display line)
   * location    = coordinates (moves the map marker on selection)
   * original    = raw PlaceSuggestion (used by onSelectPlace callback)
   */
  static fromPlace(place: PlaceSuggestion): SearchSuggestion {
    return {
      id: place.id,
      type: 'place',
      title: place.name,
      description: place.address ?? '',
      location: place.location,
      original: place,
    };
  }

  /**
   * Maps a backend AutocompleteItem to the frozen SearchSuggestion DTO.
   *
   * The /api/products/autocomplete endpoint returns lightweight items
   * with only { name } — no id, slug, or category.
   *
   * title       = product name
   * description = '' (no category available from autocomplete endpoint)
   * id          = name (stable for React key — each name is unique in dropdown)
   * location    = absent (products have no coordinates)
   * original    = raw AutocompleteItem
   */
  static fromAutocompleteItem(item: AutocompleteItem): SearchSuggestion {
    return {
      id: item.name,
      type: 'product',
      title: item.name,
      description: '',
      original: item,
    };
  }

  /**
   * Maps a backend ProductListingItem to the frozen SearchSuggestion DTO.
   * Used by the full search endpoint which returns rich listing objects.
   *
   * title       = product name          (ProductListingItem.name)
   * description = short_description     (ProductListingItem.short_description)
   * image       = thumbnail URL or undefined (null → undefined for the card)
   * location    = absent (products have no coordinates)
   * original    = raw ProductListingItem (available for Phase 8 product detail)
   */
  static fromProduct(product: ProductListingItem): SearchSuggestion {
    return {
      id: product.id,
      type: 'product',
      title: product.name,
      description: product.short_description ?? '',
      image: product.image ?? undefined,
      original: product,
    };
  }

  /** Convenience: map an array of PlaceSuggestions. */
  static fromPlaces(places: PlaceSuggestion[]): SearchSuggestion[] {
    return places.map(SearchSuggestionMapper.fromPlace);
  }

  /** Convenience: map an array of AutocompleteItems (autocomplete endpoint). */
  static fromAutocompleteItems(items: AutocompleteItem[]): SearchSuggestion[] {
    return items.map(SearchSuggestionMapper.fromAutocompleteItem);
  }

  /** Convenience: map an array of ProductListingItems (full search endpoint). */
  static fromProducts(
    products: ProductListingItem[]
  ): SearchSuggestion[] {

    return products.map(
      SearchSuggestionMapper.fromProduct
    );

  }
}
