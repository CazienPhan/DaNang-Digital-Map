import sql from '../db';
import poiTypeMapping from '../config/poiTypeMapping.json';

// Synced from shared/poiTypeMapping.json — see scripts/sync-poi-type-mapping.js.
// Used to rank POIs into declutter tiers for the zoom-based filter below.
const STYLED_RAW_TYPES = new Set(Object.keys(poiTypeMapping.RAW_TYPE_TO_SDK_TYPE));
const STYLED_POI_TYPES = new Set(Object.keys(poiTypeMapping.POI_TYPE_TO_SDK_TYPE));

// Generic linear interpolation between zoom-keyed anchor points. Used for
// every "smoothly ramp this number up as zoom increases" table below, so
// zoom-in/out never causes a sudden jump — just intermediate values.
function interpolateByZoom<K extends string>(
  anchors: Array<{ zoom: number } & Record<K, number>>,
  zoom: number,
  key: K
): number {
  if (zoom <= anchors[0].zoom) return anchors[0][key];
  for (let i = 1; i < anchors.length; i++) {
    const prev = anchors[i - 1];
    const curr = anchors[i];
    if (zoom <= curr.zoom) {
      const t = (zoom - prev.zoom) / (curr.zoom - prev.zoom);
      return prev[key] + t * (curr[key] - prev[key]);
    }
  }
  return anchors[anchors.length - 1][key];
}

// Tier 1 (marker_url) is capped *exactly* on the frontend, by total count
// actually visible on screen — see TIER1_TOTAL_CAP_ANCHORS in
// MapContainer.tsx, which fetches every tile in the viewport itself and
// can slice to an exact total. This backend number is just a safety
// ceiling per tile so one pathologically dense tile can't blow up the
// response while the frontend hasn't applied its total cap yet.
const TIER1_SAFETY_CAP_PER_TILE = 300;

// Tier 2/3 are rendered through POIOverlay, which the Map4D SDK drives
// internally (it decides which tiles to fetch and when) — a single tile
// request on the backend has no way to know how many tiles make up the
// current viewport, so it can't cap by an exact on-screen total the way
// tier 1 does. Instead we approximate: pick the desired total visible on
// screen (anchors below), divide by an assumed average tile count per
// viewport, and use that as the per-tile cap. ASSUMED_TILES_PER_VIEWPORT
// is a rough estimate for a typical browser window (~1400x900 at 256px
// tiles is roughly 6x4 tiles plus partial edge tiles) — if tier 2/3 is
// consistently over/under the numbers below, tune this constant first.
const ASSUMED_TILES_PER_VIEWPORT = 20;

const ZOOM_TIER23_TOTAL_ANCHORS: Array<{ zoom: number; total: number }> = [
  { zoom: 0, total: 15 },
  { zoom: 10, total: 20 },
  { zoom: 12, total: 25 },
  { zoom: 14, total: 30 },
  { zoom: 16, total: 35 },
  { zoom: 18, total: 40 }
];

function getTier23CapPerTile(zoom: number): number {
  const total = interpolateByZoom(ZOOM_TIER23_TOTAL_ANCHORS, zoom, 'total');
  return Math.max(1, Math.round(total / ASSUMED_TILES_PER_VIEWPORT));
}

// Split of the tier 2/3 per-tile cap between tier 2 (SDK built-in icon)
// and tier 3 (default teardrop) — tier3Share is always the remainder.
const ZOOM_TIER2_SHARE_ANCHORS: Array<{ zoom: number; tier2Share: number }> = [
  { zoom: 0, tier2Share: 0.8 },
  { zoom: 10, tier2Share: 0.8 },
  { zoom: 12, tier2Share: 0.8 },
  { zoom: 14, tier2Share: 0.8 },
  { zoom: 16, tier2Share: 0.8 },
  { zoom: 18, tier2Share: 0.8 }
];

function getTier2Share(zoom: number): number {
  return interpolateByZoom(ZOOM_TIER2_SHARE_ANCHORS, zoom, 'tier2Share');
}

