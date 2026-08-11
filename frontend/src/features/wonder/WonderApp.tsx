import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { MapContainer } from './components/MapContainer';
import { LocationDetailModal } from './components/LocationDetailModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { DirectionsModal } from './components/DirectionsModal';
import { FavoritesDrawer } from './components/FavoritesDrawer';
import { AboutModal } from './components/AboutModal';
import { FilterModal } from './components/FilterModal';
import { AD_HOC_ID_PREFIX, buildAdHocLocation } from './utils/adHocLocation';

import type {
  CategoryType,
  LocationItem,
  MainTab,
  OCOPProduct,
  SellingPointItem,
} from './types';
import {
  LOCATIONS_DATA,
  OCOP_PRODUCTS_DATA,
  RECENT_EXPLORE_SHORTCUTS
} from './data/danangData';

/**
 * Giao diện WONDER.
 *
 * Bước 1 (hiện tại): chạy bằng dữ liệu mock trong ./data/danangData.ts,
 * bản đồ tạm dùng Leaflet đúng như thiết kế gốc.
 *
 * Các bước tiếp theo:
 *   - Bước 2: thay lớp bản đồ Leaflet bằng Map4D (features/map/components/MapContainer.tsx)
 *   - Bước 3: bỏ mock, nạp POI thật qua /api/pois/tile/:x/:y/:zoom
 */
