import React, { useEffect, useRef, useState, useMemo } from 'react';
import { MAP4D_CONFIG } from '@/config/map.config';
import { loadMap4dSDK } from '@/utils/map.helper';
import { SearchService } from '@/services/map4d/search.service';
import { AD_HOC_ID_PREFIX, buildAdHocLocation } from '../utils/adHocLocation';
import type {
  CategoryType,
  LocationItem,
  MainTab,
  OCOPProduct,
  SellingPointItem,
} from '../types';
import { 
  SlidersHorizontal, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Crosshair,
  X,
  ChevronRight,
  Menu,
  Search,
  Navigation,
  Heart,
  Info,
  Layers,
  MapPin,
  Sparkles
} from 'lucide-react';

interface MapContainerProps {
  locations: LocationItem[];
  products?: OCOPProduct[];
  selectedLocation: LocationItem | null;
  onSelectLocation: (loc: LocationItem) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  onOpenDetail: (loc: LocationItem) => void;
  onOpenDirections?: (loc: LocationItem) => void;
  onOpenProductDetail?: (prod: OCOPProduct) => void;
  onOpenFilterModal: () => void;
  onToggleDrawer: () => void;
  isDrawerOpen: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  mainTab?: MainTab;
  setMainTab?: (tab: MainTab) => void;
  onOpenFavorites?: () => void;
  favoriteCount?: number;
  onOpenAbout?: () => void;
  /**
   * Người dùng bấm vào một điểm KHÔNG thuộc dữ liệu của mình — chỗ trống trên
   * bản đồ, hoặc POI nền có nhãn sẵn của Map4D. Hành vi này có ở bản gốc
   * (MapClickHandler) và được giữ lại theo yêu cầu.
   */
  onMapPointClick?: (loc: LocationItem) => void;
  /** Đóng thẻ callout đang hiện. */
  onCloseCallout?: () => void;
  /**
   * Các điểm bán của một sản phẩm, hiện khi người dùng bấm "Định vị trên bản đồ"
   * trong trang chi tiết sản phẩm.
   */
  sellingPoints?: { productName: string; points: SellingPointItem[] } | null;
  /** Bỏ lớp điểm bán đang hiện. */
  onClearSellingPoints?: () => void;
  /** Lộ trình do DirectionsModal tính bằng Map4D. null = không vẽ gì. */
  route?: { path: { lat: number; lng: number }[]; origin: { lat: number; lng: number }; destination: { lat: number; lng: number } } | null;
}

/**
 * Chế độ hiển thị bản đồ.
 *
 * Thiết kế gốc dùng Leaflet nên đổi nền bằng cách đổi URL tile. Map4D thì tự
 * render nền và cung cấp API riêng (đã đối chiếu trực tiếp với SDK v2.6.9):
 *
 *   map.setMapType('roadmap' | 'satellite')   — đổi kiểu nền 2D
 *   map.enable3dMode(boolean)                 — bật/tắt khối nhà 3D
 *
 * Nhờ vậy tính năng "Lớp bản đồ" của thiết kế được giữ lại, chỉ đổi danh sách
 * lựa chọn cho khớp với những gì Map4D thực sự có.
 */
export type MapMode = 'roadmap' | 'satellite' | 'map3d';

export interface MapModeOption {
  id: MapMode;
  name: string;
  icon: string;
  badge: string;
  description: string;
}

export const MAP_MODE_OPTIONS: MapModeOption[] = [
  {
    id: 'roadmap',
    name: 'Đường phố',
    icon: '🗺️',
    badge: 'Mặc định',
    description: 'Bản đồ đường phố tiêu chuẩn, rõ ràng dễ xem'
  },
  {
    id: 'satellite',
    name: 'Vệ tinh',
    icon: '🛰️',
    badge: 'Chân thực',
    description: 'Ảnh chụp vệ tinh chân thực công trình & bờ biển'
  },
  {
    id: 'map3d',
    name: 'Không gian 3D',
    icon: '🏙️',
    badge: 'Nổi bật',
    description: 'Khối nhà 3D — thế mạnh riêng của Map4D'
  }
];

/** SDK có đủ API để đổi kiểu bản đồ không. */
function supportsMapTypeSwitching(map: any): boolean {
  return typeof map?.setMapType === 'function' && typeof map?.enable3dMode === 'function';
}