// Fills up to `cap` rows from the tier 2/3 pools per the tier2/tier3
// split. Whatever tier 2's pool can't fill spills forward into tier 3, so
// the cap is still used fully whenever enough POIs exist across both.
function fillTier23<T>(pools: { tier2: T[]; tier3: T[] }, cap: number, tier2Share: number): T[] {
  const tier2Target = Math.round(cap * tier2Share);
  const tier2Take = Math.min(tier2Target, pools.tier2.length);
  const tier3Target = Math.max(0, cap - tier2Take);
  const tier3Take = Math.min(tier3Target, pools.tier3.length);

  return [...pools.tier2.slice(0, tier2Take), ...pools.tier3.slice(0, tier3Take)];
}

function getPoiTier(poi: {
  category_icon_url?: string | null;
  raw_type?: string[] | null;
  poi_type: string;
}): 1 | 2 | 3 {
  if (poi.category_icon_url) {
    return 1;
  }
  if (poi.raw_type && poi.raw_type.some((tag) => STYLED_RAW_TYPES.has(tag))) {
    return 2;
  }
  if (STYLED_POI_TYPES.has(poi.poi_type)) {
    return 2;
  }
  return 3;
}

export interface POIRecord {
  id: string;
  name: string;
  name_en: string | null;
  poi_type: string;
  dia_chi: string | null;
  lat: number;
  lng: number;
  iconUrl?: string | null;
  icon?: string | null;
  iconSource?: 'database' | 'category' | 'default';
  category_name?: string | null;
  category_name_en?: string | null;
  category_icon_url?: string | null;
  category_color_hex?: string | null;
  raw_type?: string[] | null;
}

export class PoiService {
  /**
   * Retrieves all POIs from the database joined with their coordinates.
   */
  static async getAllPois(): Promise<POIRecord[]> {
    try {
      const result = await sql`
        SELECT 
          p.id, 
          p.name,
          p.name_en,
          p.poi_type,
          p.dia_chi,
          p.raw_type,
          g.lat,
          g.lng,
          c.name AS category_name,
          c.name_en AS category_name_en,
          c.icon_url AS category_icon_url,
          c.color_hex AS category_color_hex
        FROM poi.pois p
        JOIN poi.poi_geometries g ON g.poi_id = p.id
        LEFT JOIN poi.poi_categories c ON c.id = p.category_id
      `;
      return result.map((raw: any) => {
        const categoryName = raw.category_name || '';
        const categoryNameEn = raw.category_name_en || '';
        const isOcop = categoryName === 'Sản phẩm OCOP' || categoryNameEn === 'OCOP Products';

        let iconUrl: string | null = null;
        let icon: string | null = null;
        let iconSource: 'database' | 'category' | 'default' = 'default';

        if (isOcop) {
          iconUrl = raw.category_icon_url || null;
          iconSource = 'category';
        } else if (raw.category_icon_url) {
          iconUrl = raw.category_icon_url;
          iconSource = 'category';
        }

        return {
          id: raw.id,
          name: raw.name,
          name_en: raw.name_en || null,
          poi_type: raw.poi_type,
          dia_chi: raw.dia_chi || null,
          lat: Number(raw.lat),
          lng: Number(raw.lng),
          iconUrl,
          icon,
          iconSource,
          category_name: raw.category_name || null,
          category_name_en: raw.category_name_en || null,
          category_icon_url: raw.category_icon_url || null,
          category_color_hex: raw.category_color_hex || null,
          raw_type: raw.raw_type || null
        };
      });
    } catch (err: any) {
      console.error('Error fetching POIs from Supabase database:', err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }

  /**
   * Retrieves POIs within the boundaries of a given Web Mercator map tile.
   *
   * `categories`, when provided, restricts results to 'place' (everything
   * except OCOP stores) and/or 'ocop' (OCOP_STORE only). An empty array means
   * no category is selected, so no POIs should be returned. Omitting the
   * parameter entirely preserves the unfiltered (show-all) behavior.
   */
  static async getPoisByTile(
    x: number,
    y: number,
    zoom: number,
    categories?: Array<'place' | 'ocop'>
  ): Promise<POIRecord[]> {
    if (categories && categories.length === 0) {
      return [];
    }

    const includesPlace = !categories || categories.includes('place');
    const includesOcop = !categories || categories.includes('ocop');
    const categoryFilter = includesPlace && includesOcop
      ? sql``
      : includesOcop
        ? sql`AND p.poi_type = 'OCOP_STORE'`
        : sql`AND p.poi_type != 'OCOP_STORE'`;

    const n = Math.pow(2, zoom);
    const lngMin = (x / n) * 360 - 180;
    const lngMax = ((x + 1) / n) * 360 - 180;

    const latMinRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * (y + 1) / n)));
    const latMaxRad = Math.atan(Math.sinh(Math.PI * (1 - 2 * y / n)));

