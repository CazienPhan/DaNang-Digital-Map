import React, { useState, useEffect } from 'react';
import ProductClientService, { type ProductItem } from '@/services/supabase/product.service';
import { ProductGrid } from './ProductGrid';

interface PoiProductSectionProps {
  /** ID of the currently selected POI — determines which products are fetched. */
  poiId: string;
}

/**
 * PoiProductSection orchestrates the Products tab:
 * - Fetches products for the current POI via ProductClientService
 * - Renders ProductGrid when products are available
 * - Renders an empty-state when no products exist for this POI
 * - Renders a loading skeleton while the request is in flight
 * - Renders an inline error message on fetch failure
 *
 * No mock data. No hardcoded arrays. Every product comes from the database.
 */
export const PoiProductSection: React.FC<PoiProductSectionProps> = React.memo(({ poiId }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poiId) return;

    let cancelled = false;

    setLoading(true);
    setError(null);

    ProductClientService.getProductsByPoiId(poiId)
      .then((data) => {
        if (!cancelled) {
          setProducts(data);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('[PoiProductSection] Failed to load products:', err);
          setError(err.message || 'Không thể kết nối đến máy chủ.');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [poiId]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 px-4 py-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted rounded-2xl overflow-hidden animate-pulse"
            style={{ aspectRatio: '1 / 1.4' }}
          />
        ))}
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Không thể tải sản phẩm</p>
        <p className="text-xs text-muted-foreground">{error}</p>
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
          <span className="text-2xl">🍽️</span>
        </div>
        <p className="text-sm font-semibold text-foreground mb-1">Chưa có sản phẩm</p>
        <p className="text-xs text-muted-foreground">
          Thông tin sản phẩm sẽ được cập nhật trong thời gian tới.
        </p>
      </div>
    );
  }

  // ── Product grid ──────────────────────────────────────────────────────────
  return <ProductGrid products={products} />;
});
