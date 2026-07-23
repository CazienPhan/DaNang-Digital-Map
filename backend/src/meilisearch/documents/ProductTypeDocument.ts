/**
 * Product document stored inside Meilisearch.
 *
 * This interface represents the final flattened document
 * after mapping data from Supabase.
 */
export interface ProductSearchDocument {

  id: string;
  slug: string;
  name: string;
  name_en: string;
  danh_muc: string;
  short_description: string;
  overview: string;
  cong_dung: string[];
  huong_dan_su_dung: string[];
  diem_noi_bat: unknown[];
  lich_su_hinh_thanh: unknown[];
} 