export const MapContainer: React.FC<MapContainerProps> = ({
  locations,
  products = [],
  selectedLocation,
  onSelectLocation,
  onOpenDetail,
  onOpenDirections,
  onOpenProductDetail,
  onOpenFilterModal,
  onToggleDrawer,
  isDrawerOpen,
  searchQuery,
  setSearchQuery,
  mainTab = 'products',
  setMainTab,
  onOpenFavorites,
  favoriteCount = 0,
  onOpenAbout,
  onMapPointClick,
  onCloseCallout,
  sellingPoints = null,
  onClearSellingPoints,
  route = null,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const map4dRef = useRef<any>(null);
  /** Marker địa điểm đang vẽ, khoá theo LocationItem.id để xoá đúng cái cần xoá. */
  const markersRef = useRef<Map<string, any>>(new Map());
  /** Nhãn quận huyện — vẽ một lần, không đổi theo bộ lọc. */
  const districtLabelsRef = useRef<any[]>([]);
  /** Đường đi và hai marker đầu/cuối của lộ trình đang hiển thị. */
  const routeLayersRef = useRef<any[]>([]);
  /** Marker các điểm bán sản phẩm đang hiển thị. */
  const sellingLayersRef = useRef<any[]>([]);
  /** Tra ngược marker → điểm bán, dùng khi người dùng bấm vào marker. */
  const sellingByMarkerRef = useRef<Array<{ marker: any; point: SellingPointItem }>>([]);
  /** Danh sách đã canh khung gần nhất — tránh canh lại khi không đổi bộ lọc. */
  const lastFitKeyRef = useRef<string>('');

  const [isMapReady, setIsMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [supportsMapModes, setSupportsMapModes] = useState(false);
  const [activeMapMode, setActiveMapMode] = useState<MapMode>('roadmap');
  const [isMapModeSelectorOpen, setIsMapModeSelectorOpen] = useState(false);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const [isSellingListOpen, setIsSellingListOpen] = useState(true);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  /** Giữ giá trị mới nhất để listener đăng ký một lần vẫn đọc được dữ liệu hiện tại. */
  const onSelectLocationRef = useRef(onSelectLocation);
  useEffect(() => {
    onSelectLocationRef.current = onSelectLocation;
  }, [onSelectLocation]);

  const locationsRef = useRef(locations);
  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  const onMapPointClickRef = useRef(onMapPointClick);
  useEffect(() => {
    onMapPointClickRef.current = onMapPointClick;
  }, [onMapPointClick]);

  // Close suggestions popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter locations and products for real-time autocomplete popover
  const matchingLocations = useMemo(() => {
    if (!searchQuery.trim()) return locations.slice(0, 5);
    const q = searchQuery.toLowerCase().trim();
    return locations.filter(l => 
      l.name.toLowerCase().includes(q) ||
      l.categoryLabel.toLowerCase().includes(q) ||
      l.address.toLowerCase().includes(q) ||
      l.district.toLowerCase().includes(q) ||
      l.tags?.some(t => t.toLowerCase().includes(q))
    );
  }, [locations, searchQuery]);

  const matchingProducts = useMemo(() => {
    if (!products || !searchQuery.trim()) return products.slice(0, 5);
    const q = searchQuery.toLowerCase().trim();
    return products.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q) ||
      p.producerName.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  }, [products, searchQuery]);

  // Default Da Nang Center Coordinates
  const DANANG_CENTER: [number, number] = [16.0682, 108.2241];

  // Nạp SDK Map4D rồi khởi tạo bản đồ (chỉ chạy một lần)
  useEffect(() => {
    if (!mapRef.current || map4dRef.current) return;

    let cancelled = false;

    // Thử khoá bản đồ trước, không được thì thử khoá API — giống cách
    // features/map/components/MapContainer.tsx của bản gốc đang làm.
    loadMap4dSDK(MAP4D_CONFIG.mapApiKey, MAP4D_CONFIG.sdkVersion)
      .catch(() => loadMap4dSDK(MAP4D_CONFIG.apiSecretKey, MAP4D_CONFIG.sdkVersion))
      .then(() => {
        if (cancelled || !mapRef.current || map4dRef.current) return;

        const map = new window.map4d.Map(mapRef.current, {
          center: new window.map4d.LatLng(DANANG_CENTER[0], DANANG_CENTER[1]),
          zoom: 14,
          minZoom: 2,
          maxZoom: 22,
          controls: false,
        });

        map4dRef.current = map;
        setSupportsMapModes(supportsMapTypeSwitching(map));
        setIsMapReady(true);
      })
      .catch((err: Error) => {
        if (!cancelled) {
          console.error('Không nạp được Map4D SDK:', err);
          setMapError(err.message || 'Không tải được bản đồ Map4D.');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Đổi kiểu bản đồ
  useEffect(() => {
    const map = map4dRef.current;
    if (!map || !isMapReady || !supportsMapModes) return;

    try {
      if (activeMapMode === 'map3d') {
        map.enable3dMode(true);
      } else {
        map.enable3dMode(false);
        map.setMapType(activeMapMode);
      }
    } catch (err) {
      console.warn(`Map4D không đổi được sang kiểu "${activeMapMode}":`, err);
    }
  }, [activeMapMode, isMapReady, supportsMapModes]);

  // Nhãn quận huyện — vẽ một lần khi bản đồ sẵn sàng
  useEffect(() => {
    const map = map4dRef.current;
    if (!map || !isMapReady || districtLabelsRef.current.length > 0) return;

    const districtLabels = [
      { name: 'THANH KHÊ', lat: 16.0690, lng: 108.1880 },
      { name: 'HẢI CHÂU', lat: 16.0520, lng: 108.2180 },
      { name: 'SƠN TRÀ', lat: 16.0880, lng: 108.2500 },
      { name: 'SÔNG HÀN', lat: 16.0720, lng: 108.2320, isWater: true },
      { name: 'NGŨ HÀNH SƠN', lat: 16.0180, lng: 108.2450 },
    ];

    districtLabels.forEach((dist) => {
      const label = new window.map4d.Marker({
        position: new window.map4d.LatLng(dist.lat, dist.lng),
        iconView: `<div class="text-[11px] font-black tracking-widest uppercase text-slate-500/70 select-none ${
          dist.isWater ? 'text-[#0066FF]/60 italic font-bold' : ''
        }" style="width:120px;text-align:center;pointer-events:none;">${dist.name}</div>`,
        anchor: { x: 0.5, y: 0.5 },
        visible: true,
      });
      label.setMap(map);
      districtLabelsRef.current.push(label);
    });

    const labels = districtLabelsRef.current;
    return () => {
      labels.forEach((l) => l.setMap(null));
      labels.length = 0;
    };
  }, [isMapReady]);

  // Vẽ lại marker mỗi khi danh sách địa điểm hoặc lựa chọn thay đổi
  useEffect(() => {
    const map = map4dRef.current;
    if (!map || !isMapReady) return;

    const drawn = markersRef.current;

    // Xoá marker của những địa điểm không còn trong danh sách
    const wanted = new Set(locations.map((l) => l.id));
    drawn.forEach((marker, id) => {
      if (!wanted.has(id)) {
        marker.setMap(null);
        drawn.delete(id);
      }
    });

    locations.forEach((loc) => {
      const isSelected = selectedLocation?.id === loc.id;

      let colorClass = 'bg-[#0066FF]';
      let iconSvg = '📷';

      if (loc.category === 'ocop_outlet') {
        colorClass = 'bg-[#EF4444]';
        iconSvg = '🛍️';
      } else if (loc.category === 'ocop_facility') {
        colorClass = 'bg-[#10B981]';
        iconSvg = '🏪';
      } else if (loc.category === 'event') {
        colorClass = 'bg-[#8B5CF6]';
        iconSvg = '📅';
      } else if (loc.category === 'cuisine') {
        colorClass = 'bg-[#F59E0B]';
        iconSvg = '🍽️';
      }

      // Giữ nguyên HTML marker của thiết kế gốc — Map4D nhận qua `iconView`,
      // đúng cơ chế mà Leaflet dùng qua `divIcon`.
      const markerHtml = isSelected
        ? `<div class="relative cursor-pointer animate-bounce" style="width:32px;height:48px;">
            <div class="absolute -top-12 -left-5 w-10 h-10 rounded-full bg-[#EF4444] border-3 border-white shadow-xl flex items-center justify-center text-white ring-4 ring-[#EF4444]/30">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div class="w-4 h-2 bg-black/30 rounded-full blur-xs mx-auto mt-8"></div>
          </div>`
        : `<div class="w-8 h-8 rounded-full ${colorClass} border-2 border-white shadow-md flex items-center justify-center text-white text-xs hover:scale-110 transition-transform cursor-pointer">
            <span>${iconSvg}</span>
          </div>`;

      const anchor = isSelected ? { x: 0.5, y: 1.0 } : { x: 0.5, y: 0.5 };
      const existing = drawn.get(loc.id);

      // Marker đã vẽ rồi thì cập nhật tại chỗ để không bị nháy khi lọc.
      // Không phải bản SDK nào cũng có setIconView/setAnchor, nên dò trước;
      // nếu không có thì quay về cách chắc chắn: xoá rồi vẽ lại.
      if (existing) {
        if (typeof existing.setIconView === 'function') {
          existing.setIconView(markerHtml);
          if (typeof existing.setAnchor === 'function') existing.setAnchor(anchor);
          return;
        }
        existing.setMap(null);
        drawn.delete(loc.id);
      }

      const marker = new window.map4d.Marker({
        position: new window.map4d.LatLng(loc.lat, loc.lng),
        iconView: markerHtml,
        anchor,
        title: loc.name,
        visible: true,
      });
      marker.setMap(map);
      drawn.set(loc.id, marker);
    });

    // Khi bộ lọc đổi mà chưa chọn địa điểm nào, canh khung nhìn ôm trọn kết quả.
    // Thiếu bước này thì lọc theo quận xa (Cẩm Lệ, Hòa Vang…) sẽ ra marker nằm
    // ngoài màn hình, người dùng tưởng bộ lọc không chạy.
    const filterKey = locations.map((l) => l.id).join(',');
    if (!selectedLocation && locations.length > 0 && filterKey !== lastFitKeyRef.current) {
      lastFitKeyRef.current = filterKey;
      try {
        const bounds = new window.map4d.LatLngBounds();
        locations.forEach((l) => bounds.extend(new window.map4d.LatLng(l.lat, l.lng)));
        map.fitBounds(bounds);
      } catch (err) {
        console.warn('Không canh được khung nhìn theo bộ lọc:', err);
      }
    }

    // Đưa camera tới địa điểm đang chọn
    if (selectedLocation) {
      const camera = map.getCamera();
      map.moveCamera(
        new window.map4d.CameraPosition(
          new window.map4d.LatLng(selectedLocation.lat, selectedLocation.lng),
          camera.getTilt(),
          camera.getBearing(),
          15
        ),
        { animate: true }
      );
    }
  }, [locations, selectedLocation, isMapReady]);

  // Bắt mọi cú bấm trên bản đồ.
  //
  // QUAN TRỌNG: phải khai báo đủ `marker: true`. Map4D lọc listener theo loại
  // đối tượng bị bấm — bấm trúng marker mà listener không khai `marker` thì
  // SDK không gọi listener nào cả, nhìn như bản đồ không phản hồi.
  //
  // Bốn trường hợp, xét theo thứ tự:
  //   1. marker của mình   → mở đúng địa điểm đó
  //   2. POI nền Map4D     → điểm tạm + tra ngược địa chỉ
  //   3. "place" Map4D     → điểm tạm + tra ngược địa chỉ
  //   4. chỗ trống bất kỳ  → điểm tạm + tra ngược địa chỉ
  useEffect(() => {
    const map = map4dRef.current;
    if (!map || !isMapReady) return;

    map.addListener(
      'click',
      async (args: any) => {
        // 1. Marker của mình — so khớp trực tiếp đối tượng marker SDK trả về
        //    với các marker đang vẽ, không dựa vào id.
        if (args?.marker) {
          for (const [locId, marker] of markersRef.current) {
            if (marker === args.marker) {
              const loc = locationsRef.current.find((l) => l.id === locId);
              if (loc) onSelectLocationRef.current(loc);
              return;
            }
          }

          // Marker điểm bán của sản phẩm — hiện thẻ kèm tên và tình trạng hàng
          const hit = sellingByMarkerRef.current.find((x) => x.marker === args.marker);
          if (hit) {
            const sp = hit.point;
            onMapPointClickRef.current?.(
              buildAdHocLocation({
                id: `${AD_HOC_ID_PREFIX}store-${sp.id}`,
                name: sp.name,
                lat: sp.lat,
                lng: sp.lng,
                address: `${sp.address} · ${sp.stockStatus}`,
                categoryLabel: 'Điểm bán OCOP',
                category: 'ocop_outlet',
              })
            );
            return;
          }
        }

        const notify = onMapPointClickRef.current;
        if (!notify) return;

        // 2. POI nền của Map4D (quán ăn, khách sạn… có nhãn sẵn trên bản đồ)
        const poi = args?.poi;
        if (poi) {
          const lat = poi.location?.lat ?? poi.position?.lat ?? args.location?.lat;
          const lng = poi.location?.lng ?? poi.position?.lng ?? args.location?.lng;
          if (lat == null || lng == null) return;

          const name = poi.name || poi.title || 'Địa điểm';
          notify(
            buildAdHocLocation({
              id: `${AD_HOC_ID_PREFIX}poi-${poi.id ?? `${lat},${lng}`}`,
              name,
              lat,
              lng,
              address: 'Đang tra địa chỉ…',
              categoryLabel: poi.type || 'Địa điểm',
            })
          );
          resolveAddressThenUpdate(lat, lng, name, `${AD_HOC_ID_PREFIX}poi-${poi.id ?? `${lat},${lng}`}`, poi.type);
          return;
        }

        // 3. "Place" của Map4D
        const place = args?.place;
        if (place) {
          const lat = place.location?.lat;
          const lng = place.location?.lng;
          if (lat == null || lng == null) return;

          const id = `${AD_HOC_ID_PREFIX}place-${place.id ?? `${lat},${lng}`}`;
          const name = place.name || 'Địa điểm';
          notify(buildAdHocLocation({ id, name, lat, lng, address: 'Đang tra địa chỉ…' }));
          resolveAddressThenUpdate(lat, lng, name, id);
          return;
        }

        // 4. Chỗ trống bất kỳ trên bản đồ
        const loc = args?.location;
        if (loc?.lat != null && loc?.lng != null) {
          const id = `${AD_HOC_ID_PREFIX}point-${loc.lat},${loc.lng}`;
          notify(
            buildAdHocLocation({
              id,
              name: 'Vị trí đã chọn',
              lat: loc.lat,
              lng: loc.lng,
              address: 'Đang tra địa chỉ…',
            })
          );
          resolveAddressThenUpdate(loc.lat, loc.lng, 'Vị trí đã chọn', id);
        }
      },
      { marker: true, poi: true, place: true, mappoi: true }
    );

    /** Tra ngược địa chỉ rồi cập nhật lại thẻ — thẻ hiện ngay, địa chỉ điền sau. */
    async function resolveAddressThenUpdate(
      lat: number,
      lng: number,
      name: string,
      id: string,
      categoryLabel?: string
    ) {
      try {
        const address = await SearchService.reverseGeocode(lat, lng);
        onMapPointClickRef.current?.(
          buildAdHocLocation({ id, name, lat, lng, address, categoryLabel })
        );
      } catch {
        onMapPointClickRef.current?.(
          buildAdHocLocation({ id, name, lat, lng, categoryLabel })
        );
      }
    }
  }, [isMapReady]);

  // Vẽ các điểm bán của một sản phẩm và đưa khung nhìn tới chúng.
  //
  // Trước đây nút "Định vị trên bản đồ" chỉ đổi bộ lọc danh mục sang "tất cả
  // điểm bán OCOP" và không hề dùng `sellingLocations` của sản phẩm, bản đồ
  // cũng không dịch chuyển — nên người dùng tưởng nút không hoạt động.
  useEffect(() => {
    const map = map4dRef.current;
    if (!map || !isMapReady) return;

    sellingLayersRef.current.forEach((l) => l.setMap(null));
    sellingLayersRef.current = [];
    sellingByMarkerRef.current = [];

    const points = sellingPoints?.points ?? [];
    if (points.length === 0) return;
    setIsSellingListOpen(true);

    try {
      const bounds = new window.map4d.LatLngBounds();

      points.forEach((sp, i) => {
        const inStock = sp.stockStatus === 'Còn hàng';
        const color = inStock ? '#198754' : sp.stockStatus === 'Hết hàng' ? '#94A3B8' : '#F47A1F';

        // Hiện luôn tên cửa hàng dưới marker — chỉ đánh số thì người dùng
        // không biết điểm nào là điểm nào.
        const safeName = sp.name.replace(/[<>&]/g, '');
        const marker = new window.map4d.Marker({
          position: new window.map4d.LatLng(sp.lat, sp.lng),
          // Khối ngoài PHẢI khai báo width/height cụ thể. Map4D dựa vào kích
          // thước này để đặt lớp phủ; để trống thì khối co về 0 và marker
          // không hiện ra — đúng lỗi đã gặp.
          iconView: `
            <div style="width:180px;height:58px;display:flex;flex-direction:column;
                        align-items:center;justify-content:flex-start;cursor:pointer;">
              <div style="display:flex;align-items:center;justify-content:center;
                          width:30px;height:30px;flex:0 0 30px;border-radius:9999px;
                          background:${color};border:3px solid #fff;
                          box-shadow:0 2px 6px rgba(0,0,0,.35);
                          color:#fff;font-size:12px;font-weight:800;">${i + 1}</div>
              <div style="margin-top:3px;max-width:180px;padding:2px 7px;border-radius:9999px;
                          background:rgba(255,255,255,.96);border:1px solid #E5E7EB;
                          box-shadow:0 1px 4px rgba(0,0,0,.18);font-size:11px;font-weight:700;
                          color:#1F2937;white-space:nowrap;overflow:hidden;
                          text-overflow:ellipsis;">${safeName}</div>
            </div>`,
          anchor: { x: 0.5, y: 0.26 },
          title: sp.name,
          visible: true,
        });
        marker.setMap(map);
        sellingLayersRef.current.push(marker);
        sellingByMarkerRef.current.push({ marker, point: sp });
        bounds.extend(new window.map4d.LatLng(sp.lat, sp.lng));
      });

      map.fitBounds(bounds);
      console.log(`[Điểm bán] Đã vẽ ${sellingLayersRef.current.length}/${points.length} marker`);
    } catch (err) {
      console.error('Không vẽ được các điểm bán:', err);
    }
  }, [sellingPoints, isMapReady]);

  // Vẽ lộ trình lên bản đồ Map4D.
  //
  // Đường đi lấy từ Map4D Route API (overviewPolyline đã giải mã sẵn trong
  // RoutingService), nên tuyến hiển thị đúng bằng tuyến mà API tính ra.
  useEffect(() => {
    const map = map4dRef.current;
    if (!map || !isMapReady) return;

    // Xoá lộ trình cũ trước khi vẽ cái mới
    routeLayersRef.current.forEach((l) => l.setMap(null));
    routeLayersRef.current = [];

    if (!route || route.path.length === 0) return;

    try {
      const polyline = new window.map4d.Polyline({
        path: route.path.map((p) => new window.map4d.LatLng(p.lat, p.lng)),
        strokeColor: '#F47A1F',
        strokeWidth: 6,
        strokeOpacity: 0.9,
      });
      polyline.setMap(map);
      routeLayersRef.current.push(polyline);

      const pin = (color: string, label: string) => `
        <div style="display:flex;align-items:center;justify-content:center;width:26px;height:26px;">
          <svg width="26" height="26" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="${color}" stroke-width="3"/>
            <text x="12" y="16" text-anchor="middle" font-size="11" font-weight="700"
                  fill="${color}" font-family="system-ui, sans-serif">${label}</text>
          </svg>
        </div>`;

      const start = new window.map4d.Marker({
        position: new window.map4d.LatLng(route.origin.lat, route.origin.lng),
        iconView: pin('#198754', 'A'),
        anchor: { x: 0.5, y: 0.5 },
        title: 'Điểm xuất phát',
        visible: true,
      });
      start.setMap(map);
      routeLayersRef.current.push(start);

      const end = new window.map4d.Marker({
        position: new window.map4d.LatLng(route.destination.lat, route.destination.lng),
        iconView: pin('#EF4444', 'B'),
        anchor: { x: 0.5, y: 0.5 },
        title: 'Điểm đến',
        visible: true,
      });
      end.setMap(map);
      routeLayersRef.current.push(end);

      // Chỉnh khung nhìn ôm trọn lộ trình
      const bounds = new window.map4d.LatLngBounds();
      route.path.forEach((p) => bounds.extend(new window.map4d.LatLng(p.lat, p.lng)));
      map.fitBounds(bounds);
    } catch (err) {
      console.error('Không vẽ được lộ trình lên bản đồ:', err);
    }
  }, [route, isMapReady]);

  // Dọn marker khi component bị gỡ
  useEffect(() => {
    const drawn = markersRef.current;
    const routeLayers = routeLayersRef.current;
    return () => {
      drawn.forEach((m) => m.setMap(null));
      drawn.clear();
      routeLayers.forEach((l) => l.setMap(null));
      routeLayers.length = 0;
      sellingLayersRef.current.forEach((l) => l.setMap(null));
      sellingLayersRef.current = [];
    };
  }, []);

  const moveCameraTo = (lat: number, lng: number, zoom: number) => {
    const map = map4dRef.current;
    if (!map) return;
    const camera = map.getCamera();
    map.moveCamera(
      new window.map4d.CameraPosition(
        new window.map4d.LatLng(lat, lng),
        camera.getTilt(),
        camera.getBearing(),
        zoom
      ),
      { animate: true }
    );
  };

  const zoomBy = (delta: number) => {
    const map = map4dRef.current;
    if (!map) return;
    const camera = map.getCamera();
    const target = camera.getTarget();
    map.moveCamera(
      new window.map4d.CameraPosition(
        target,
        camera.getTilt(),
        camera.getBearing(),
        camera.getZoom() + delta
      ),
      { animate: true }
    );
  };

  /** Bấm một dòng trong bảng điểm bán: đưa bản đồ tới nơi và mở thẻ thông tin. */
  const focusSellingPoint = (sp: SellingPointItem) => {
    moveCameraTo(sp.lat, sp.lng, 17);
    onMapPointClickRef.current?.(
      buildAdHocLocation({
        id: `${AD_HOC_ID_PREFIX}store-${sp.id}`,
        name: sp.name,
        lat: sp.lat,
        lng: sp.lng,
        address: `${sp.address} · ${sp.stockStatus}`,
        categoryLabel: 'Điểm bán OCOP',
        category: 'ocop_outlet',
      })
    );
  };

  const handleZoomIn = () => zoomBy(1);
  const handleZoomOut = () => zoomBy(-1);
  const handleRecenter = () => moveCameraTo(DANANG_CENTER[0], DANANG_CENTER[1], 14);


  return (
    <div className="relative w-full h-full min-h-screen bg-slate-100 flex flex-col overflow-hidden">
      {/* 1. Khung bản đồ Map4D (toàn màn hình) */}
      <div ref={mapRef} className="w-full h-full absolute inset-0 z-0" />

      {/* Trạng thái tải / lỗi bản đồ */}
      {!isMapReady && !mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <div className="w-4 h-4 rounded-full border-2 border-slate-300 border-t-[#F47A1F] animate-spin" />
            <span>Đang tải bản đồ Map4D…</span>
          </div>
        </div>
      )}

      {mapError && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-100 p-6">
          <div className="max-w-sm rounded-2xl border border-red-200 bg-white p-4 text-center shadow-lg">
            <p className="text-sm font-bold text-red-600">Không tải được bản đồ</p>
            <p className="mt-1 text-xs text-slate-600">{mapError}</p>
            <p className="mt-2 text-[11px] text-slate-400">
              Kiểm tra biến môi trường <code>VITE_MAP4D_MAP_KEY</code> trong file <code>.env</code>.
            </p>
          </div>
        </div>
      )}

      {/* 2. Top-Left Google Maps Search Bar floating on map */}
      <div 
        ref={searchContainerRef}
        className={`absolute top-3 left-3 sm:top-4 sm:left-4 z-30 flex flex-col gap-2 transition-all duration-300 max-w-[calc(100vw-24px)] w-full sm:w-[410px] ${
          isDrawerOpen ? 'sm:left-[435px]' : 'sm:left-4'
        }`}
      >
        {/* Search Input Card (Google Maps style) */}
        <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2.5 rounded-2xl shadow-xl border border-slate-200/90 text-slate-800 transition-all">
          <button
            onClick={onToggleDrawer}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer shrink-0"
            title={isDrawerOpen ? "Thu gọn danh sách" : "Mở danh sách kết quả"}
          >
            <Menu className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSuggestionsOpen(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSuggestionsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setIsSuggestionsOpen(false);
                if (!isDrawerOpen) onToggleDrawer();
              }
            }}
            placeholder={
              mainTab === 'locations'
                ? "Tìm địa điểm, điểm tham quan, cơ sở OCOP..."
                : "Tìm đặc sản OCOP, chả bò, mắm nêm, trà sâm..."
            }
            className="w-full bg-transparent text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none truncate"
          />

          {searchQuery ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSuggestionsOpen(true);
              }}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer shrink-0"
              title="Xóa tìm kiếm"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsSuggestionsOpen((prev) => !prev)}
              className="p-1 rounded-full text-slate-400 hover:text-[#F47A1F] transition-colors cursor-pointer shrink-0"
              title="Gợi ý tìm kiếm"
            >
              <Search className="w-4 h-4" />
            </button>
          )}

          <div className="h-5 w-[1px] bg-slate-200 shrink-0" />

          <button
            onClick={onOpenFilterModal}
            className="p-2 rounded-xl bg-[#F47A1F] text-white hover:bg-[#D9630F] transition-colors cursor-pointer shrink-0 shadow-xs"
            title="Bộ lọc nâng cao"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>

        {/* 2 Parallel Search Mode Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
          <button
            onClick={() => {
              if (setMainTab) setMainTab('locations');
              setIsSuggestionsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all shadow-md cursor-pointer shrink-0 ${
              mainTab === 'locations'
                ? 'bg-[#14213D] text-white ring-2 ring-[#F47A1F] shadow-lg scale-102'
                : 'bg-white/95 backdrop-blur-md text-slate-700 hover:bg-slate-100 border border-slate-200/90'
            }`}
          >
            <MapPin className={`w-4 h-4 ${mainTab === 'locations' ? 'text-[#F47A1F]' : 'text-slate-500'}`} />
            <span>Tìm Địa điểm</span>
          </button>

          <button
            onClick={() => {
              if (setMainTab) setMainTab('products');
              setIsSuggestionsOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all shadow-md cursor-pointer shrink-0 ${
              mainTab === 'products'
                ? 'bg-[#F47A1F] text-white ring-2 ring-[#14213D] shadow-lg scale-102'
                : 'bg-white/95 backdrop-blur-md text-slate-700 hover:bg-slate-100 border border-slate-200/90'
            }`}
          >
            <ShoppingBag className={`w-4 h-4 ${mainTab === 'products' ? 'text-white' : 'text-[#F47A1F]'}`} />
            <span>Tìm Sản phẩm OCOP</span>
          </button>
        </div>

        {/* 3. Floating Autocomplete / Suggestions Popover */}
        {isSuggestionsOpen && (
          <div className="bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 overflow-hidden max-h-[420px] overflow-y-auto animate-in fade-in duration-150">
            {/* Direct Switcher Inside Popover */}
            <div className="p-2 bg-slate-50 border-b border-slate-200/80 flex items-center gap-1">
              <button
                onClick={() => setMainTab?.('locations')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mainTab === 'locations'
                    ? 'bg-[#14213D] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#F47A1F]" />
                <span>Tìm Địa điểm</span>
              </button>
              <button
                onClick={() => setMainTab?.('products')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  mainTab === 'products'
                    ? 'bg-[#F47A1F] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Tìm Sản phẩm OCOP</span>
              </button>
            </div>

            {mainTab === 'locations' ? (
              /* Place Search Mode View */
              <div className="p-2 space-y-2">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>📍 Kết quả Địa điểm phù hợp</span>
                  <span className="text-slate-500 font-semibold">{matchingLocations.length} địa điểm</span>
                </div>

                {matchingLocations.length > 0 ? (
                  <div className="space-y-0.5">
                    {matchingLocations.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => {
                          onSelectLocation(loc);
                          setIsSuggestionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50/80 text-left transition-colors cursor-pointer group"
                      >
                        <img src={loc.image} alt={loc.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-[#F47A1F] transition-colors">
                              {loc.name}
                            </p>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-orange-100 text-[#F47A1F] shrink-0">
                              {loc.categoryLabel}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {loc.address} • Cách {loc.distanceStr}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#F47A1F] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs font-medium text-slate-600">Không tìm thấy địa điểm cho "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Thử tìm "Cầu Rồng", "Chợ Hàn", "Ngũ Hành Sơn"</p>
                  </div>
                )}
              </div>
            ) : (
              /* Product Search Mode View */
              <div className="p-2 space-y-2">
                <div className="px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>🛍️ Kết quả Sản phẩm OCOP phù hợp</span>
                  <span className="text-slate-500 font-semibold">{matchingProducts.length} sản phẩm</span>
                </div>

                {matchingProducts.length > 0 ? (
                  <div className="space-y-0.5">
                    {matchingProducts.map((prod) => (
                      <button
                        key={prod.id}
                        onClick={() => {
                          if (onOpenProductDetail) onOpenProductDetail(prod);
                          setIsSuggestionsOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-orange-50/80 text-left transition-colors cursor-pointer group"
                      >
                        <img src={prod.image} alt={prod.name} className="w-10 h-10 rounded-lg object-cover shrink-0 border border-slate-200" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-[#F47A1F] transition-colors">
                              {prod.name}
                            </p>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 shrink-0">
                              {prod.starRating}⭐ OCOP
                            </span>
                          </div>
                          <p className="text-[11px] text-orange-600 font-extrabold truncate mt-0.5">
                            {prod.priceStr} • <span className="text-slate-500 font-normal">{prod.producerName}</span>
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-[#F47A1F] group-hover:translate-x-0.5 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-xs font-medium text-slate-600">Không tìm thấy sản phẩm OCOP cho "{searchQuery}"</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Thử tìm "Chả bò", "Bánh Khô Mè", "Mắm Nêm", "Sâm"</p>
                  </div>
                )}
              </div>
            )}

            {/* Popular quick tags bottom */}
            <div className="p-2.5 bg-slate-50 border-t border-slate-100">
              <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F47A1F]" />
                <span>Từ khóa hot Đà Nẵng</span>
              </p>
              <div className="flex flex-wrap gap-1">
                {['Cầu Rồng', 'Chợ Hàn', 'Bánh Khô Mè', 'Chả bò Đà Nẵng', 'Mắm Nêm Dì Cẩn', 'Nước mắm Nam Ô', 'Sâm Ngọk Linh'].map((kw) => (
                  <button
                    key={kw}
                    onClick={() => {
                      setSearchQuery(kw);
                      setIsSuggestionsOpen(true);
                    }}
                    className="px-2 py-0.5 rounded-full bg-white border border-slate-200 hover:border-[#F47A1F] hover:text-[#F47A1F] text-slate-700 text-[11px] font-medium transition-colors cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Top-Right Google Maps Quick Control Bar with Map Layer Switcher */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
        {/* Nút đổi lớp bản đồ — chỉ hiện nếu bản SDK Map4D đang chạy hỗ trợ */}
        <div className="relative" hidden={!supportsMapModes}>
          <button
            onClick={() => setIsMapModeSelectorOpen((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border text-xs font-extrabold transition-all cursor-pointer ${
              isMapModeSelectorOpen
                ? 'border-[#F47A1F] text-[#F47A1F] ring-2 ring-[#F47A1F]/30 bg-orange-50/80'
                : 'border-slate-200 text-slate-800 hover:bg-slate-50'
            }`}
            title="Chuyển đổi các loại bản đồ"
          >
            <Layers className="w-4 h-4 text-[#F47A1F]" />
            <span className="hidden sm:inline">Lớp bản đồ</span>
            <span className="text-[10px] px-1.5 py-0.2 bg-orange-100 text-[#F47A1F] rounded-md font-black">
              {MAP_MODE_OPTIONS.find((m) => m.id === activeMapMode)?.name}
            </span>
          </button>

          {/* Map Layer Selector Popover */}
          {isMapModeSelectorOpen && (
            <div className="absolute top-12 right-0 z-50 w-72 bg-white/98 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#F47A1F]" />
                  <span className="text-xs font-black text-slate-800">Chọn chế độ bản đồ</span>
                </div>
                <button
                  onClick={() => setIsMapModeSelectorOpen(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {MAP_MODE_OPTIONS.map((mode) => {
                  const isSelected = activeMapMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setActiveMapMode(mode.id);
                        setIsMapModeSelectorOpen(false);
                      }}
                      className={`flex flex-col p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-50/90 border-[#F47A1F] ring-2 ring-[#F47A1F]/30 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-lg">{mode.icon}</span>
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-[#F47A1F] text-white' : 'bg-slate-200 text-slate-600'
                        }`}>
                          {mode.badge}
                        </span>
                      </div>
                      <p className={`text-xs font-bold mt-1.5 ${isSelected ? 'text-[#F47A1F]' : 'text-slate-800'}`}>
                        {mode.name}
                      </p>
                      <p className="text-[10px] text-slate-500 leading-tight mt-0.5 line-clamp-2">
                        {mode.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {onOpenFavorites && (
          <button
            onClick={onOpenFavorites}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
            title="Địa điểm & sản phẩm đã lưu"
          >
            <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
            <span className="hidden sm:inline">Đã lưu</span>
            {favoriteCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-red-500 text-white">
                {favoriteCount}
              </span>
            )}
          </button>
        )}

        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-md border border-slate-200 text-xs font-extrabold text-slate-800 hover:bg-slate-50 transition-all cursor-pointer"
            title="Giới thiệu ứng dụng"
          >
            <Info className="w-4 h-4 text-[#F47A1F]" />
            <span className="hidden sm:inline">Giới thiệu</span>
          </button>
        )}
      </div>

      {/* 4. Map Popup Callout (When a location like Chợ Hàn is selected) */}
      {selectedLocation && (
        <div 
          className={`absolute bottom-6 z-20 w-80 sm:w-96 bg-white/98 backdrop-blur-md rounded-2xl p-3.5 shadow-2xl border border-slate-200 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 ${
            isDrawerOpen ? 'left-4 sm:left-[435px]' : 'left-4 sm:left-6'
          }`}
        >
          {/* Close button */}
          <button
            onClick={() => onCloseCallout?.()}
            className="absolute top-2.5 right-2.5 p-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex gap-3 items-center">
            <img
              src={selectedLocation.image}
              alt={selectedLocation.name}
              className="w-20 h-20 rounded-xl object-cover shrink-0 border border-slate-200 shadow-xs"
            />
            <div className="flex-1 min-w-0 pr-4">
              <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-[#EF4444]">
                {selectedLocation.categoryLabel}
              </span>
              <h3 className="font-black text-sm text-[#1F2937] truncate mt-0.5">
                {selectedLocation.name}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1 truncate">
                {selectedLocation.address}
              </p>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                📍 {selectedLocation.distanceStr} • <span className="text-emerald-600 font-bold">{selectedLocation.status}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-100">
            <button
              onClick={() => onOpenDetail(selectedLocation)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold text-[#F47A1F] border border-[#F47A1F] hover:bg-[#F47A1F]/10 transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Chi tiết</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onOpenDirections?.(selectedLocation)}
              className="w-full py-2 px-3 rounded-xl text-xs font-bold bg-[#F47A1F] text-white hover:bg-[#D9630F] transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <Navigation className="w-3.5 h-3.5 fill-current" />
              <span>Chỉ đường</span>
            </button>
          </div>
        </div>
      )}

      {/* Bảng danh sách điểm bán — đi kèm marker trên bản đồ cho dễ đối chiếu */}
      {sellingPoints && sellingPoints.points.length > 0 && (
        <div
          className={`absolute top-28 sm:top-32 z-30 w-[300px] max-w-[calc(100vw-32px)] transition-all duration-300 ${
            isDrawerOpen ? 'left-4 sm:left-[435px]' : 'left-4 sm:left-6'
          }`}
        >
          <div className="bg-white/97 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
            {/* Đầu bảng */}
            <div className="flex items-start gap-2.5 px-3.5 py-2.5 border-b border-slate-100 bg-[#FFF9F3]">
              <ShoppingBag className="w-4 h-4 text-[#F47A1F] shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-black text-slate-800">
                  {sellingPoints.points.length} điểm bán
                </p>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {sellingPoints.productName}
                </p>
              </div>
              <button
                onClick={() => setIsSellingListOpen((v) => !v)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label={isSellingListOpen ? 'Thu gọn danh sách' : 'Mở danh sách'}
              >
                {isSellingListOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => onClearSellingPoints?.()}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
                aria-label="Bỏ hiển thị điểm bán"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Danh sách — số thứ tự khớp với số trên marker */}
            {isSellingListOpen && (
              <div className="max-h-[46vh] overflow-y-auto divide-y divide-slate-100">
                {sellingPoints.points.map((sp, i) => {
                  const color =
                    sp.stockStatus === 'Còn hàng'
                      ? '#198754'
                      : sp.stockStatus === 'Hết hàng'
                        ? '#94A3B8'
                        : '#F47A1F';
                  return (
                    <button
                      key={sp.id}
                      onClick={() => focusSellingPoint(sp)}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left hover:bg-orange-50/70 transition-colors cursor-pointer group"
                    >
                      <span
                        className="w-6 h-6 shrink-0 rounded-full flex items-center justify-center text-[11px] font-black text-white mt-0.5"
                        style={{ backgroundColor: color }}
                      >
                        {i + 1}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs font-bold text-slate-800 truncate group-hover:text-[#F47A1F] transition-colors">
                          {sp.name}
                        </span>
                        <span className="block text-[11px] text-slate-500 truncate">
                          {sp.address}
                        </span>
                        <span className="mt-0.5 flex items-center gap-2 text-[10px] font-semibold">
                          <span style={{ color }}>{sp.stockStatus}</span>
                          {sp.distanceStr && <span className="text-slate-400">{sp.distanceStr}</span>}
                        </span>
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0 mt-1 group-hover:text-[#F47A1F] group-hover:translate-x-0.5 transition-all" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Bottom Right Map Control FABs (+ / - / GPS) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleRecenter}
          title="Về trung tâm Đà Nẵng"
          className="p-3 rounded-2xl bg-white shadow-lg border border-slate-200 text-slate-700 hover:text-[#F47A1F] hover:bg-slate-50 transition-all cursor-pointer"
        >
          <Crosshair className="w-5 h-5 text-[#F47A1F]" />
        </button>

        <div className="flex flex-col rounded-2xl bg-white shadow-lg border border-slate-200 overflow-hidden divide-y divide-slate-100">
          <button
            onClick={handleZoomIn}
            title="Phóng to"
            className="p-3 text-slate-700 hover:bg-slate-50 hover:text-[#F47A1F] transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            title="Thu nhỏ"
            className="p-3 text-slate-700 hover:bg-slate-50 hover:text-[#F47A1F] transition-all cursor-pointer"
          >
            <Minus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

