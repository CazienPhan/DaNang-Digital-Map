import sql from '../db';

export interface ProductRecord {
  id: string;
  name: string;
  description: string | null;
  is_ocop: boolean | null;
  hinh_anh_url: string | null;
  danh_muc: string | null;
  product_type: string | null;
  is_available: boolean | null;
  price_min: number | null;
  price_max: number | null;
  stock_status: string | null;
}

export class ProductService {
  /**
   * Returns all available products sold at a given POI location,
   * joined through the poi.product_listings junction table.
   * Ordered: OCOP products first, then alphabetically by name.
   */
  static async getProductsByPoiId(poiId: string): Promise<ProductRecord[]> {
    try {
      const result = await sql`
        SELECT
          pr.id,
          pr.name,
          pr.description,
          pr.is_ocop,
          pr.hinh_anh_url,
          pr.danh_muc,
          pr.product_type,
          pr.is_available,
          pl.price_min,
          pl.price_max,
          pl.stock_status
        FROM poi.product_listings pl
        JOIN poi.products pr ON pr.id = pl.product_id
        WHERE pl.poi_id = ${poiId}
          AND (pr.is_available IS NULL OR pr.is_available = true)
        ORDER BY pr.is_ocop DESC NULLS LAST, pr.name ASC
      `;

      return result.map((raw: any): ProductRecord => ({
        id: raw.id,
        name: raw.name,
        description: raw.description || null,
        is_ocop: raw.is_ocop ?? null,
        hinh_anh_url: raw.hinh_anh_url || null,
        danh_muc: raw.danh_muc || null,
        product_type: raw.product_type || null,
        is_available: raw.is_available ?? null,
        price_min:
          raw.price_min !== null && raw.price_min !== undefined
            ? Number(raw.price_min)
            : null,
        price_max:
          raw.price_max !== null && raw.price_max !== undefined
            ? Number(raw.price_max)
            : null,
        stock_status: raw.stock_status || null,
      }));
    } catch (err: any) {
      console.error(`Error fetching products for POI ${poiId}:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}
