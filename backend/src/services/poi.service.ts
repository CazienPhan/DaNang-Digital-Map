import sql from '../db';

export interface POIRecord {
  id: string;
  name: string;
  name_en: string | null;
  poi_type: string;
  dia_chi: string | null;
  lat: number;
  lng: number;
}

export class PoiService {
  /**
   * Retrieves all POIs from the database joined with their coordinates.
   */
  static async getAllPois(): Promise<POIRecord[]> {
    try {
      const result = await sql<POIRecord[]>`
        SELECT p.id, p.name, p.name_en, p.poi_type, p.dia_chi, g.lat, g.lng
        FROM poi.pois p
        JOIN poi.poi_geometries g ON g.poi_id = p.id
      `;
      return result;
    } catch (err: any) {
      console.error('Error fetching POIs from Supabase database:', err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }

  /**
   * Retrieves POIs within the boundaries of a given Web Mercator map tile.
   */
  static async getPoisByTile(x: number, y: number, zoom: number): Promise<POIRecord[]> {
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
      const result = await sql<POIRecord[]>`
        SELECT p.id, p.name, p.name_en, p.poi_type, p.dia_chi, g.lat, g.lng
        FROM poi.pois p
        JOIN poi.poi_geometries g ON g.poi_id = p.id
        WHERE g.lat >= ${latMinBound} AND g.lat <= ${latMaxBound}
          AND g.lng >= ${lngMinBound} AND g.lng <= ${lngMaxBound}
      `;
      return result;
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
          c.color_hex AS category_color_hex,
          b.nganh_hang,
          b.tam_gia,
          b.sdt,
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

      const business = (raw.nganh_hang || raw.sdt) ? {
        nganh_hang: raw.nganh_hang || null,
        sdt: raw.sdt || null
      } : null;

      const mediaRaw = Array.isArray(raw.media) ? raw.media : [];
      const media = mediaRaw.map((m: any) => ({
        media_type: m.media_type || null,
        url: m.url || null
      }));

      return {
        id: raw.id,
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
        media
      };
    } catch (err: any) {
      console.error(`Error querying POI details for ${id} from Supabase:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}

