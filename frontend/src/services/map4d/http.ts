import { MAP4D_CONFIG } from '@/config/map.config';

/**
 * Gọi API Map4D qua backend, tự chuyển sang gọi thẳng nếu backend hỏng.
 *
 * ── Vì sao cần lớp này ───────────────────────────────────────────────────────
 * Kiến trúc gốc cho frontend gọi backend, backend mới gọi Map4D — để giấu
 * MAP4D_API_KEY. Đó vẫn là đường đi ưu tiên và giữ nguyên.
 *
 * Nhưng backend đang chạy trên Render KHÔNG kết nối được tới Map4D:
 *
 *     connect ETIMEDOUT 183.91.9.196:443
 *
 * (đo ngày 11/08/2026: /api/map4d/route trả 500 sau 135 giây; geocode và
 * autosuggest treo hẳn không phản hồi. Chỉ các endpoint dùng Supabase còn
 * chạy.) Gọi thẳng api.map4d.vn từ máy khác thì bình thường, nên nhiều khả
 * năng là mạng ra ngoài của Render tới dải IP Việt Nam bị chặn hoặc quá chậm.
 *
 * Trong lúc chưa xử lý được ở phía hạ tầng, lớp này thử backend trước với hạn
 * chờ ngắn, hỏng thì gọi trực tiếp Map4D bằng khoá bản đồ công khai. Khoá này
 * vốn đã lộ trong gói JavaScript của trình duyệt (mọi khoá VITE_* đều vậy) nên
 * không phát sinh rủi ro mới.
 *
 * Khi backend thông trở lại, nhánh dự phòng tự động không dùng tới.
 */

const BACKEND_TIMEOUT_MS = 6000;
const MAP4D_BASE = 'https://api.map4d.vn';

/** Đã ghi log sự cố backend chưa — chỉ cảnh báo một lần cho đỡ ồn console. */
let warnedOnce = false;

export interface Map4dFallbackOptions {
  /** Đường dẫn trên backend, ví dụ `/api/map4d/route?origin=…` */
  backendPath: string;
  /** Đường dẫn tương ứng trên Map4D, ví dụ `/sdk/route?origin=…` (chưa có key) */
  directPath: string;
  signal?: AbortSignal;
}

export async function fetchMap4d<T = any>({
  backendPath,
  directPath,
  signal,
}: Map4dFallbackOptions): Promise<T> {
  // 1. Ưu tiên backend
  try {
    const timeout = new AbortController();
    const timer = setTimeout(() => timeout.abort(), BACKEND_TIMEOUT_MS);

    // Người dùng huỷ thì huỷ luôn cả yêu cầu đang chạy
    signal?.addEventListener('abort', () => timeout.abort(), { once: true });

    try {
      const res = await fetch(`${MAP4D_CONFIG.backendUrl}${backendPath}`, {
        signal: timeout.signal,
      });
      if (res.ok) return (await res.json()) as T;
      throw new Error(`Backend trả HTTP ${res.status}`);
    } finally {
      clearTimeout(timer);
    }
  } catch (err) {
    // Người dùng chủ động huỷ thì dừng hẳn, không chạy dự phòng
    if (signal?.aborted) throw err;

    if (!warnedOnce) {
      warnedOnce = true;
      console.warn(
        '[Map4D] Backend không phản hồi, chuyển sang gọi thẳng api.map4d.vn. ' +
          'Đây là phương án tạm — cần xử lý kết nối Render → Map4D.',
        err
      );
    }
  }

  // 2. Dự phòng: gọi thẳng Map4D
  const key = MAP4D_CONFIG.mapApiKey || MAP4D_CONFIG.apiSecretKey;
  if (!key) throw new Error('Thiếu VITE_MAP4D_MAP_KEY, không thể gọi Map4D trực tiếp.');

  const sep = directPath.includes('?') ? '&' : '?';
  const res = await fetch(`${MAP4D_BASE}${directPath}${sep}key=${encodeURIComponent(key)}`, {
    signal,
  });
  if (!res.ok) throw new Error(`Map4D trả HTTP ${res.status}`);
  return (await res.json()) as T;
}
