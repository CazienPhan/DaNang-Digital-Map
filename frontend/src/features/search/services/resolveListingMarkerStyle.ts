import { MAP4D_CONFIG } from '@/config/map.config';
import { resolvePoiStyle } from '@/features/map/config/mapCategoryConfig';
import type { SearchSuggestion } from '../types/SearchSuggestion';

/**
 * How a search-listing item's marker should render on the map, resolved
 * against the app's own curated DB POI styling (Tier 1 custom icon_url,
 * Tier 2/3 SDK built-in `type`, or no DB match at all).
 */
export type ListingMarkerStyle =
  | { kind: 'icon-url'; icon: string; color?: string }
  | { kind: 'map4d-type'; type: string; color?: string }
  | { kind: 'none' };

/**
 * Resolves a place SearchSuggestion's DB marker style.
 *
 * Only suggestions whose `original.source === 'meilisearch'` are real
 * Supabase POIs (id === POI id) — see PlaceSearchEngine/SearchSuggestionMapper.
 * Map4D-fallback results (source === 'map4d') mean Meilisearch found zero
 * DB matches for the query text, so they are always treated as 'none'.
 */
export async function resolveListingMarkerStyle(
  suggestion: SearchSuggestion,
  signal?: AbortSignal,
): Promise<ListingMarkerStyle> {
  if (suggestion.type !== 'place' || !suggestion.location) {
    return { kind: 'none' };
  }

  const original = suggestion.original as { source?: string } | undefined;
  if (original?.source !== 'meilisearch') {
    return { kind: 'none' };
  }

  try {
    const res = await fetch(`${MAP4D_CONFIG.backendUrl}/api/pois/${suggestion.id}`, { signal });
    if (!res.ok) return { kind: 'none' };

    const body = await res.json();
    const data = body?.poi;
    if (!data) return { kind: 'none' };

    const style = resolvePoiStyle({
      poi_type: data.poi_type,
      iconUrl: data.iconUrl,
      category_color_hex: data.category?.color_hex ?? null,
      raw_type: null,
    });

    if (style.icon) return { kind: 'icon-url', icon: style.icon, color: style.color };
    if (style.type) return { kind: 'map4d-type', type: style.type, color: style.color };
    return { kind: 'none' };
  } catch {
    return { kind: 'none' };
  }
}

/** Resolves marker styles for a batch of listing results in parallel. */
export async function resolveListingMarkerStyles(
  suggestions: SearchSuggestion[],
  signal?: AbortSignal,
): Promise<Map<string, ListingMarkerStyle>> {
  const entries = await Promise.all(
    suggestions.map(async (s) => [s.id, await resolveListingMarkerStyle(s, signal)] as const),
  );
  return new Map(entries);
}
