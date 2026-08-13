import sql from '../db';
import { supabase } from '../config/supabase';

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

// ─── Product Type Detail ─────────────────────────────────────────────────────

export interface HistoryItem {
  thoi_gian: string;
  mo_ta: string;
  hinh_anh_url: string | null;
}

export interface ProductTypeDetailRecord {
  id: string;
  name: string;
  overview: string | null;
  cong_dung: string[];
  lich_su_hinh_thanh: HistoryItem[];
  /**
   * Banner VIDEO url — sourced from poi.poi_media where
   *   media_category = 'banner' AND media_type = 'VIDEO'
   *   AND product_type_id = <id>
   * Null when no matching record exists.
   */
  video_url: string | null;
  /**
   * Process image url — sourced from poi.poi_media where
   *   media_category = 'quy_trinh'
   *   AND product_type_id = <id>
   * Null when no matching record exists.
   */
  process_image_url: string | null;
  /**
   * Gallery image urls — sourced from poi.poi_media where
   *   media_category = 'gallery' AND media_type = 'IMAGE'
   *   AND product_type_id = <id>
   * Empty array when no matching records exist.
   */
  gallery_image_urls: string[];
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

  /**
   * Fetches a complete product type record from Supabase by ID.
   *
   * Media resolution strategy:
   *   Banner VIDEO : poi.poi_media where media_category = 'banner'
   *                  AND media_type = 'VIDEO'
   *                  AND product_type_id = <id>
   *   Process image: poi.poi_media where media_category = 'quy_trinh'
   *                  AND product_type_id = <id>
   *
   * Both look up the poi_media table directly.
   * Graceful: if the media query fails or returns nothing, the field is null
   * and the rest of the Product Detail continues to render normally.
   */
  static async getProductTypeById(id: string): Promise<ProductTypeDetailRecord | null> {
    // 1. Fetch product_types row
    const { data: pt, error: ptError } = await supabase
      .schema('poi')
      .from('product_types')
      .select('id, name, overview, cong_dung, lich_su_hinh_thanh')
      .eq('id', id)
      .single();

    if (ptError) {
      if (ptError.code === 'PGRST116') return null; // no rows
      throw new Error(`Supabase product_types error: ${ptError.message}`);
    }
    if (!pt) return null;

    // 2. Resolve media from poi_media table.
    //    Graceful: if the media query fails, both urls remain null.
    let video_url: string | null = null;
    let process_image_url: string | null = null;
    let gallery_image_urls: string[] = [];

    try {
      const { data: mediaRows, error: mediaError } = await supabase
        .schema('poi')
        .from('poi_media')
        .select('media_type, media_category, url')
        .eq('product_type_id', id)
        .in('media_category', ['banner', 'quy_trinh', 'gallery']);

      if (mediaError) {
        console.warn(`[ProductService] poi_media query failed (id=${id}): ${mediaError.message}`);
      } else if (mediaRows && mediaRows.length > 0) {
        // Banner VIDEO: media_category = 'banner' AND media_type = 'VIDEO'
        const bannerVideo = mediaRows.find(
          (m: any) =>
            m.media_category === 'banner' &&
            m.media_type === 'VIDEO'
        );
        if (bannerVideo) {
          video_url = bannerVideo.url ?? null;
        }

        // Process image: media_category = 'quy_trinh'
        const processMedia = mediaRows.find(
          (m: any) => m.media_category === 'quy_trinh'
        );
        if (processMedia) {
          process_image_url = processMedia.url ?? null;
        }
        // Gallery images: media_category = 'gallery' AND media_type = 'IMAGE'
        // (Actual database values — NOT 'Quy trinh'/'Image' which don't exist in DB)
        const galleryImages = mediaRows.filter(
          (m: any) =>
            m.media_category === 'gallery' &&
            m.media_type === 'IMAGE' &&
            typeof m.url === 'string' &&
            m.url.length > 0
        );
        gallery_image_urls = galleryImages.map((m: any) => m.url as string);
      }
    } catch (mediaErr: any) {
      console.warn(`[ProductService] poi_media lookup failed (id=${id}): ${mediaErr.message}`);
    }

    return {
      id: pt.id,
      name: pt.name ?? '',
      overview: pt.overview ?? null,
      cong_dung: Array.isArray(pt.cong_dung) ? pt.cong_dung : [],
      lich_su_hinh_thanh: Array.isArray(pt.lich_su_hinh_thanh) ? pt.lich_su_hinh_thanh : [],
      video_url,
      process_image_url,
      gallery_image_urls,
    };
  }
}
