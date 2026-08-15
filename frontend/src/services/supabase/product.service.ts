import { MAP4D_CONFIG } from '@/config/map.config';

// ─── Product UI contract ──────────────────────────────────────────────────────

/**
 * ProductItem is the UI-facing shape consumed by ProductCard and ProductGrid.
 * It is derived from the raw database records by mapProductRecord().
 */
/** One titled section of product detail copy, e.g. { title: "Thành phần", item: "..." } */
export interface ProductDetailSection {
  title: string;
  item: string;
}

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
  /**
   * Raw numeric price (price_min) for arithmetic (e.g. cart totals).
   * null when price_min is 0 or absent — callers should treat null as "price
   * unknown" rather than zero.
   */
  priceNumeric: number | null;
  /**
   * Structured detail copy parsed from products.description when it holds a
   * JSON array of { title, item } sections (e.g. "Thành phần", "Hướng dẫn sử
   * dụng", "Công dụng", "Hạn sử dụng"). Empty when description is plain text
   * or absent — callers should fall back gracefully.
   */
  detailSections: ProductDetailSection[];
  /** poi.ocop_certifications.certificate_file_url — null when no cert image is set. */
  certificateImageUrl: string | null;
  /**
   * OCOP certification star rating from ocop_certifications.so_sao.
   * Only present when is_ocop = true AND a matching certification row exists.
   * null means no star rating is available — do NOT invent a fallback.
   */
  ocopSoSao: number | null;
}

// ─── Price formatting ─────────────────────────────────────────────────────────

/**
 * Formats a price range into a Vietnamese-locale currency string.
 * Returns null when both values are 0 or absent (price unknown).
 */
export function formatPrice(priceMin: number | null, priceMax: number | null): string | null {
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

/**
 * Parses products.description into structured { title, item } sections.
 * description may be:
 *   - a JSON array of { title, item } (stored as jsonb, or as a JSON string)
 *   - plain descriptive text (older records)
 *   - null/absent
 * Returns [] whenever the value isn't a valid array of sections, so callers
 * can fall back to treating description as plain text.
 */
function parseDetailSections(description: unknown): ProductDetailSection[] {
  let value: unknown = description;

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed.startsWith('[')) return [];
    try {
      value = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(value)) return [];

  return value.filter(
    (entry): entry is ProductDetailSection =>
      entry &&
      typeof entry === 'object' &&
      typeof entry.title === 'string' &&
      typeof entry.item === 'string'
  );
}

function mapProductRecord(p: any): ProductItem {
  const detailSections = parseDetailSections(p.description);

  /**
   * Tag priority (per task spec):
   * 1. products.description — only when it is NOT structured detail-section
   *    JSON, converted from a string into a single-element array
   * 2. products.danh_muc   — category name, appended if present
   * 3. products.product_type — translated enum label, appended if present and different
   *
   * Nulls and empty strings are filtered out.
   */
  const tags: string[] = [];

  // description → first tag, but only when it's plain text (not detail-section JSON)
  if (
    detailSections.length === 0 &&
    typeof p.description === 'string' &&
    p.description.trim().length > 0
  ) {
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

  const numMin = typeof p.price_min === 'number' && p.price_min > 0 ? p.price_min : null;

  return {
    id: p.id,
    name: p.name,
    tags,
    badge: p.is_ocop === true ? 'OCOP' : null,
    img: p.hinh_anh_url || null,
    price: formatPrice(p.price_min, p.price_max),
    priceNumeric: numMin,
    detailSections,
    certificateImageUrl: p.certificate_file_url || null,
    ocopSoSao:
      p.is_ocop === true &&
      p.ocop_so_sao !== null &&
      p.ocop_so_sao !== undefined
        ? Number(p.ocop_so_sao)
        : null,
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