export default function WonderApp() {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [mainTab, setMainTab] = useState<MainTab>('locations');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('all');
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false); // Closed on initial access for clean map
  
  // Handlers
  const handleSearchQueryChange = (q: string) => {
    setSearchQuery(q);
  };

  const handleSelectCategory = (cat: CategoryType) => {
    setSelectedCategory(cat);
  };
  
  // Modals & Drawers
  const [detailLocation, setDetailLocation] = useState<LocationItem | null>(null);
  const [productDetailModal, setProductDetailModal] = useState<OCOPProduct | null>(null);
  const [directionsLocation, setDirectionsLocation] = useState<LocationItem | null>(null);
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Filter Modal Options
  const [selectedDistrict, setSelectedDistrict] = useState('Tất cả');
  const [minRating, setMinRating] = useState(0);
  const [onlyVerified, setOnlyVerified] = useState(false);

  // User Favorites (Persistent list)
  const [favorites, setFavorites] = useState<string[]>(['loc-1', 'loc-2']);

  // Language State

  // Filter Locations based on search, category, district, rating, verified status
  const filteredLocations = useMemo(() => {
    return LOCATIONS_DATA.filter((loc) => {
      // Category Filter
      if (selectedCategory !== 'all' && loc.category !== selectedCategory) {
        return false;
      }
      // District Filter
      if (selectedDistrict !== 'Tất cả' && loc.district !== selectedDistrict) {
        return false;
      }
      // Minimum Rating Filter
      if (minRating > 0 && loc.rating < minRating) {
        return false;
      }
      // Verified Filter
      if (onlyVerified && !loc.isVerified) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = loc.name.toLowerCase().includes(query);
        const matchesCategory = loc.categoryLabel.toLowerCase().includes(query);
        const matchesAddress = loc.address.toLowerCase().includes(query);
        const matchesTags = loc.tags?.some((t) => t.toLowerCase().includes(query));
        return matchesName || matchesCategory || matchesAddress || matchesTags;
      }

      return true;
    });
  }, [selectedCategory, selectedDistrict, minRating, onlyVerified, searchQuery]);

  // Filter OCOP Products
  const filteredProducts = useMemo(() => {
    if (searchQuery.trim() === '') return OCOP_PRODUCTS_DATA;
    const query = searchQuery.toLowerCase().trim();
    return OCOP_PRODUCTS_DATA.filter((p) =>
      p.name.toLowerCase().includes(query) ||
      p.categoryLabel.toLowerCase().includes(query) ||
      p.producerName.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  /**
   * Địa điểm người dùng bấm trực tiếp trên bản đồ mà không nằm trong dữ liệu
   * của mình (chỗ trống, hoặc POI nền của Map4D). Ưu tiên hơn lựa chọn từ danh
   * sách, và bị xoá khi người dùng chọn một mục trong danh sách.
   */
  const [mapPointLocation, setMapPointLocation] = useState<LocationItem | null>(null);

  /** Các điểm bán của sản phẩm đang được soi trên bản đồ. */
  const [sellingPoints, setSellingPoints] = useState<{
    productName: string;
    points: SellingPointItem[];
  } | null>(null);

  /** Lộ trình Map4D đang hiển thị trên bản đồ (do DirectionsModal tính). */
  const [activeRoute, setActiveRoute] = useState<{
    path: { lat: number; lng: number }[];
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  } | null>(null);

  // Selected Location object
  const currentSelectedLocation = useMemo(() => {
    if (mapPointLocation) return mapPointLocation;
    return LOCATIONS_DATA.find((l) => l.id === selectedLocationId) || null;
  }, [selectedLocationId, mapPointLocation]);

  // Handlers
  const handleSelectLocation = (loc: LocationItem) => {
    setMapPointLocation(null);
    setSelectedLocationId(loc.id);
  };

  const handleToggleFavorite = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSelectedDistrict('Tất cả');
    setMinRating(0);
    setOnlyVerified(false);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-900 text-[#1F2937] font-sans antialiased selection:bg-[#F47A1F]/20 selection:text-[#F47A1F] relative">
      {/* 1. Full-screen Interactive Leaflet Map Layer */}
      <div className="w-full h-full absolute inset-0 z-0">
        <MapContainer
          locations={filteredLocations}
          products={filteredProducts}
          selectedLocation={currentSelectedLocation}
          onSelectLocation={handleSelectLocation}
          selectedCategory={selectedCategory}
          setSelectedCategory={handleSelectCategory}
          onOpenDetail={(loc) => setDetailLocation(loc)}
          onOpenDirections={(loc) => setDirectionsLocation(loc)}
          onOpenProductDetail={(prod) => setProductDetailModal(prod)}
          onOpenFilterModal={() => setIsFilterOpen(true)}
          onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
          isDrawerOpen={isDrawerOpen}
          searchQuery={searchQuery}
          setSearchQuery={handleSearchQueryChange}
          mainTab={mainTab}
          setMainTab={setMainTab}
          onOpenFavorites={() => setIsFavoritesOpen(true)}
          favoriteCount={favorites.length}
          onOpenAbout={() => setIsAboutOpen(true)}
          onMapPointClick={(loc) => {
            setSelectedLocationId(null);
            setMapPointLocation(loc);
          }}
          onCloseCallout={() => {
            setSelectedLocationId(null);
            setMapPointLocation(null);
          }}
          route={activeRoute}
          sellingPoints={sellingPoints}
          onClearSellingPoints={() => setSellingPoints(null)}
        />
      </div>

      {/* 2. Left Slide-out Drawer (Google Maps style) */}
      <Sidebar
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onToggleDrawer={() => setIsDrawerOpen((prev) => !prev)}
        searchQuery={searchQuery}
        setSearchQuery={handleSearchQueryChange}
        mainTab={mainTab}
        setMainTab={setMainTab}
        selectedCategory={selectedCategory}
        setSelectedCategory={handleSelectCategory}
        locations={filteredLocations}
        products={filteredProducts}
        selectedLocationId={selectedLocationId}
        onSelectLocation={handleSelectLocation}
        onOpenDetail={(loc) => setDetailLocation(loc)}
        onOpenDirections={(loc) => setDirectionsLocation(loc)}
        onOpenProductDetail={(prod) => setProductDetailModal(prod)}
        recentShortcuts={RECENT_EXPLORE_SHORTCUTS}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenFavorites={() => setIsFavoritesOpen(true)}
        onOpenFilterModal={() => setIsFilterOpen(true)}
      />

      {/* 3. Dialogs & Side Panels */}
      {/* Location Detail Modal */}
      <LocationDetailModal
        location={detailLocation}
        onClose={() => setDetailLocation(null)}
        onOpenDirections={(loc) => setDirectionsLocation(loc)}
        isFavorite={detailLocation ? favorites.includes(detailLocation.id) : false}
        onToggleFavorite={handleToggleFavorite}
        allLocations={LOCATIONS_DATA}
        onSelectLocation={(loc) => {
          setDetailLocation(loc);
          setSelectedLocationId(loc.id);
        }}
      />

      {/* OCOP Product Story & Detail Modal */}
      <ProductDetailModal
        product={productDetailModal}
        onClose={() => setProductDetailModal(null)}
        allProducts={OCOP_PRODUCTS_DATA}
        onSelectProduct={(prod) => setProductDetailModal(prod)}
        onFindSellingPoints={(product) => {
          // Hiện đúng các điểm bán của sản phẩm này, không phải toàn bộ
          // điểm bán OCOP. MapContainer sẽ vẽ marker và canh khung nhìn.
          const points = product.sellingLocations ?? [];
          setProductDetailModal(null);
          setMainTab('locations');
          setSelectedCategory('all');
          setSelectedLocationId(null);
          setMapPointLocation(null);
          setSellingPoints(points.length ? { productName: product.name, points } : null);
        }}
        onSelectStore={(store) => {
          // Trước đây nếu không tìm thấy cửa hàng thì rơi vào `l.id === 'loc-1'`,
          // tức là luôn chỉ đường về Chợ Hàn — sai điểm đến.
          setProductDetailModal(null);
          const matched = LOCATIONS_DATA.find((l) => l.id === store.id);
          setDirectionsLocation(
            matched ??
              buildAdHocLocation({
                id: `${AD_HOC_ID_PREFIX}store-${store.id}`,
                name: store.name,
                lat: store.lat,
                lng: store.lng,
                address: store.address,
                categoryLabel: 'Điểm bán OCOP',
                category: 'ocop_outlet',
              })
          );
        }}
      />

      {/* Directions Modal */}
      <DirectionsModal
        location={directionsLocation}
        onClose={() => setDirectionsLocation(null)}
        onRouteReady={setActiveRoute}
      />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        favorites={favorites}
        locations={LOCATIONS_DATA}
        onSelectLocation={handleSelectLocation}
        onRemoveFavorite={(id) => handleToggleFavorite(id)}
        onClearAll={() => setFavorites([])}
      />

      {/* About Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        minRating={minRating}
        setMinRating={setMinRating}
        onlyVerified={onlyVerified}
        setOnlyVerified={setOnlyVerified}
        onReset={handleResetFilters}
      />
    </div>
  );
}
