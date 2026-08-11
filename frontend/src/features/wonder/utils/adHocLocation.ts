import type { CategoryType, LocationItem } from '../types';

/**
 * Dựng một LocationItem "tạm" cho những điểm KHÔNG nằm trong dữ liệu của mình:
 * người dùng bấm vào chỗ trống trên bản đồ, hoặc bấm vào POI nền có sẵn của Map4D.
 *
 * Giao diện WONDER luôn nhận vào LocationItem, nên mọi nguồn khác phải quy về
 * đúng kiểu này trước — cùng nguyên tắc với tầng adapter sẽ dùng ở bước 3 khi
 * nối dữ liệu thật từ Supabase.
 *
 * Những trường mà nguồn ngoài không có (đánh giá, giờ mở cửa, ảnh…) để rỗng;
 * các component đã tự ẩn phần thiếu dữ liệu nên không vỡ giao diện.
 */
export function buildAdHocLocation(input: {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address?: string;
  categoryLabel?: string;
  category?: CategoryType;
}): LocationItem {
  return {
    id: input.id,
    name: input.name || 'Vị trí đã chọn',
    category: input.category ?? 'attraction',
    categoryLabel: input.categoryLabel || 'Địa điểm',
    isVerified: false,
    distanceStr: '',
    status: 'Đang mở',
    rating: 0,
    reviewCount: 0,
    address: input.address || `${input.lat.toFixed(6)}, ${input.lng.toFixed(6)}`,
    district: '',
    lat: input.lat,
    lng: input.lng,
    image: '',
  };
}

/** Điểm tạm thì id có tiền tố này, để phân biệt với địa điểm trong cơ sở dữ liệu. */
export const AD_HOC_ID_PREFIX = 'adhoc-';

export function isAdHocLocation(loc: LocationItem | null): boolean {
  return !!loc && loc.id.startsWith(AD_HOC_ID_PREFIX);
}
