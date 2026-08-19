import { useState } from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { LoadingState, ErrorState } from '../states';
import { PoiHeader, PoiTitleSection, PoiActions } from './common';
import { PoiOverviewSection } from './overview';
import { PoiProductSection } from './product';
import { PoiEventSection, EventBanner } from './event';
import { type ProductItem } from '@/services/supabase/product.service';
import { type EventItem } from '@/services/supabase/event.service';
import { useEventsByPoi } from '../hooks/useEventsByPoi';
import { cn } from '@/lib/utils';

interface PoiDetailCardProps {
  poi: POIDetailData | null;
  loading?: boolean;
  error?: string | null;
  onGetDirections?: () => void;
  onClose?: () => void;
  onBack?: () => void;
  isSecondary?: boolean;
  /** Called when the user clicks a product in the "Sản phẩm" tab. */
  onSelectProduct?: (item: ProductItem) => void;
  /** Called when the user switches back to the "Tổng quan" tab. */
  onOverviewTabSelected?: () => void;
  /** Called when the user taps "Giỏ hàng" in the global action bar. */
  onOpenCart?: () => void;
  /** Called when the user taps "Đăng ký trải nghiệm". */
  onRegisterExperience?: () => void;
  /** Called when any product's "Thêm vào giỏ hàng" button is clicked. */
  onAddToCart?: (item: ProductItem) => void;
  /** Called when any product's "Mua ngay" button is clicked.
   *  Omit if no checkout flow exists — ProductCard degrades gracefully. */
  onBuyNow?: (item: ProductItem) => void;
  /** Total number of product units currently in the cart. Drives the cart badge. */
  cartItemCount?: number;
  /**
   * Which tab to open by default.
   * Pass 'menu' when returning from the Cart so the user lands on Products,
   * not on Overview. Defaults to 'overview'.
   */
  defaultTab?: 'overview' | 'menu';
  /** Called when the user clicks an event card or the overview banner. */
  onSelectEvent?: (item: EventItem) => void;
}

