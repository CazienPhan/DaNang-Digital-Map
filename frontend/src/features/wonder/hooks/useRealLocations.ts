import { useEffect, useState } from 'react';
import PoiClientService from '@/services/supabase/poi.service';
import type { LocationItem } from '../types';
import { poiToLocation } from '../services/poiAdapter';

export type DataSource = 'supabase' | 'demo';

interface UseRealLocations {
  locations: LocationItem[] | null;
  loading: boolean;
  error: string | null;
  /** Tổng số bản ghi lấy về, trước khi lọc bỏ nhóm chưa xác minh. */
  totalFetched: number;
}

/**
 * Nạp địa điểm thật từ Supabase qua backend, chuyển sang kiểu của giao diện.
 *
 * Dùng lại nguyên `PoiClientService` của bản gốc — không sửa gì tầng services.
 *
 * Vì sao lọc bớt: database có 1.760 bản ghi nhưng 1.150 thuộc nhóm UNVERIFIED
 * và 222 thuộc OTHER — phần lớn là dữ liệu thu tự động, tên chưa chuẩn
 * ("khởi hanh", "AH1"). Đổ hết lên bản đồ sẽ rất lộn xộn, nên mặc định chỉ lấy
 * các nhóm đã phân loại rõ.
 */
const MEANINGFUL_TYPES = new Set([
  'OCOP_STORE',
  'MARKET',
  'TOURISM',
  'RESTAURANT',
  'HOTEL',
]);

export function useRealLocations(enabled: boolean): UseRealLocations {
  const [locations, setLocations] = useState<LocationItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalFetched, setTotalFetched] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setLocations(null);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    PoiClientService.getPOIs()
      .then((pois) => {
        if (cancelled) return;
        setTotalFetched(pois.length);

        const mapped = pois
          .filter((p) => MEANINGFUL_TYPES.has(p.poi_type))
          .filter((p) => Number.isFinite(Number(p.lat)) && Number.isFinite(Number(p.lng)))
          .map(poiToLocation);

        setLocations(mapped);
      })
      .catch((err: Error) => {
        if (cancelled) return;
        console.error('Không nạp được địa điểm từ Supabase:', err);
        setError(err.message || 'Không kết nối được máy chủ dữ liệu.');
        setLocations(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  return { locations, loading, error, totalFetched };
}

export default useRealLocations;
