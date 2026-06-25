import { MAP4D_CONFIG } from '../config/map.config';

export interface POIData {
  id: string;
  name: string;
  name_en: string | null;
  poi_type: string; // TOURISM, OCOP_STORE, MARKET
  dia_chi: string | null;
  lat: number;
  lng: number;
}

export interface POIMediaItem {
  id: string;
  poi_id: string;
  media_type: 'IMAGE' | 'VIDEO';
  url: string;
  caption: string | null;
  is_primary: boolean;
  created_at: string;
}

export interface POIDetailData extends POIData {
  business_id: string | null;
  category_id: number;
  address_type: string | null;
  dia_chi_en: string | null;
  source_name: string | null;
  source_url: string | null;
  is_active: boolean | null;
  is_verified: boolean | null;
  gio_mo_cua: Record<string, string> | null;
  website: string[] | null;
  so_sao: number | null;
  luot_danh_gia: number | null;
  category_name: string | null;
  category_color_hex: string | null;
  nganh_hang: string | null;
  tam_gia: string | null;
  sdt: string | null;
  gioi_thieu: string | null;
  gioi_thieu_en: string | null;
  nam_xay_dung: number | null;
  don_vi_quan_ly: string | null;
  gia_ve: string | null;
  media: POIMediaItem[] | null;
}

export class PoiClientService {
  /**
   * Fetches all real POIs from the backend database endpoint.
   */
  static async getPOIs(): Promise<POIData[]> {
    try {
      const response = await fetch(`${MAP4D_CONFIG.backendUrl}/api/pois`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.status === 'OK' && Array.isArray(data.pois)) {
        return data.pois;
      }
      throw new Error(data.message || 'Malformed POI response from server');
    } catch (error) {
      console.error('Failed to load POIs from backend:', error);
      throw error;
    }
  }

  /**
   * Fetches full detailed information for a single POI.
   */
  static async getPOIDetails(id: string): Promise<POIDetailData> {
    try {
      const response = await fetch(`${MAP4D_CONFIG.backendUrl}/api/pois/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('POI details not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.status === 'OK' && data.poi) {
        return data.poi;
      }
      throw new Error(data.message || 'Malformed POI details response from server');
    } catch (error) {
      console.error(`Failed to load POI details for ${id}:`, error);
      throw error;
    }
  }
}

export default PoiClientService;

