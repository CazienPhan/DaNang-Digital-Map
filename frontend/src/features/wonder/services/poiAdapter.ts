import type { POIData, POIDetailData } from '@/services/supabase/poi.service';
import type { CategoryType, LocationItem } from '../types';

/**
 * Chuyển dữ liệu POI thật từ Supabase sang kiểu LocationItem mà giao diện dùng.
 *
 * Đây là tầng adapter — nhờ nó mà các component giao diện không phải sửa gì khi
 * đổi nguồn dữ liệu, và tầng services của bản gốc cũng giữ nguyên.
 */

// ─── Danh mục ────────────────────────────────────────────────────────────────

/** poi_type trong database → danh mục của giao diện. */
const CATEGORY_BY_POI_TYPE: Record<string, CategoryType> = {
  OCOP_STORE: 'ocop_outlet',
  MARKET: 'ocop_outlet',
  TOURISM: 'attraction',
  RESTAURANT: 'cuisine',
  HOTEL: 'attraction',
};

const CATEGORY_LABEL: Record<string, string> = {
  OCOP_STORE: 'Điểm bán OCOP',
  MARKET: 'Chợ truyền thống',
  TOURISM: 'Điểm tham quan',
  RESTAURANT: 'Ẩm thực',
  HOTEL: 'Lưu trú',
  UNVERIFIED: 'Chưa xác minh',
  OTHER: 'Địa điểm',
};

export function toCategory(poiType?: string | null): CategoryType {
  return CATEGORY_BY_POI_TYPE[poiType ?? ''] ?? 'attraction';
}

// ─── Quận / huyện ────────────────────────────────────────────────────────────

/**
 * Database chưa có cột quận/huyện, nhưng địa chỉ ghi theo dạng
 * "… , Phường Thanh Khê, Thành phố Đà Nẵng, Việt Nam" nên tách ra được.
 * Đo trên dữ liệu thật: tách được 1.756/1.760 bản ghi (99%).
 *
 * Đây là giải pháp tạm. Khi database có cột `district` thì đọc thẳng từ đó.
 */
const DISTRICT_RE = /(?:Phường|Xã|Quận|Huyện)\s+([^,]+)/;

/** Gom tên phường về đúng quận/huyện mà bộ lọc đang dùng. */
const DISTRICT_ALIAS: Record<string, string> = {
  'Hoà Xuân': 'Cẩm Lệ',
  'Hòa Xuân': 'Cẩm Lệ',
  'Hoà Cường': 'Hải Châu',
  'Hòa Cường': 'Hải Châu',
  'Hoà Khánh': 'Liên Chiểu',
  'Hòa Khánh': 'Liên Chiểu',
  'Hải Vân': 'Liên Chiểu',
  'An Khê': 'Thanh Khê',
  'An Hải': 'Sơn Trà',
  'Hoà Vang': 'Hòa Vang',
};

export function extractDistrict(address?: string | null): string {
  if (!address) return '';
  const m = DISTRICT_RE.exec(address);
  if (!m) return '';
  const raw = m[1].trim();
  return DISTRICT_ALIAS[raw] ?? raw;
}

// ─── Giờ mở cửa ──────────────────────────────────────────────────────────────

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

/** `gio_mo_cua` là object theo từng thứ — lấy giờ của hôm nay. */
export function todayOpeningHours(gioMoCua?: Record<string, string> | null): string {
  if (!gioMoCua) return '';
  const key = WEEKDAY_KEYS[new Date().getDay()];
  return gioMoCua[key] ?? Object.values(gioMoCua)[0] ?? '';
}

/** Suy trạng thái mở/đóng từ chuỗi kiểu "06:30 - 22:00". */
export function openStatus(hours: string): LocationItem['status'] {
  const m = /(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/.exec(hours);
  if (!m) return 'Đang mở';
  const now = new Date();
  const cur = now.getHours() * 60 + now.getMinutes();
  const open = +m[1] * 60 + +m[2];
  const close = +m[3] * 60 + +m[4];
  if (cur < open) return 'Sắp mở cửa';
  return cur <= close ? 'Đang mở' : 'Đóng cửa';
}

// ─── Điện thoại ──────────────────────────────────────────────────────────────

/** `sdt` có khi là chuỗi JSON dạng '["0935599876"]'. */
export function parsePhone(sdt?: string | null): string | undefined {
  if (!sdt) return undefined;
  const raw = sdt.trim();
  if (raw.startsWith('[')) {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) && arr.length ? String(arr[0]) : undefined;
    } catch {
      return undefined;
    }
  }
  return raw || undefined;
}

// ─── Chuyển đổi chính ────────────────────────────────────────────────────────

/**
 * POI trong danh sách → LocationItem.
 *
 * Endpoint danh sách chỉ trả các trường cơ bản (không có đánh giá, mô tả, ảnh),
 * nên phần còn thiếu để trống và sẽ được bổ sung khi người dùng mở chi tiết.
 */
export function poiToLocation(poi: POIData): LocationItem {
  const category = toCategory(poi.poi_type);
  return {
    id: poi.id,
    name: poi.name || 'Địa điểm',
    category,
    categoryLabel: poi.category_name || CATEGORY_LABEL[poi.poi_type] || 'Địa điểm',
    isVerified: poi.poi_type !== 'UNVERIFIED',
    distanceStr: '',
    status: 'Đang mở',
    // Database chưa lưu đánh giá — để 0 và giao diện tự ẩn phần này đi.
    rating: 0,
    reviewCount: 0,
    address: poi.dia_chi || '',
    district: extractDistrict(poi.dia_chi),
    lat: Number(poi.lat),
    lng: Number(poi.lng),
    image: poi.iconUrl || `/places/placeholder-${category}.svg`,
  };
}

/** Chi tiết POI → LocationItem đầy đủ, dùng cho trang chi tiết. */
export function poiDetailToLocation(poi: POIDetailData): LocationItem {
  const base = poiToLocation(poi as unknown as POIData);
  const images = (poi.media ?? [])
    .filter((m) => m.media_type === 'IMAGE' && m.url)
    .map((m) => m.url);
  const hours = todayOpeningHours(poi.gio_mo_cua);

  return {
    ...base,
    categoryLabel: poi.category_name || base.categoryLabel,
    isVerified: poi.is_verified ?? base.isVerified,
    rating: poi.so_sao ?? 0,
    reviewCount: poi.luot_danh_gia ?? 0,
    status: hours ? openStatus(hours) : base.status,
    openingHours: hours || undefined,
    phone: parsePhone(poi.sdt),
    description: poi.gioi_thieu || undefined,
    image: images[0] || base.image,
    galleryImages: images.length ? images : undefined,
    totalPhotosCount: images.length || undefined,
    tags: [poi.category_name, poi.nganh_hang, base.district].filter(Boolean) as string[],
  };
}
