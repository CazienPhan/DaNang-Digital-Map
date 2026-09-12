import { useEffect, useRef, useState } from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { LoadingState, ErrorState } from '../states';
import { PoiHeader, PoiTitleSection, PoiActions } from './common';
import { PoiOverviewSection } from './overview';
import { PoiProductSection } from './product';
import { PoiEventSection, EventBanner } from './event';
import { PoiStorySection } from './story';
import { type ProductItem } from '@/services/supabase/product.service';
import { type EventItem } from '@/services/supabase/event.service';
import { useEventsByPoi } from '../hooks/useEventsByPoi';
import { usePoiStory } from '../hooks/usePoiStory';
import { cn } from '@/lib/utils';

/** Tabs of the primary POI detail card, in display order. */
type PoiDetailTab = 'overview' | 'menu' | 'story' | 'event';

const TAB_LABELS: Record<PoiDetailTab, string> = {
  overview: 'Tổng quan',
  menu: 'Sản phẩm',
  story: 'Câu chuyện',
  event: 'Sự kiện',
};

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
  const [activeTab, setActiveTab] = useState<PoiDetailTab>(defaultTab);

  // The tab row scrolls sideways, so a tab can sit partly outside the visible
  // strip. These let the selected tab be brought fully into view.
  const tabsRowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<PoiDetailTab, HTMLButtonElement | null>>>({});

  // Events linked to this POI — fetched once here, shared by the "Sự kiện"
  // tab and the "Tổng quan" tab's banner so both agree and no duplicate
  // network request happens. Only relevant for the primary (non-secondary)
  // card, but the hook itself is unconditional (no early return before it).
  const { today: todayEvents, upcoming: upcomingEvents, loading: eventsLoading, error: eventsError } =
    useEventsByPoi(poi?.id);

  // Business story — only fetched once the user actually opens the
  // "Câu chuyện" tab, then kept for as long as this card stays mounted so
  // switching tabs never repeats the request.
  const [storyRequested, setStoryRequested] = useState(false);
  const { story, loading: storyLoading, error: storyError } = usePoiStory(
    poi?.id,
    storyRequested && poi?.is_business === true
  );

  /**
   * Keep the selected tab fully visible in the horizontally scrolling tab row.
   *
   * Only the row's own horizontal offset is touched — never `scrollIntoView`,
   * which would also scroll ancestor containers and jolt the card vertically.
   * The distance comes from the tab's real geometry, so a wide tab scrolls
   * further than a narrow one, and a tab that already fits does not move at all.
   */
  useEffect(() => {
    const row = tabsRowRef.current;
    const tabEl = tabRefs.current[activeTab];
    // No element when this tab is not currently rendered (e.g. a stale 'story'
    // selection on a POI that has no story tab).
    if (!row || !tabEl) return;

    const rowRect = row.getBoundingClientRect();
    const tabRect = tabEl.getBoundingClientRect();
    // Matches the row's own px-4, so the tab never ends up flush to the edge.
    const gutter = 16;

    if (tabRect.left < rowRect.left + gutter) {
      row.scrollBy({ left: tabRect.left - rowRect.left - gutter, behavior: 'smooth' });
    } else if (tabRect.right > rowRect.right - gutter) {
      row.scrollBy({ left: tabRect.right - rowRect.right + gutter, behavior: 'smooth' });
    }
    // `is_business` decides whether the story tab exists, so the row's contents
    // (and therefore the tab positions) change with it.
  }, [activeTab, poi?.is_business]);

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

  /**
   * Header logo of THIS POI: the poi_media row carrying media_category
   * 'logo_story'. Picked the way the rest of the app picks media — the row
   * flagged is_primary first, otherwise the first one returned — and read
   * through the same URL helper as every other poi_media url. null when the
   * POI has no logo row, in which case the header simply shows no logo.
   */
  const logoMedia =
    rawMedia.filter((m) => m.media_category === 'logo_story' && m.media_type !== 'VIDEO');
  const logoUrl =
    getMediaUrls((logoMedia.find((m) => m.is_primary) ?? logoMedia[0])?.url)[0] ?? null;

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
          <PoiTitleSection name={poi.name ?? undefined} rating={poi.so_sao} reviewCount={poi.luot_danh_gia} tagColor={tagColor} categoryName={poi.category_name ?? undefined} logoUrl={logoUrl} />
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

  /**
   * The "Câu chuyện" tab belongs to business POIs only: it is shown exactly
   * when the POI has a poi.poi_details_business row (POIDetailData.is_business).
   * Tourism POIs and POIs that are not in our database never get the tab, and
   * a stale 'story' selection falls back to Tổng quan when the user moves to
   * such a POI.
   */
  const showStoryTab = poi.is_business === true;
  const tabs: PoiDetailTab[] = showStoryTab
    ? ['overview', 'menu', 'story', 'event']
    : ['overview', 'menu', 'event'];
  const effectiveTab: PoiDetailTab =
    activeTab === 'story' && !showStoryTab ? 'overview' : activeTab;

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
          logoUrl={logoUrl}
        />

        {/* Event banner — only on the Overview tab, only when an event is running today */}
        {effectiveTab === 'overview' && todayEvents.length > 0 && (
          <EventBanner events={todayEvents} onClick={onSelectEvent} />
        )}

        {/* Tabs row — one row, never wrapped or squeezed. The labels are wider
            than the sidebar, so the row scrolls sideways instead of clipping
            the last tab; the scrollbar itself is hidden, as in StoryGallery. */}
        <div
          ref={tabsRowRef}
          className="flex min-w-0 gap-1 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-3"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab}
              ref={(el) => {
                tabRefs.current[tab] = el;
              }}
              onClick={() => {
                setActiveTab(tab);
                if (tab === 'overview') onOverviewTabSelected?.();
                if (tab === 'story') setStoryRequested(true);
              }}
              className={cn(
                'shrink-0 whitespace-nowrap px-4 py-1.5 rounded-full text-xs tracking-normal font-normal transition-colors',
                effectiveTab === tab
                  ? 'bg-[#fd9401] text-background'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="poi-scroll-content flex-1 overflow-y-auto">
        {effectiveTab === 'overview' ? (
          <PoiOverviewSection poi={poi} images={images} videos={videos} isTourismPoi={isTourismPoi} />
        ) : effectiveTab === 'menu' ? (
          <PoiProductSection
            poiId={poi.id}
            onSelectProduct={onSelectProduct}
            onAddToCart={onAddToCart}
            onBuyNow={onBuyNow}
          />
        ) : effectiveTab === 'story' ? (
          <PoiStorySection
            poiName={poi.name}
            story={story}
            loading={storyLoading}
            error={storyError}
            onSelectProduct={onSelectProduct}
            onRegisterExperience={onRegisterExperience}
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