    const latMin = (latMinRad * 180) / Math.PI;
    const latMax = (latMaxRad * 180) / Math.PI;

    const latMinBound = Math.min(latMin, latMax);
    const latMaxBound = Math.max(latMin, latMax);
    const lngMinBound = Math.min(lngMin, lngMax);
    const lngMaxBound = Math.max(lngMin, lngMax);

    try {
      const result = await sql`
        SELECT
          p.id,
          p.name,
          p.name_en,
          p.poi_type,
          p.dia_chi,
          p.raw_type,
          g.lat,
          g.lng,
          c.name AS category_name,
          c.name_en AS category_name_en,
          c.icon_url AS category_icon_url,
          c.color_hex AS category_color_hex
        FROM poi.pois p
        JOIN poi.poi_geometries g ON g.poi_id = p.id
        LEFT JOIN poi.poi_categories c ON c.id = p.category_id
        WHERE g.lat >= ${latMinBound} AND g.lat <= ${latMaxBound}
          AND g.lng >= ${lngMinBound} AND g.lng <= ${lngMaxBound}
          ${categoryFilter}
      `;
      const pools = { tier1: [] as any[], tier2: [] as any[], tier3: [] as any[] };
      result.forEach((raw: any) => {
        const tier = getPoiTier({
          category_icon_url: raw.category_icon_url || null,
          raw_type: raw.raw_type || null,
          poi_type: raw.poi_type
        });
        (tier === 1 ? pools.tier1 : tier === 2 ? pools.tier2 : pools.tier3).push(raw);
      });
      // Tier 1: safety ceiling only — the frontend applies the real,
      // exact total-on-screen cap itself once it has collected every
      // tile in the viewport.
      const tier1Rows = pools.tier1.slice(0, TIER1_SAFETY_CAP_PER_TILE);
      // Tier 2/3: approximate per-tile cap derived from a desired total
      // on-screen count (see comments above ASSUMED_TILES_PER_VIEWPORT).
      const tier23Rows = fillTier23(pools, getTier23CapPerTile(zoom), getTier2Share(zoom));
      const rows = [...tier1Rows, ...tier23Rows];

      return rows.map((raw: any) => {
        const categoryName = raw.category_name || '';
        const categoryNameEn = raw.category_name_en || '';
        const isOcop = categoryName === 'Sản phẩm OCOP' || categoryNameEn === 'OCOP Products';

        let iconUrl: string | null = null;
        let icon: string | null = null;
        let iconSource: 'database' | 'category' | 'default' = 'default';

        if (isOcop) {
          iconUrl = raw.category_icon_url || null;
          iconSource = 'category';
        } else if (raw.category_icon_url) {
          iconUrl = raw.category_icon_url;
          iconSource = 'category';
        }

        return {
          id: raw.id,
          name: raw.name,
          name_en: raw.name_en || null,
          poi_type: raw.poi_type,
          dia_chi: raw.dia_chi || null,
          lat: Number(raw.lat),
          lng: Number(raw.lng),
          iconUrl,
          icon,
          iconSource,
          category_name: raw.category_name || null,
          category_name_en: raw.category_name_en || null,
          category_icon_url: raw.category_icon_url || null,
          category_color_hex: raw.category_color_hex || null,
          raw_type: raw.raw_type || null
        };
      });
    } catch (err: any) {
      console.error(`Error fetching POIs for tile ${x}/${y}/${zoom} from Supabase:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }

  /**
   * Retrieves full details for a single POI by ID, joining geometries, categories,
   * business details, tourism details, and aggregating related media files.
   */
  static async getPoiDetails(id: string): Promise<any> {
    const cleanId = id.startsWith('database-poi-') ? id.replace('database-poi-', '') : id;
    try {
      const result = await sql`
        SELECT 
          p.id,
          p.business_id,
          p.category_id,
          p.poi_type,
          p.address_type,
          p.name,
          p.name_en,
          p.dia_chi,
          p.dia_chi_en,
          p.source_name,
          p.source_url,
          p.is_active,
          p.is_verified,
          p.gio_mo_cua,
          p.website,
          p.so_sao,
          p.luot_danh_gia,
          g.lat,
          g.lng,
          c.name AS category_name,
          c.name_en AS category_name_en,
          c.icon_url AS category_icon_url,
          c.color_hex AS category_color_hex,
          b.nganh_hang,
          b.tam_gia,
          b.sdt,
          b.gioi_thieu AS business_gioi_thieu,
          t.gioi_thieu,
          t.gioi_thieu_en,
          t.nam_xay_dung,
          t.don_vi_quan_ly,
          t.gia_ve,
          (
            SELECT json_agg(m.*) 
            FROM poi.poi_media m 
            WHERE m.poi_id = p.id
          ) AS media
        FROM poi.pois p
        JOIN poi.poi_geometries g ON g.poi_id = p.id
        LEFT JOIN poi.poi_categories c ON c.id = p.category_id
        LEFT JOIN poi.poi_details_business b ON b.poi_id = p.id
        LEFT JOIN poi.poi_details_tourism t ON t.poi_id = p.id
        WHERE p.id = ${cleanId}
      `;
      if (result.length === 0) {
        return null;
      }
      
      const raw = result[0];
      
      const category = (raw.category_name || raw.category_color_hex) ? {
        name: raw.category_name || null,
        color_hex: raw.category_color_hex || null
      } : null;

      const tourism = (raw.gioi_thieu || raw.nam_xay_dung || raw.gia_ve) ? {
        gioi_thieu: raw.gioi_thieu || null,
        nam_xay_dung: raw.nam_xay_dung !== null && raw.nam_xay_dung !== undefined ? Number(raw.nam_xay_dung) : null,
        gia_ve: raw.gia_ve || null
      } : null;

      const business = (raw.nganh_hang || raw.sdt || raw.business_gioi_thieu) ? {
        nganh_hang: raw.nganh_hang || null,
        sdt: raw.sdt || null,
        gioi_thieu: raw.business_gioi_thieu || null,
      } : null;

      const mediaRaw = Array.isArray(raw.media) ? raw.media : [];
      const media = mediaRaw.map((m: any) => ({
        media_type: m.media_type || null,
        url: m.url || null
      }));

      const categoryName = raw.category_name || '';
      const categoryNameEn = raw.category_name_en || '';
      const isOcop = categoryName === 'Sản phẩm OCOP' || categoryNameEn === 'OCOP Products';

      let iconUrl: string | null = null;
      let icon: string | null = null;
      let iconSource: 'database' | 'category' | 'default' = 'default';

      if (isOcop) {
        iconUrl = raw.category_icon_url || null;
        iconSource = 'category';
      } else if (raw.category_icon_url) {
        iconUrl = raw.category_icon_url;
        iconSource = 'category';
      }

      return {
        id: raw.id,
        business_id: raw.business_id || null,
        name: raw.name || null,
        poi_type: raw.poi_type || null,
        dia_chi: raw.dia_chi || null,
        lat: raw.lat !== null && raw.lat !== undefined ? Number(raw.lat) : null,
        lng: raw.lng !== null && raw.lng !== undefined ? Number(raw.lng) : null,
        gio_mo_cua: raw.gio_mo_cua || null,
        website: raw.website || null,
        so_sao: raw.so_sao !== null && raw.so_sao !== undefined ? Number(raw.so_sao) : null,
        luot_danh_gia: raw.luot_danh_gia !== null && raw.luot_danh_gia !== undefined ? Number(raw.luot_danh_gia) : null,
        category,
        tourism,
        business,
        media,
        iconUrl,
        icon,
        iconSource
      };
    } catch (err: any) {
      console.error(`Error querying POI details for ${id} from Supabase:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}

