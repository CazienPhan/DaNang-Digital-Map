import { MAP4D_CONFIG } from '@/config/map.config';

export interface POIData {
  id: string;
  name: string;
  name_en: string | null;
  poi_type: string; // TOURISM, OCOP_STORE, MARKET
  dia_chi: string | null;
  lat: number;
  lng: number;
  iconUrl?: string | null;
  icon?: string | null;
  iconSource?: 'database' | 'category' | 'default';
  category_name?: string | null;
  category_name_en?: string | null;
  category_icon_url?: string | null;
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
    const cleanId = id.startsWith('database-poi-') ? id.replace('database-poi-', '') : id;
    try {
      const response = await fetch(`${MAP4D_CONFIG.backendUrl}/api/pois/${cleanId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('POI details not found');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && data.status === 'OK' && data.poi) {
        const p = data.poi;
        return {
          id: p.id,
          name: p.name,
          name_en: p.name_en || null,
          poi_type: p.poi_type,
          dia_chi: p.dia_chi || null,
          lat: p.lat || 0,
          lng: p.lng || 0,
          business_id: p.business_id || null,
          category_id: p.category_id || 0,
          address_type: p.address_type || null,
          dia_chi_en: p.dia_chi_en || null,
          source_name: p.source_name || null,
          source_url: p.source_url || null,
          is_active: p.is_active || null,
          is_verified: p.is_verified || null,
          gio_mo_cua: p.gio_mo_cua || null,
          website: p.website || null,
          so_sao: p.so_sao !== null && p.so_sao !== undefined ? Number(p.so_sao) : null,
          luot_danh_gia: p.luot_danh_gia !== null && p.luot_danh_gia !== undefined ? Number(p.luot_danh_gia) : null,
          category_name: p.category?.name || null,
          category_color_hex: p.category?.color_hex || null,
          nganh_hang: p.business?.nganh_hang || null,
          tam_gia: p.business?.tam_gia || null,
          sdt: p.business?.sdt || null,
          gioi_thieu: p.tourism?.gioi_thieu || null,
          gioi_thieu_en: p.tourism?.gioi_thieu_en || null,
          nam_xay_dung: p.tourism?.nam_xay_dung || null,
          don_vi_quan_ly: p.tourism?.don_vi_quan_ly || null,
          gia_ve: p.tourism?.gia_ve || null,
          media: p.media || null,
          iconUrl: p.iconUrl || null,
          icon: p.icon || null,
          iconSource: p.iconSource || 'default'
        } as POIDetailData;
      }
      throw new Error(data.message || 'Malformed POI details response from server');
    } catch (error) {
      console.error(`Failed to load POI details for ${id}:`, error);
      throw error;
    }
  }
}

export default PoiClientService;

