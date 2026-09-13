import sql from '../db';
import { supabase } from '../config/supabase';

export interface ProductRecord {
  id: string;
  name: string;
  /**
   * May be plain text (legacy records) or a JSON array of
   * { title, item } sections (e.g. Thành phần/Hướng dẫn sử dụng/Công dụng/Hạn
   * sử dụng) when the column stores jsonb — passed through as-is, parsed by
   * the frontend.
   */
  description: string | unknown[] | null;
  is_ocop: boolean | null;
  hinh_anh_url: string | null;
  danh_muc: string | null;
  product_type: string | null;
  is_available: boolean | null;
  price_min: number | null;
  price_max: number | null;
  stock_status: string | null;
  /** poi.ocop_certifications.certificate_file_url — null when no cert row or no image set. */
  certificate_file_url: string | null;
  /** poi.ocop_certifications.so_sao — null when no cert row or so_sao is absent. */
  ocop_so_sao: number | null;
}

// ─── Manufacturer POIs ────────────────────────────────────────────────────────

export interface ManufacturerPoi {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

// ─── Product Type Detail ─────────────────────────────────────────────────────

export interface ProductTypeDetailRecord {
  id: string;
  name: string;
  overview: string | null;
  /** product_types.cau_chuyen_lich_su_title — bold subtitle for pill 1. */
  cau_chuyen_lich_su_title: string | null;
  /** product_types.cau_chuyen_lich_su — body paragraph for pill 1. */
  cau_chuyen_lich_su: string | null;
  /** product_types.quy_trinh_sx_title — bold subtitle for pill 2. */
  quy_trinh_sx_title: string | null;
  /** product_types.quy_trinh_sx — body paragraph for pill 2. */
  quy_trinh_sx: string | null;
  /** product_types.van_hoa — body paragraph for pill 3. */
  van_hoa: string | null;
  /**
   * Thumbnail/logo image url — sourced from poi.poi_media where
   *   media_category = 'thumbnail' AND product_type_id = <id>
   * Null when no matching record exists.
   */
  thumbnail_url: string | null;
  /**
   * Banner IMAGE url — sourced from poi.poi_media where
   *   media_category = 'banner' AND media_type = 'IMAGE'
   *   AND product_type_id = <id>
   * Null when no matching record exists.
   */
  banner_image_url: string | null;
  /**
   * Process image url — sourced from poi.poi_media where
   *   media_category = 'quy_trinh' AND media_type = 'IMAGE'
   *   AND product_type_id = <id>
   * Null when no matching record exists.
   */
  process_image_url: string | null;
  /**
   * Process video url — sourced from poi.poi_media where
   *   media_category = 'quy_trinh' AND media_type = 'VIDEO'
   *   AND product_type_id = <id>
   * Null when no matching record exists. Frontend prefers this over
   * process_image_url when both are present.
   */
  process_video_url: string | null;
  /**
   * Culture image url — sourced from poi.poi_media where
   *   media_category = 'van_hoa' AND media_type = 'IMAGE'
   *   AND product_type_id = <id>
   * Null when no matching record exists.
   */
  van_hoa_image_url: string | null;
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
          pl.stock_status,
          oc.certificate_file_url,
          oc.so_sao AS ocop_so_sao
        FROM poi.product_listings pl
        JOIN poi.products pr ON pr.id = pl.product_id
        LEFT JOIN poi.certifications oc ON oc.product_id = pr.id
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
        certificate_file_url: raw.certificate_file_url || null,
        ocop_so_sao:
          raw.ocop_so_sao !== null && raw.ocop_so_sao !== undefined
            ? Number(raw.ocop_so_sao)
            : null,
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
      .select(
        'id, name, overview, cau_chuyen_lich_su, cau_chuyen_lich_su_title, quy_trinh_sx, quy_trinh_sx_title, van_hoa'
      )
      .eq('id', id)
      .single();

