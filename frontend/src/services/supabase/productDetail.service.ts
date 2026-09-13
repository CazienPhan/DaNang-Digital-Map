import { MAP4D_CONFIG } from '@/config/map.config';

// ─── Product Detail DTOs ──────────────────────────────────────────────────────

/**
 * ProductDetailData — the complete product type record used by Product Info Detail.
 *
 * Sourced exclusively from the backend via GET /api/products/:id → Supabase.
 * Meilisearch is NEVER used to populate this type.
 */
export interface ProductDetailData {
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
  /** Thumbnail/logo image url from poi_media (media_category='thumbnail') */
  thumbnail_url: string | null;
  /** Banner image url from poi_media (media_category='banner', media_type='IMAGE') */
  banner_image_url: string | null;
  /** Process image url from poi_media (media_category='quy_trinh', media_type='IMAGE') */
  process_image_url: string | null;
  /** Process video url from poi_media (media_category='quy_trinh', media_type='VIDEO') — takes priority over process_image_url when present. */
  process_video_url: string | null;
  /** Culture image url from poi_media (media_category='van_hoa', media_type='IMAGE') */
  van_hoa_image_url: string | null;
  /**
   * Gallery image urls from poi_media
   * (media_category='gallery', media_type='IMAGE')
   */
  gallery_image_urls: string[];
}

/** A producer POI for a given product type — from GET /api/products/:id/manufacturers */
export interface ManufacturerPoi {
  id: string;
  name: string;
  address: string | null;
  lat: number | null;
  lng: number | null;
}

// ─── Service ──────────────────────────────────────────────────────────────────

/**
 * ProductDetailClientService
 *
 * Single responsibility: fetch complete product type data from the backend.
 *
 * Architecture:
 *   Frontend → GET /api/products/:id → Backend → Supabase → ProductDetailData
 *
 * This service MUST NOT:
 *   - Call Meilisearch directly or indirectly
 *   - Contain React state, hooks, or side effects
 */
export class ProductDetailClientService {
  /**
   * Fetches the complete product detail for a given product type ID.
   * Returns null if the product is not found (404).
   * Throws on network or server errors.
   */
  static async getProductById(id: string): Promise<ProductDetailData | null> {
    const response = await fetch(
      `${MAP4D_CONFIG.backendUrl}/api/products/${encodeURIComponent(id)}`
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch product detail: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (data?.status === 'OK' && data?.product) {
      return data.product as ProductDetailData;
    }

    throw new Error(data?.message || 'Malformed product detail response from server');
  }

  /**
   * Fetches the distinct POIs that manufacture this product type.
   * Returns an empty array on any failure (never throws) — used to populate
   * the Place Search listing directly from the "Khám phá nhà sản xuất" card.
   */
  static async getManufacturers(productTypeId: string): Promise<ManufacturerPoi[]> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/products/${encodeURIComponent(productTypeId)}/manufacturers`
      );
      if (!response.ok) return [];
      const data = await response.json();
      if (data?.status === 'OK' && Array.isArray(data?.manufacturers)) {
        return data.manufacturers as ManufacturerPoi[];
      }
      return [];
    } catch {
      return [];
    }
  }
}

export default ProductDetailClientService;
