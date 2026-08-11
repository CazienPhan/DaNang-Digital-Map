import React, { useState } from 'react';
import type { 
  CategoryType, 
  LocationItem, 
  MainTab, 
  OCOPProduct, 
  RecentExploreShortcut,
} from '../types';
import { CATEGORY_FILTERS } from '../data/danangData';
import { WonderLogo } from './WonderLogo';
import { 
  Search, 
  MapPin, 
  ShoppingBag, 
  CheckCircle2, 
  Star, 
  Camera, 
  Store, 
  Calendar, 
  Utensils, 
  ChevronRight, 
  Heart,
  Navigation,
  X,
  Info,
  Eye,
  ChevronLeft,
  SlidersHorizontal
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggleDrawer: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  mainTab: MainTab;
  setMainTab: (tab: MainTab) => void;
  selectedCategory: CategoryType;
  setSelectedCategory: (cat: CategoryType) => void;
  locations: LocationItem[];
  products: OCOPProduct[];
  selectedLocationId: string | null;
  onSelectLocation: (loc: LocationItem) => void;
  onOpenDetail: (loc: LocationItem) => void;
  onOpenDirections: (loc: LocationItem) => void;
  onOpenProductDetail?: (prod: OCOPProduct) => void;
  recentShortcuts: RecentExploreShortcut[];
  favorites: string[];
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onOpenAbout?: () => void;
  onOpenFavorites?: () => void;
  onOpenFilterModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  searchQuery,
  setSearchQuery,
  mainTab,
  setMainTab,
  selectedCategory,
  setSelectedCategory,
  locations,
  products,
  selectedLocationId,
  onSelectLocation,
  onOpenDetail,
  onOpenDirections,
  onOpenProductDetail,
  recentShortcuts,
  favorites,
  onToggleFavorite,
  onOpenAbout,
  onOpenFavorites,
  onOpenFilterModal,
}) => {
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'camera': return <Camera className="w-3.5 h-3.5" />;
      case 'shop': return <Store className="w-3.5 h-3.5" />;
      case 'bag': return <ShoppingBag className="w-3.5 h-3.5" />;
      case 'calendar': return <Calendar className="w-3.5 h-3.5" />;
      case 'utensils': return <Utensils className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

  const productFilterChips = [
    { id: 'all', label: 'Tất cả' },
    { id: 'herbs', label: 'Thảo dược' },
    { id: 'food', label: 'Thực phẩm' },
    { id: 'beverage', label: 'Đồ uống' },
    { id: 'gift', label: 'Quà tặng' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Left Drawer */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-40 w-full sm:w-[410px] md:w-[430px] bg-white shadow-2xl border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Toggle Pull Tab Button attached to drawer right edge - only when open */}
        {isOpen && (
          <button
            onClick={onClose}
            className="absolute -right-10 top-20 z-50 p-2.5 bg-white border border-l-0 border-slate-200 rounded-r-2xl shadow-lg text-slate-700 hover:text-[#F47A1F] hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center"
            title="Thu gọn danh sách kết quả"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
        )}

        {/* 1. Drawer Top Branding & Actions Bar */}
        <div className="px-4 py-3 bg-[#FFF9F3] border-b border-orange-100 flex items-center justify-between shrink-0">
          <WonderLogo size="sm" variant="full" />

          <div className="flex items-center gap-1.5">
            {onOpenFavorites && (
              <button
                onClick={onOpenFavorites}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-red-300 text-slate-700 hover:text-red-500 transition-colors cursor-pointer relative"
                title="Sản phẩm & địa điểm đã lưu"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500/20" />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
                    {favorites.length}
                  </span>
                )}
              </button>
            )}

            {onOpenFilterModal && (
              <button
                onClick={onOpenFilterModal}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-[#F47A1F] transition-colors cursor-pointer"
                title="Mở bộ lọc nâng cao"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#F47A1F]" />
              </button>
            )}

            {onOpenAbout && (
              <button
                onClick={onOpenAbout}
                className="p-2 rounded-xl bg-white border border-slate-200 hover:border-orange-300 text-slate-700 hover:text-[#F47A1F] transition-colors cursor-pointer"
                title="Giới thiệu bản đồ"
              >
                <Info className="w-4 h-4 text-slate-600" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer ml-1"
              title="Thu gọn"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Filter Status & Tab Section */}
        <div className="p-4 space-y-3 bg-white border-b border-slate-100 shrink-0">
          {/* Active Search Badge or Filter Info */}
          {searchQuery ? (
            <div className="flex items-center justify-between px-3 py-2 bg-orange-50/80 border border-orange-200/80 rounded-2xl">
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-4 h-4 text-[#F47A1F] shrink-0" />
                <span className="text-xs font-semibold text-slate-700 truncate">
                  Từ khóa: <strong className="text-slate-900 font-bold">"{searchQuery}"</strong>
                </span>
              </div>
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-orange-100 transition-colors cursor-pointer shrink-0"
                title="Xóa tìm kiếm"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#667085]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Lọc nhanh danh sách..."
                className="w-full pl-10 pr-9 py-2 rounded-2xl bg-[#F8FAFC] border border-slate-200 text-xs font-medium text-[#1F2937] placeholder:text-slate-400 focus:outline-none focus:border-[#F47A1F] transition-all"
              />
            </div>
          )}

          {/* Main Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-[#F3F4F6] p-1.5 rounded-2xl">
            <button
              onClick={() => setMainTab('products')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mainTab === 'products'
                  ? 'bg-[#F47A1F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Sản phẩm OCOP</span>
            </button>

            <button
              onClick={() => setMainTab('locations')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mainTab === 'locations'
                  ? 'bg-[#F47A1F] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Địa điểm</span>
            </button>
          </div>

          {/* Category Filters */}
          {mainTab === 'locations' ? (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {CATEGORY_FILTERS.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id as CategoryType)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#14213D] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {getCategoryIcon(cat.iconName)}
                    <span>{cat.labelVi}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {productFilterChips.map((chip) => {
                const isSelected = productCategoryFilter === chip.id;
                return (
                  <button
                    key={chip.id}
                    onClick={() => setProductCategoryFilter(chip.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                      isSelected
                        ? 'bg-[#F47A1F] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{chip.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* 4. Result Title & Counter */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div>
              <h2 className="text-sm font-bold text-[#1F2937]">
            {searchQuery
              ? `Kết quả cho "${searchQuery}"`
              : mainTab === 'locations'
              ? 'Tất cả địa điểm Đà Nẵng'
              : 'Sản phẩm OCOP Đặc Sản'}
          </h2>
          <p className="text-xs text-[#667085] font-medium">
            {mainTab === 'locations'
              ? `${locations.length} địa điểm phù hợp`
              : `${products.length} sản phẩm OCOP`}
          </p>
        </div>
      </div>

      {/* 5. Scrollable List of Result Cards */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 custom-scrollbar">
        {mainTab === 'locations' ? (
          locations.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Không tìm thấy địa điểm phù hợp.
            </div>
          ) : (
            locations.map((loc) => {
              const isSelected = selectedLocationId === loc.id;
              const isFav = favorites.includes(loc.id);

              return (
                <div
                  key={loc.id}
                  onClick={() => onSelectLocation(loc)}
                  className={`group relative rounded-2xl p-3 border transition-all cursor-pointer bg-white ${
                    isSelected
                      ? 'border-[#F47A1F] ring-2 ring-[#F47A1F]/20 shadow-md'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex gap-3">
                    {/* Thumbnail Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                      <img
                        src={loc.image}
                        alt={loc.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => onToggleFavorite(loc.id, e)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/40 backdrop-blur-xs text-white hover:bg-black/60 transition-colors"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            isFav ? 'text-red-500 fill-red-500' : 'text-white'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="font-extrabold text-sm text-[#1F2937] truncate group-hover:text-[#F47A1F] transition-colors">
                          {loc.name}
                        </h3>

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <span className={`inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            loc.category === 'ocop_outlet' 
                              ? 'bg-red-50 text-[#EF4444]' 
                              : loc.category === 'ocop_facility' 
                              ? 'bg-emerald-50 text-[#10B981]' 
                              : 'bg-blue-50 text-[#0066FF]'
                          }`}>
                            {loc.categoryLabel}
                          </span>

                          {loc.isVerified && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-[#10B981]">
                              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                              Đã xác thực
                            </span>
                          )}
                        </div>

                        {/* Distance, Status & Rating */}
                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mt-1.5">
                          <span>📍 {loc.distanceStr}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-bold">{loc.status}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            {loc.rating} ({loc.reviewCount})
                          </span>
                        </div>

                        {/* Address */}
                        <p className="text-[11px] text-[#667085] truncate mt-1">
                          {loc.address}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-2 pt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetail(loc);
                          }}
                          className="w-full py-1.5 px-2 rounded-xl text-[11px] font-bold border border-[#F47A1F] text-[#F47A1F] hover:bg-[#F47A1F]/10 transition-colors text-center cursor-pointer"
                        >
                          Xem chi tiết
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDirections(loc);
                          }}
                          className={`w-full py-1.5 px-2 rounded-xl text-[11px] font-bold text-white transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                            loc.category === 'ocop_outlet'
                              ? 'bg-[#F47A1F] hover:bg-[#D9630F]'
                              : 'bg-[#0066FF] hover:bg-[#0052CC]'
                          }`}
                        >
                          <span>Chỉ đường</span>
                          <Navigation className="w-3 h-3 fill-current" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* OCOP Products Tab Items (Figma-Matched Layout) */
          products.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-xs">
              Không tìm thấy sản phẩm OCOP phù hợp.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Featured / Search Highlight Hero Card (Matches Figma Screenshot 1) */}
              {(() => {
                const heroProd = products[0]; // Primary highlighted product
                if (!heroProd) return null;

                return (
                  <div className="space-y-3">
                    <div className="group relative rounded-2xl p-3.5 border-2 border-orange-200 bg-gradient-to-br from-amber-50/60 via-white to-orange-50/30 shadow-xs hover:border-[#F47A1F] transition-all">
                      <div className="flex gap-3">
                        {/* Thumbnail */}
                        <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 shadow-2xs">
                          <img
                            src={heroProd.image}
                            alt={heroProd.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute top-1 left-1 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                            ★ {heroProd.starRating} sao
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-orange-100 text-[#F47A1F]">
                                OCOP Tiêu biểu
                              </span>
                              {heroProd.isVerified && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Đã xác thực
                                </span>
                              )}
                            </div>

                            <h3 
                              onClick={() => onOpenProductDetail?.(heroProd)}
                              className="font-black text-sm text-slate-900 truncate mt-1 hover:text-[#F47A1F] transition-colors cursor-pointer"
                            >
                              {heroProd.name}
                            </h3>

                            <p className="text-xs font-black text-[#F47A1F] mt-0.5">
                              {heroProd.priceStr}
                            </p>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-1">
                              <span className="flex items-center gap-1 text-slate-700 font-bold">
                                <MapPin className="w-3 h-3 text-[#F47A1F]" />
                                {heroProd.pointCountStr || '5 điểm bán'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-slate-500">
                                <Eye className="w-3 h-3" />
                                {heroProd.viewCountStr || '100+ xem'}
                              </span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="grid grid-cols-2 gap-2 mt-2 pt-1 border-t border-orange-100">
                            <button
                              onClick={() => onOpenProductDetail?.(heroProd)}
                              className="w-full py-1.5 px-2 rounded-xl text-[11px] font-extrabold border border-[#F47A1F] text-[#F47A1F] hover:bg-orange-50 transition-colors text-center cursor-pointer flex items-center justify-center gap-1"
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Xem chi tiết</span>
                            </button>
                            <button
                              onClick={() => {
                                const targetLoc = locations.find((l) => l.id === heroProd.locationId);
                                if (targetLoc) {
                                  onSelectLocation(targetLoc);
                                } else {
                                  onOpenProductDetail?.(heroProd);
                                }
                              }}
                              className="w-full py-1.5 px-2 rounded-xl text-[11px] font-extrabold bg-[#F47A1F] hover:bg-[#D9630F] text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Navigation className="w-3 h-3 fill-current" />
                              <span>Tìm điểm bán</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Nearby Selling Stores List (Matches Figma Screenshot 1) */}
                    <div className="bg-slate-50/80 rounded-2xl p-3 border border-slate-200/80 space-y-2">
                      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1.5">
                        <span className="text-xs font-black text-slate-900 uppercase flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#F47A1F]" />
                          Điểm bán gần bạn
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {heroProd.sellingLocations?.length || 5} điểm bán
                        </span>
                      </div>

                      <div className="space-y-2">
                        {(heroProd.sellingLocations || [
                          {
                            id: 'loc-store-a',
                            name: 'Cửa hàng OCOP A - Nguyễn Văn Linh',
                            distanceStr: '0,6 km',
                            address: '123 Nguyễn Văn Linh, Hải Châu, Đà Nẵng',
                            district: 'Hải Châu',
                            rating: 4.8,
                            reviewCount: 56,
                            stockStatus: 'Còn hàng',
                            lat: 16.0601,
                            lng: 108.2152,
                          },
                          {
                            id: 'loc-store-b',
                            name: 'Đặc sản Đà Nẵng B - Lê Duẩn',
                            distanceStr: '1,2 km',
                            address: '78 Lê Duẩn, Hải Châu, Đà Nẵng',
                            district: 'Hải Châu',
                            rating: 4.6,
                            reviewCount: 32,
                            stockStatus: 'Sắp hết hàng',
                            lat: 16.0699,
                            lng: 108.2120,
                          },
                          {
                            id: 'loc-1',
                            name: 'Chợ Hàn - Gian OCOP 12',
                            distanceStr: '0,2 km',
                            address: '119 Trần Phú, Hải Châu, Đà Nẵng',
                            district: 'Hải Châu',
                            rating: 4.7,
                            reviewCount: 128,
                            stockStatus: 'Còn hàng',
                            lat: 16.0682,
                            lng: 108.2241,
                          },
                        ]).slice(0, 3).map((store) => (
                          <div
                            key={store.id}
                            onClick={() => {
                              const target = locations.find(l => l.id === store.id || l.id === 'loc-1');
                              if (target) onSelectLocation(target);
                            }}
                            className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-[#F47A1F] transition-all cursor-pointer group space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#F47A1F] truncate">
                                {store.name}
                              </h4>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                store.stockStatus === 'Còn hàng' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {store.stockStatus}
                              </span>
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                              <span className="flex items-center gap-1 font-bold text-slate-700">
                                📍 {store.distanceStr}
                              </span>
                              <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                                ★ {store.rating} ({store.reviewCount})
                              </span>
                            </div>

                            <p className="text-[10px] text-slate-400 truncate">
                              {store.address}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Explore Other OCOP Products */}
                    {products.length > 1 && (
                      <div className="space-y-2 pt-2">
                        <h4 className="text-xs font-bold text-slate-900 uppercase">Khám phá sản phẩm OCOP khác</h4>
                        <div className="space-y-2">
                          {products.slice(1).map((prod) => (
                            <div
                              key={prod.id}
                              onClick={() => onOpenProductDetail?.(prod)}
                              className="group rounded-2xl p-2.5 border border-slate-200 bg-white hover:border-[#F47A1F] transition-all cursor-pointer flex gap-3 items-center"
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                                <img
                                  src={prod.image}
                                  alt={prod.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                                    ★ OCOP {prod.starRating} sao
                                  </span>
                                </div>
                                <h4 className="font-bold text-xs text-slate-900 truncate group-hover:text-[#F47A1F] transition-colors mt-0.5">
                                  {prod.name}
                                </h4>
                                <p className="text-xs font-black text-[#F47A1F]">
                                  {prod.priceStr}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )
        )}
      </div>

      {/* 6. Bottom Section: Khám phá gần đây (Recently Explored Shortcuts) */}
      <div className="border-t border-slate-100 pt-3">
        <h4 className="text-xs font-bold text-[#1F2937] mb-2">Khám phá gần đây</h4>
        <div className="space-y-1.5">
          {recentShortcuts.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const target = locations.find((l) => l.id === item.locationId);
                if (target) onSelectLocation(target);
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors text-left cursor-pointer group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={`p-1.5 rounded-lg shrink-0 ${
                  item.iconType === 'camera' 
                    ? 'bg-blue-100 text-[#0066FF]' 
                    : item.iconType === 'shop' 
                    ? 'bg-emerald-100 text-[#10B981]' 
                    : 'bg-red-100 text-[#EF4444]'
                }`}>
                  {item.iconType === 'camera' && <Camera className="w-3.5 h-3.5" />}
                  {item.iconType === 'shop' && <Store className="w-3.5 h-3.5" />}
                  {item.iconType === 'bag' && <ShoppingBag className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs font-bold text-[#1F2937] truncate group-hover:text-[#F47A1F] transition-colors">
                  {item.title}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-xs font-semibold text-slate-500">
                <span>{item.distanceStr}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  </aside>
</>
);
};
