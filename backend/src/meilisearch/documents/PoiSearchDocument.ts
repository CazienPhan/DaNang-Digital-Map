/**
 * POI document stored inside Meilisearch.
 *
 * This interface represents the final flattened document
 * after joining poi.pois with poi.poi_geometries from Supabase.
 *
 * Fields are sourced exclusively from verified columns in the
 * existing poi.service.ts SQL queries.
 */
export interface PoiSearchDocument {
  id: string;
  name: string;
  name_en: string;
  poi_type: string;
  dia_chi: string;
  lat: number;
  lng: number;
}
