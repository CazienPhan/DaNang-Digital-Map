import poiTypeMapping from './poiTypeMapping.json';

/**
 * Style resolution for OCOP/POI markers rendered on the Map4D map.
 *
 * Priority: category_icon_url (DB) > raw_type (source data tag) > poi_type (fixed
 * enum) > SDK default marker.
 *
 * 1. A category-specific icon coming from the database (poi_categories.icon_url,
 *    already resolved into `iconUrl` by the backend) always wins.
 * 2. Otherwise, if the POI's source `raw_type` tags contain one recognized in
 *    RAW_TYPE_TO_SDK_TYPE, use the SDK built-in icon for that tag.
 * 3. Otherwise, fall back to the SDK built-in icon for the fixed `poi_type` enum.
 * 4. Otherwise, no type/icon is set and the SDK renders its own default marker.
 *
 * Both mapping tables below are synced from shared/poiTypeMapping.json — do not
 * edit poiTypeMapping.json in this folder directly, edit the shared source and
 * run `node scripts/sync-poi-type-mapping.js` from the repo root (the backend
 * copy in backend/src/config feeds the same zoom-tier declutter filter, see
 * poi.service.ts's getPoiTier/TIER_2_MIN_ZOOM/TIER_3_MIN_ZOOM).
 */

export type PoiType =
  | 'TOURISM'
  | 'RESTAURANT'
  | 'OCOP_STORE'
  | 'HOTEL'
  | 'MARKET'
  | 'OTHER'
  | 'UNVERIFIED';

export interface PoiStyleInput {
  poi_type: string;
  iconUrl?: string | null;
  category_color_hex?: string | null;
  raw_type?: string[] | null;
}

export interface PoiStyle {
  icon?: string;
  color?: string;
  type?: string;
}

// Map4D SDK built-in POI `type` values, used only as a fallback when the POI's
// category has no custom icon_url in the database. poi_type not listed here
// (TOURISM, OCOP_STORE, OTHER, UNVERIFIED) render with the SDK's default marker.
export const POI_TYPE_TO_SDK_TYPE: Partial<Record<PoiType, string>> = poiTypeMapping.POI_TYPE_TO_SDK_TYPE;

// Source data tags (e.g. from the crawl pipeline's raw_type array) mapped to
// Map4D SDK built-in `type` values. Only used when category_icon_url is absent.
// Declaration order is the match priority: the first key present in a POI's
// raw_type array wins, regardless of that tag's position within the array.
// The SDK does not publicly document its full supported type list, so an
// unmatched/unsupported tag is expected and simply falls through — no error.
export const RAW_TYPE_TO_SDK_TYPE: Record<string, string> = poiTypeMapping.RAW_TYPE_TO_SDK_TYPE;

function matchRawType(rawType: string[] | null | undefined): string | undefined {
  if (!rawType || rawType.length === 0) {
    return undefined;
  }
  const tags = new Set(rawType);
  for (const tag of Object.keys(RAW_TYPE_TO_SDK_TYPE)) {
    if (tags.has(tag)) {
      return RAW_TYPE_TO_SDK_TYPE[tag];
    }
  }
  return undefined;
}

export function resolvePoiStyle(poi: PoiStyleInput): PoiStyle {
  const color = poi.category_color_hex || undefined;

  if (poi.iconUrl) {
    return { icon: poi.iconUrl, color };
  }

  const rawTypeMatch = matchRawType(poi.raw_type);
  if (rawTypeMatch) {
    return { type: rawTypeMatch, color };
  }

  const type = POI_TYPE_TO_SDK_TYPE[poi.poi_type as PoiType];
  return { type, color };
}
