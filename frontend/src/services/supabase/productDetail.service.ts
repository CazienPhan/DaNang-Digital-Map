import { MAP4D_CONFIG } from '@/config/map.config';

// ─── Product Detail DTOs ──────────────────────────────────────────────────────

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
  huong_dan_su_dung: string[];
  cong_dung: string[];
  diem_noi_bat: HighlightItem[];
  lich_su_hinh_thanh: HistoryItem[];
  banner_url: string | null;
  process_image_url: string | null;
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
}

export default ProductDetailClientService;
