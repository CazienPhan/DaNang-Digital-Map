import { useState, useEffect } from 'react';
import {
  ProductDetailClientService,
  type ProductDetailData,
} from '@/services/supabase/productDetail.service';

interface UseProductDetailResult {
  data: ProductDetailData | null;
  loading: boolean;
  error: string | null;
}

/**
 * useProductDetail
 *
 * Fetches a complete product detail record from the backend when productId changes.
 * Data comes from Supabase via GET /api/products/:id — Meilisearch is NOT used.
 *
 * Mirrors the usePlaceDetail hook pattern exactly.
 */
export function useProductDetail(productId: string | null): UseProductDetailResult {
  const [data, setData] = useState<ProductDetailData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const result = await ProductDetailClientService.getProductById(productId);

        if (!cancelled) {
          if (result === null) {
            setError('Product not found.');
          } else {
            setData(result);
          }
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product details.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDetail();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { data, loading, error };
}

export default useProductDetail;
