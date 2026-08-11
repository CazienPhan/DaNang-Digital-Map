export type CategoryType = 
  | 'all' 
  | 'attraction' 
  | 'ocop_facility' 
  | 'ocop_outlet' 
  | 'event' 
  | 'cuisine';

export interface LocationWhyVisit {
  title: string;
  desc: string;
  icon: 'star' | 'shield' | 'bag' | 'heart' | 'utensils';
}

export interface FeaturedCategoryChip {
  id: string;
  label: string;
  icon: 'bag' | 'fish' | 'leaf' | 'gift' | 'utensils';
}

export interface DetailedSpecs {
  typeStr: string; // e.g. "Chợ truyền thống"
  scaleStr: string; // e.g. "~600 gian hàng"
  itemsStr: string; // e.g. "Đặc sản, hải sản, thực phẩm, OCOP, quà lưu niệm"
  suitableFor: string; // e.g. "Khách du lịch, người dân địa phương"
  paymentMethods: string; // e.g. "Tiền mặt, chuyển khoản"
}

export interface ReviewItem {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
}

export interface LocationItem {
  id: string;
  name: string;
  category: CategoryType;
  categoryLabel: string;
  isVerified: boolean;
  distanceStr: string;
  status: 'Đang mở' | 'Đóng cửa' | 'Sắp mở cửa';
  rating: number;
  reviewCount: number;
  address: string;
  district: string; // e.g. "Hải Châu", "Sơn Trà", "Thanh Khê"
  lat: number;
  lng: number;
  image: string;
  /**
   * Ghi công ảnh. Bắt buộc với ảnh giấy phép CC BY / CC BY-SA.
   * Bỏ trống nếu là ảnh chờ hoặc ảnh do dự án tự chụp.
   */
  imageCredit?: string;
  galleryImages?: string[];
  totalPhotosCount?: number;
  phone?: string;
  openingHours?: string;
  description?: string;
  whyVisit?: LocationWhyVisit[];
  featuredCategoryChips?: FeaturedCategoryChip[];
  detailedSpecs?: DetailedSpecs;
  featuredOcopProducts?: OCOPProduct[];
  reviewsList?: ReviewItem[];
  nearbyLocationIds?: string[];
  tags?: string[];
}

export interface SellingPointItem {
  id: string;
  name: string;
  distanceStr: string;
  address: string;
  district: string;
  rating: number;
  reviewCount: number;
  stockStatus: 'Còn hàng' | 'Sắp hết hàng' | 'Hết hàng';
  lat: number;
  lng: number;
}

export interface JourneyStep {
  stepNumber: string;
  title: string;
  desc: string;
  image?: string;
}

export interface ProductionStep {
  stepNumber: string;
  title: string;
  desc: string;
  icon?: string;
}

export interface OCOPProduct {
  id: string;
  name: string;
  categoryLabel: string;
  starRating: 3 | 4 | 5;
  priceStr: string;
  producerName: string;
  producerAddress: string;
  image: string;
  /** Ghi công ảnh — bắt buộc với giấy phép CC BY / CC BY-SA. */
  imageCredit?: string;
  description: string;
  isBestSeller?: boolean;
  isVerified?: boolean;
  viewCountStr?: string; // e.g. "100+ đã xem"
  pointCountStr?: string; // e.g. "5 điểm bán"
  locationId?: string; // point to primary outlet or facility
  lat?: number;
  lng?: number;
  
  // Extended OCOP Rich Data from Figma designs
  sellingLocations?: SellingPointItem[];
  storySubtitle?: string;
  storyOverview?: string;
  valueProps?: { title: string; icon: 'tech' | 'pure' | 'quality' | 'traceability' }[];
  journeySteps?: JourneyStep[];
  productionSteps?: ProductionStep[];
  usageGuides?: {
    usageList: string[];
    benefitsList: string[];
    storageList: string[];
  };
  verificationCert?: {
    starRating: number;
    isVerified: boolean;
    producerName: string;
    address: string;
    certDate: string;
    expiryDate: string;
    certCode: string;
    qrCodeUrl?: string;
  };
  relatedProductIds?: string[];
}

export interface CategoryFilter {
  id: CategoryType;
  labelVi: string;
  labelEn: string;
  iconName: 'all' | 'camera' | 'shop' | 'bag' | 'calendar' | 'utensils';
  bgClass: string;
  textClass: string;
  badgeClass: string;
  pinColorHex: string;
}

export interface RecentExploreShortcut {
  id: string;
  title: string;
  distanceStr: string;
  iconType: 'camera' | 'shop' | 'bag';
  locationId: string;
}

export type MainTab = 'locations' | 'products';

export interface ColorSwatch {
  name: string;
  vietnameseName: string;
  hex: string;
  rgb: string;
  role: string;
  textDark?: boolean;
  usage: string;
}

export interface MapCategoryColor {
  id: string;
  nameVi: string;
  nameEn: string;
  hex: string;
  iconName: string;
  description: string;
}

export interface TypographyScale {
  level: string;
  name: string;
  sizePx: string;
  sizeRem: string;
  weight: string;
  sampleVi: string;
}

export interface SignatureBadge {
  id: string;
  label: string;
  type: 'trust' | 'ocop' | 'official' | 'status' | 'distance' | 'feature';
  bgClass: string;
  textClass: string;
  borderClass?: string;
  description: string;
}

export interface MarkerSpecimen {
  id: string;
  category: string;
  title: string;
  color: string;
  rating: number;
  badge?: string;
  location: string;
  lat: number;
  lng: number;
}

