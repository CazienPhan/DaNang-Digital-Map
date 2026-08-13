const PRODUCTION_BACKEND = 'https://danang-digital-map-backend.onrender.com';

/**
 * Chọn địa chỉ backend.
 *
 * Trên máy lập trình thì trỏ localhost là đúng. Nhưng khi trang đã được deploy,
 * localhost là máy của NGƯỜI XEM chứ không phải máy chủ — mọi lời gọi đều hỏng.
 *
 * Tình huống này đã xảy ra thật: bản deploy trên Cloudflare Pages được build với
 * VITE_BACKEND_URL=http://localhost:5000 (có lẽ chép từ .env.example), khiến
 * trang không nạp được địa điểm và phải lùi về dữ liệu mẫu.
 *
 * Vì vậy: nếu trang đang chạy trên tên miền thật mà biến môi trường lại trỏ
 * localhost, bỏ qua nó và dùng backend production.
 */
function resolveBackendUrl(): string {
  const configured = import.meta.env.VITE_BACKEND_URL as string | undefined;
  if (!configured) return PRODUCTION_BACKEND;

  const pointsToLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(
    configured
  );

  // `location` không tồn tại khi build phía máy chủ — mặc định coi như đang deploy.
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  const viewerIsLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/i.test(host) || host === '';

  if (pointsToLocalhost && !viewerIsLocal) {
    console.warn(
      `[Cấu hình] VITE_BACKEND_URL đang trỏ "${configured}" nhưng trang chạy trên ` +
        `"${host}". Dùng tạm ${PRODUCTION_BACKEND}. Nên sửa lại biến môi trường ` +
        `ở nơi deploy.`
    );
    return PRODUCTION_BACKEND;
  }

  return configured;
}

export const MAP4D_CONFIG = {
  mapApiKey: import.meta.env.VITE_MAP4D_MAP_KEY || '',
  apiSecretKey: import.meta.env.VITE_MAP4D_API_KEY || '',
  sdkVersion: '2.6',
  backendUrl: resolveBackendUrl(),
};
