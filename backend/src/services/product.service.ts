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

export interface HighlightItem {
  title: string;
  description: string;
  hinh_anh_url: string | null;
}

export interface ProductTypeDetailRecord {
  id: string;
  name: string;
  overview: string | null;
  huong_dan_su_dung: string[];
  cong_dung: string[];
  diem_noi_bat: HighlightItem[];
  lich_su_hinh_thanh: HistoryItem[];
  banner_url: string | null;
  process_image_url: string | null;
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
   * Resolves banner and process images from the "ProductCategory" Storage bucket.
   * This is the ONLY source of truth for Product Detail — Meilisearch is NOT used.
   *
   * Image resolution strategy:
   *   The product_media join table does not exist in the database.
   *   Images are stored in Supabase Storage under "ProductCategory/<FolderName>/",
   *   where FolderName is the product slug converted to PascalCase:
   *     "dong-trung-ha-thao" → "DongTrungHaThao"
   *     "nuoc-mam-nam-o"     → "NuocMamNamO"
   *
   *   Banner  : first file whose name starts with "overview"
   *   Process : first file whose name starts with "quy_trinh"
   */
  static async getProductTypeById(id: string): Promise<ProductTypeDetailRecord | null> {
    // 1. Fetch product_types row (include slug — needed to derive Storage folder)
    const { data: pt, error: ptError } = await supabase
      .schema('poi')
      .from('product_types')
      .select('id, slug, name, overview, huong_dan_su_dung, cong_dung, diem_noi_bat, lich_su_hinh_thanh')
      .eq('id', id)
      .single();

    if (ptError) {
      if (ptError.code === 'PGRST116') return null; // no rows
      throw new Error(`Supabase product_types error: ${ptError.message}`);
    }
    if (!pt) return null;

    // 2. Resolve banner_url and process_image_url from Supabase Storage.
    //    Graceful: if Storage lookup fails, images are null and the rest of the
    //    product detail continues to render normally.
    let banner_url: string | null = null;
    let process_image_url: string | null = null;

    try {
      const BUCKET = 'ProductCategory';
      // Signed URLs valid for 10 years — images are static production assets
      const SIGNED_TTL = 315_360_000;

      // slug → PascalCase folder name
      // e.g. "dong-trung-ha-thao" → "DongTrungHaThao"
      const folder = (pt.slug as string)
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');

      const { data: files, error: listErr } = await supabase.storage
        .from(BUCKET)
        .list(folder, { limit: 50 });

      if (listErr) {
        console.warn(`[ProductService] Storage list failed for "${folder}": ${listErr.message}`);
      } else if (files && files.length > 0) {
        const fileNames = files.map((f: any) => f.name as string);

        // Banner: file starting with "overview" (overview.png, overview.jpg, …)
        const bannerFile = fileNames.find((n) => n.toLowerCase().startsWith('overview'));
        if (bannerFile) {
          const { data: signed, error: signErr } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(`${folder}/${bannerFile}`, SIGNED_TTL);
          if (signErr) {
            console.warn(`[ProductService] Banner sign failed "${folder}/${bannerFile}": ${signErr.message}`);
          } else {
            banner_url = signed?.signedUrl ?? null;
          }
        }

        // Process image: file starting with "quy_trinh" (quy_trinh.png, quy_trinh_lam_mam.png, …)
        const processFile = fileNames.find((n) => n.toLowerCase().startsWith('quy_trinh'));
        if (processFile) {
          const { data: signed, error: signErr } = await supabase.storage
            .from(BUCKET)
            .createSignedUrl(`${folder}/${processFile}`, SIGNED_TTL);
          if (signErr) {
            console.warn(`[ProductService] Process sign failed "${folder}/${processFile}": ${signErr.message}`);
          } else {
            process_image_url = signed?.signedUrl ?? null;
          }
        }
      }
    } catch (storageErr: any) {
      console.warn(`[ProductService] Storage image lookup failed (id=${id}): ${storageErr.message}`);
    }

    return {
      id: pt.id,
      name: pt.name ?? '',
      overview: pt.overview ?? null,
      huong_dan_su_dung: Array.isArray(pt.huong_dan_su_dung) ? pt.huong_dan_su_dung : [],
      cong_dung: Array.isArray(pt.cong_dung) ? pt.cong_dung : [],
      diem_noi_bat: Array.isArray(pt.diem_noi_bat) ? pt.diem_noi_bat : [],
      lich_su_hinh_thanh: Array.isArray(pt.lich_su_hinh_thanh) ? pt.lich_su_hinh_thanh : [],
      banner_url,
      process_image_url,
    };
  }
}
