import { MAP4D_CONFIG } from '@/config/map.config';

// ─── Product UI contract ──────────────────────────────────────────────────────

/**
 * ProductItem is the UI-facing shape consumed by ProductCard and ProductGrid.
 * It is derived from the raw database records by mapProductRecord().
 */
export interface ProductItem {
  /** Unique product ID (UUID) */
  id: string;
  /** Display name */
  name: string;
  /**
   * Category tags: [danh_muc, product_type] with nulls filtered out.
   * e.g. ["Hải sản chế biến", "FOOD"]
   */
  tags: string[];
  /** "OCOP" when products.is_ocop = true, otherwise null — no other values. */
  badge: 'OCOP' | null;
  /** products.hinh_anh_url — null when not set */
  img: string | null;
  /**
   * Formatted VND price string derived from price_min / price_max.
   * null when both price_min and price_max are 0 or absent.
   */
  price: string | null;
}

// ─── Price formatting ─────────────────────────────────────────────────────────

/**
 * Formats a price range into a Vietnamese-locale currency string.
 * Returns null when both values are 0 or absent (price unknown).
 */
function formatPrice(priceMin: number | null, priceMax: number | null): string | null {
  const min = priceMin ?? 0;
  const max = priceMax ?? 0;

  if (min === 0 && max === 0) return null;

  const fmt = (n: number) =>
    n.toLocaleString('vi-VN') + ' ₫';

  if (min === max) return fmt(min);
  return `${fmt(min)} – ${fmt(max)}`;
}

// ─── Product type label map ──────────────────────────────────────────────────

const PRODUCT_TYPE_LABELS: Record<string, string> = {
  FOOD: 'Thực phẩm',
  GIFT: 'Quà tặng',
  BEVERAGE: 'Đồ uống',
  CRAFT: 'Thủ công mỹ nghệ',
  HERB: 'Dược liệu',
  COSMETIC: 'Mỹ phẩm',
  TEXTILE: 'Dệt may',
};

// ─── Mapper ───────────────────────────────────────────────────────────────────

function mapProductRecord(p: any): ProductItem {
  /**
   * Tag priority (per task spec):
   * 1. products.description — converted from a string into a single-element array
   * 2. products.danh_muc   — category name, appended if present
   * 3. products.product_type — translated enum label, appended if present and different
   *
   * Nulls and empty strings are filtered out.
   */
  const tags: string[] = [];

  // description → first tag (task spec: "Organic food" → ["Organic food"])
  if (typeof p.description === 'string' && p.description.trim().length > 0) {
    tags.push(p.description.trim());
  }

  // danh_muc → category tag
  if (typeof p.danh_muc === 'string' && p.danh_muc.trim().length > 0) {
    const muc = p.danh_muc.trim();
    if (!tags.includes(muc)) tags.push(muc);
  }

  // product_type → human-readable label (skip if already shown via description/danh_muc)
  if (typeof p.product_type === 'string' && p.product_type.trim().length > 0) {
    const label = PRODUCT_TYPE_LABELS[p.product_type.toUpperCase()] ?? p.product_type;
    if (!tags.includes(label)) tags.push(label);
  }

  return {
    id: p.id,
    name: p.name,
    tags,
    badge: p.is_ocop === true ? 'OCOP' : null,
    img: p.hinh_anh_url || null,
    price: formatPrice(p.price_min, p.price_max),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class ProductClientService {
  /**
   * Fetches all products associated with a given POI ID
   * via the poi.product_listings junction table.
   */
  static async getProductsByPoiId(poiId: string): Promise<ProductItem[]> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/products/by-poi/${encodeURIComponent(poiId)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.status === 'OK' && Array.isArray(data.products)) {
        return data.products.map(mapProductRecord);
      }

      throw new Error(data.message || 'Malformed products response from server');
    } catch (error) {
      console.error(`Failed to load products for POI ${poiId}:`, error);
      throw error;
    }
  }
}

export default ProductClientService;
