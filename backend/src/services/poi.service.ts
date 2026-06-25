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
   * Retrieves full details for a single POI by ID, joining geometries, categories,
   * business details, tourism details, and aggregating related media files.
   */
  static async getPoiDetails(id: string): Promise<any> {
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
        WHERE p.id = ${id}
      `;
      if (result.length === 0) {
        return null;
      }
      return result[0];
    } catch (err: any) {
      console.error(`Error querying POI details for ${id} from Supabase:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}

