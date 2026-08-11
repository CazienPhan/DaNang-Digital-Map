import React, { useEffect, useState } from 'react';
import type { LocationItem } from '../types';
import { useEscapeToClose, dismissOnBackdrop } from '../hooks/useDismiss';
import { RoutingService, type RouteResult } from '@/services/map4d/routing.service';
import type { MapCoordinate } from '@/features/map/components/MapContainer';
import {
  X,
  Navigation,
  Bike,
  Car,
  Footprints,
  Loader2,
  AlertTriangle,
  Map as MapIcon,
  Crosshair,
} from 'lucide-react';

/** Phương tiện hiển thị ↔ mã Map4D dùng trong tham số `mode`. */
const TRAVEL_MODES = [
  { id: 'motorcycle', label: 'Xe máy', Icon: Bike },
  { id: 'car', label: 'Ô tô', Icon: Car },
  { id: 'foot', label: 'Đi bộ', Icon: Footprints },
] as const;

type TravelMode = (typeof TRAVEL_MODES)[number]['id'];

/** Điểm xuất phát mặc định khi người dùng không cho phép lấy vị trí. */
const DANANG_CENTER: MapCoordinate = { lat: 16.0682, lng: 108.2241 };

interface DirectionsModalProps {
  location: LocationItem | null;
  onClose: () => void;
  /**
   * Giao lộ trình cho bản đồ vẽ. Truyền null để xoá lộ trình đang hiển thị.
   */
  onRouteReady?: (
    route: { path: MapCoordinate[]; origin: MapCoordinate; destination: MapCoordinate } | null
  ) => void;
}

/**
 * Chỉ đường bằng Map4D.
 *
 * Bản thiết kế gốc chỉ là mẫu giao diện: các bước đi và thời gian đều viết
 * cứng trong code, còn nút cuối thì mở sang Google Maps. Sai nghiệp vụ — đây
 * là bản đồ Map4D của dự án, lộ trình phải tính bằng Map4D và vẽ lên chính
 * bản đồ này.
 *
 * Bản viết lại: gọi Map4D qua RoutingService (backend, tự dự phòng gọi thẳng),
 * lấy quãng đường, thời gian và các bước rẽ có thật, rồi đẩy đường đi ra bản đồ.
 */
export const DirectionsModal: React.FC<DirectionsModalProps> = ({
  location,
  onClose,
  onRouteReady,
}) => {
  // Cho phép thoát bằng phím Esc, không bắt buộc bấm nút ✕
  useEscapeToClose(!!location, onClose);

  const [travelMode, setTravelMode] = useState<TravelMode>('motorcycle');
  const [origin, setOrigin] = useState<MapCoordinate | null>(null);
  const [usingFallbackOrigin, setUsingFallbackOrigin] = useState(false);
  const [route, setRoute] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lấy vị trí hiện tại khi mở hộp thoại
  useEffect(() => {
    if (!location) return;

    let cancelled = false;
    setUsingFallbackOrigin(false);

    if (!navigator.geolocation) {
      setOrigin(DANANG_CENTER);
      setUsingFallbackOrigin(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        if (cancelled) return;
        // Không cho phép định vị thì lấy trung tâm Đà Nẵng làm điểm xuất phát
        setOrigin(DANANG_CENTER);
        setUsingFallbackOrigin(true);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );

    return () => {
      cancelled = true;
    };
  }, [location]);

  // Tính lộ trình mỗi khi đổi điểm đến, điểm đi hoặc phương tiện
  useEffect(() => {
    if (!location || !origin) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    const destination = { lat: location.lat, lng: location.lng };

    RoutingService.fetchRoute(origin, destination, travelMode)
      .then((result) => {
        if (cancelled) return;
        setRoute(result);
        onRouteReady?.({ path: result.path, origin, destination });
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Không tính được lộ trình:', err);
        setRoute(null);
        setError('Không tính được lộ trình. Kiểm tra kết nối rồi thử lại.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // onRouteReady cố tình không nằm trong danh sách phụ thuộc: hàm này được
    // tạo lại mỗi lần component cha render, đưa vào sẽ gọi API lặp vô hạn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, origin, travelMode]);

  if (!location) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={dismissOnBackdrop(onClose)}>
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[88vh]">
        {/* Đầu hộp thoại */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-[#FFF9F3] shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-2 rounded-xl bg-[#F47A1F] text-white shrink-0">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base text-[#1F2937]">Chỉ đường</h3>
              <p className="text-xs text-slate-500 font-medium truncate">Tới {location.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer shrink-0"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Chọn phương tiện */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {TRAVEL_MODES.map(({ id, label, Icon }) => (
              <button
                key={id}
                onClick={() => setTravelMode(id)}
                className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  travelMode === id
                    ? 'bg-[#F47A1F] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {usingFallbackOrigin && (
            <div className="flex items-start gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              <Crosshair className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                Chưa lấy được vị trí của bạn nên lộ trình tính từ trung tâm Đà Nẵng.
                Cho phép truy cập vị trí để có kết quả chính xác.
              </span>
            </div>
          )}

          {/* Tổng quan lộ trình */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 min-h-[64px] flex items-center">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-[#F47A1F]" />
                <span>Đang tính lộ trình bằng Map4D…</span>
              </div>
            ) : error ? (
              <div className="flex items-start gap-2 text-xs text-red-600 font-medium">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            ) : route ? (
              <div className="flex items-center justify-between w-full text-xs">
                <div>
                  <p className="text-slate-500 font-medium">Thời gian di chuyển</p>
                  <p className="text-sm font-black text-[#F47A1F]">{route.duration}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 font-medium">Quãng đường</p>
                  <p className="text-sm font-black text-slate-800">{route.distance}</p>
                </div>
              </div>
            ) : (
              <span className="text-xs text-slate-400">Đang chờ vị trí của bạn…</span>
            )}
          </div>

          {/* Các bước rẽ — chỉ hiện khi Map4D có trả về */}
          {route?.steps && route.steps.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-2">
                Lộ trình chi tiết
                <span className="ml-1.5 font-medium text-slate-400">
                  ({route.steps.length} chặng)
                </span>
              </h4>
              <div className="space-y-2">
                {route.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <div className="w-5 h-5 rounded-full bg-[#F47A1F]/10 text-[#F47A1F] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <span className="font-medium flex-1">{step.instruction}</span>
                    {step.distance && (
                      <span className="text-[10px] text-slate-400 font-semibold shrink-0 mt-0.5">
                        {step.distance}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chân hộp thoại */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2.5 shrink-0">
          <button
            onClick={() => {
              onRouteReady?.(null);
              onClose();
            }}
            className="w-1/2 py-2.5 rounded-2xl text-xs font-bold border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Xoá lộ trình
          </button>
          <button
            onClick={onClose}
            disabled={!route}
            className="w-1/2 py-2.5 rounded-2xl text-xs font-extrabold text-white bg-[#F47A1F] hover:bg-[#D9630F] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Xem trên bản đồ</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectionsModal;