export const PoiDetailCard: React.FC<PoiDetailCardProps> = ({
  poi,
  loading = false,
  error = null,
  onGetDirections,
  onClose,
  onBack,
  isSecondary = false,
  onSelectProduct,
  onOverviewTabSelected,
  onOpenCart,
  onRegisterExperience,
  onAddToCart,
  onBuyNow,
  cartItemCount = 0,
  defaultTab = 'overview',
  onSelectEvent,
}) => {
  // Local tab state — only affects UI, no business logic
  const [activeTab, setActiveTab] = useState<'overview' | 'menu' | 'event'>(defaultTab);

  // Events linked to this POI — fetched once here, shared by the "Sự kiện"
  // tab and the "Tổng quan" tab's banner so both agree and no duplicate
  // network request happens. Only relevant for the primary (non-secondary)
  // card, but the hook itself is unconditional (no early return before it).
  const { today: todayEvents, upcoming: upcomingEvents, loading: eventsLoading, error: eventsError } =
    useEventsByPoi(poi?.id);

  // 1. Render Loading State
  if (loading) {
    return <LoadingState isSecondary={isSecondary} />;
  }

  // 2. Render Error State
  if (error || !poi) {
    return <ErrorState isSecondary={isSecondary} error={error} onClose={onClose} />;
  }

  // Helper to split whitespace/newline separated media URLs
  const getMediaUrls = (urlStr: any): string[] => {
    if (typeof urlStr !== 'string') return [];
    return urlStr.split(/[\s\n\r]+/).map(u => u.trim()).filter(Boolean);
  };

  // Process and separate images and videos (Max 4 images, no cap on videos)
  const rawMedia = Array.isArray(poi.media) ? poi.media : [];
  const images: { url: string; caption?: string }[] = [];
  const videos: { url: string; caption?: string }[] = [];

  rawMedia.forEach((m) => {
    const urls = getMediaUrls(m.url);
    urls.forEach((url) => {
      if (m.media_type === 'IMAGE' || url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/)) {
        if (images.length < 4) {
          images.push({ url, caption: m.caption || undefined });
        }
      } else if (m.media_type === 'VIDEO' || url.toLowerCase().match(/\.(mp4|webm|ogg|mov)/)) {
        // No cap on videos — gallery scrolls horizontally
        videos.push({ url, caption: m.caption || undefined });
      }
    });
  });

  // const isTourism = poi.poi_type === 'TOURISM';
  const tagColor = poi.category_color_hex || '#3b82f6';
  /**
   * isTourismPoi is passed down to PoiVideoGallery for API compatibility,
   * but since the video gallery was standardised to portrait (9:16) for
   * ALL POI types, its value no longer controls card orientation.
   * Both poi_details_business and poi_details_tourism render portrait videos.
   *
   * Detection: poi.poi_type === 'TOURISM' is the canonical, reliable indicator.
   * The pois.business_id column is NOT guaranteed to be populated for business POIs
   * (the backend joins poi_details_business via b.poi_id = p.id, not via p.business_id),
   * so business_id === null would incorrectly classify ALL POIs as tourism.
   */
  const isTourismPoi = poi.poi_type === 'TOURISM';

  // --- Secondary card: preserve existing floating card behavior ---
  if (isSecondary) {
    return (
      <div className="poi-detail-card secondary-card">
        <div className="shrink-0 flex flex-col">
          <PoiHeader tagColor={tagColor} categoryName={poi.category_name ?? undefined} poiType={poi.poi_type ?? undefined} onClose={onClose} onBack={onBack} />
          <PoiTitleSection name={poi.name ?? undefined} rating={poi.so_sao} reviewCount={poi.luot_danh_gia} tagColor={tagColor} categoryName={poi.category_name ?? undefined} />
        </div>
        <div className="poi-scroll-content flex-1 overflow-y-auto">
          <PoiOverviewSection poi={poi} images={images} videos={videos} isTourismPoi={isTourismPoi} />
        </div>
        <div className="shrink-0">
          <PoiActions
            onGetDirections={onGetDirections}
            poi={poi}
            onOpenCart={onOpenCart}
            onRegisterExperience={onRegisterExperience}
            cartItemCount={cartItemCount}
          />
        </div>
      </div>
    );
  }

  // --- Primary card: new Bolt prototype-inspired layout ---
  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-background text-foreground">
      {/* Fixed header */}
      <div className="shrink-0">
        <PoiHeader
          tagColor={tagColor}
          categoryName={poi.category_name ?? undefined}
          poiType={poi.poi_type ?? undefined}
          onClose={onClose}
          onBack={onBack}
        />
        <PoiTitleSection
          name={poi.name ?? undefined}
          rating={poi.so_sao}
          reviewCount={poi.luot_danh_gia}
          tagColor={tagColor}
          categoryName={poi.category_name ?? undefined}
        />

        {/* Event banner — only on the Overview tab, only when an event is running today */}
        {activeTab === 'overview' && todayEvents.length > 0 && (
          <EventBanner events={todayEvents} onClick={onSelectEvent} />
        )}

        {/* Tabs row */}
        <div className="flex gap-1 px-4 pb-3">
          {(['overview', 'menu', 'event'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'overview') onOverviewTabSelected?.();
              }}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs tracking-normal font-normal transition-colors',
                activeTab === tab
                  ? 'bg-[#fd9401] text-background'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab === 'overview' ? 'Tổng quan' : tab === 'menu' ? 'Sản phẩm' : 'Sự kiện'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="poi-scroll-content flex-1 overflow-y-auto">
        {activeTab === 'overview' ? (
          <PoiOverviewSection poi={poi} images={images} videos={videos} isTourismPoi={isTourismPoi} />
        ) : activeTab === 'menu' ? (
          <PoiProductSection
            poiId={poi.id}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        ) : (
          <PoiEventSection
            today={todayEvents}
            upcoming={upcomingEvents}
            loading={eventsLoading}
            error={eventsError}
            onSelectEvent={onSelectEvent}
          />
        )}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0">
        <PoiActions
          onGetDirections={onGetDirections}
          poi={poi}
          onOpenCart={onOpenCart}
          onRegisterExperience={onRegisterExperience}
          cartItemCount={cartItemCount}
        />
      </div>
    </div>
  );
};

export default PoiDetailCard;