    if (ptError) {
      if (ptError.code === 'PGRST116') return null; // no rows
      throw new Error(`Supabase product_types error: ${ptError.message}`);
    }
    if (!pt) return null;

    // 2. Resolve media from poi_media table.
    //    Graceful: if the media query fails, both urls remain null.
    let thumbnail_url: string | null = null;
    let banner_image_url: string | null = null;
    let process_image_url: string | null = null;
    let process_video_url: string | null = null;
    let van_hoa_image_url: string | null = null;
    let gallery_image_urls: string[] = [];

    try {
      const { data: mediaRows, error: mediaError } = await supabase
        .schema('poi')
        .from('poi_media')
        .select('media_type, media_category, url')
        .eq('product_type_id', id)
        .in('media_category', ['thumbnail', 'banner', 'quy_trinh', 'van_hoa', 'gallery']);

      if (mediaError) {
        console.warn(`[ProductService] poi_media query failed (id=${id}): ${mediaError.message}`);
      } else if (mediaRows && mediaRows.length > 0) {
        const findImage = (category: string) =>
          mediaRows.find(
            (m: any) =>
              m.media_category === category &&
              m.media_type === 'IMAGE' &&
              typeof m.url === 'string' &&
              m.url.length > 0
          );

        const findVideo = (category: string) =>
          mediaRows.find(
            (m: any) =>
              m.media_category === category &&
              m.media_type === 'VIDEO' &&
              typeof m.url === 'string' &&
              m.url.length > 0
          );

        thumbnail_url = findImage('thumbnail')?.url ?? null;
        banner_image_url = findImage('banner')?.url ?? null;
        process_image_url = findImage('quy_trinh')?.url ?? null;
        process_video_url = findVideo('quy_trinh')?.url ?? null;
        van_hoa_image_url = findImage('van_hoa')?.url ?? null;

        // Gallery images: media_category = 'gallery' AND media_type = 'IMAGE'
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
      cau_chuyen_lich_su_title: pt.cau_chuyen_lich_su_title ?? null,
      cau_chuyen_lich_su: pt.cau_chuyen_lich_su ?? null,
      quy_trinh_sx_title: pt.quy_trinh_sx_title ?? null,
      quy_trinh_sx: pt.quy_trinh_sx ?? null,
      van_hoa: pt.van_hoa ?? null,
      thumbnail_url,
      banner_image_url,
      process_image_url,
      process_video_url,
      van_hoa_image_url,
      gallery_image_urls,
    };
  }

  /**
   * Returns the distinct POIs that manufacture a given product type, via
   *   poi.products.product_type_id = <productTypeId>
   *   AND poi.products.manufacturer_poi_id = poi.pois.id
   * Used by the "Khám phá nhà sản xuất" card so results are the actual
   * producer POIs rather than a generic text search on the product name
   * (many producers' business names don't contain the product name).
   */
  static async getManufacturersByProductTypeId(productTypeId: string): Promise<ManufacturerPoi[]> {
    try {
      const result = await sql`
        SELECT DISTINCT ON (p.id)
          p.id,
          p.name,
          p.dia_chi,
          g.lat,
          g.lng
        FROM poi.products pr
        JOIN poi.pois p ON p.id = pr.manufacturer_poi_id
        LEFT JOIN poi.poi_geometries g ON g.poi_id = p.id
        WHERE pr.product_type_id = ${productTypeId}
          AND pr.manufacturer_poi_id IS NOT NULL
      `;

      return result.map((raw: any): ManufacturerPoi => ({
        id: raw.id,
        name: raw.name ?? '',
        address: raw.dia_chi || null,
        lat: raw.lat !== null && raw.lat !== undefined ? Number(raw.lat) : null,
        lng: raw.lng !== null && raw.lng !== undefined ? Number(raw.lng) : null,
      }));
    } catch (err: any) {
      console.error(`Error fetching manufacturers for product type ${productTypeId}:`, err);
      throw new Error(`Database Query Failure: ${err.message || err}`);
    }
  }
}
