import { useState } from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { LoadingState, ErrorState } from '../states';
import { PoiHeader, PoiTitleSection, PoiActions } from './common';
import { PoiOverviewSection } from './overview';
import { PoiProductSection } from './product';
import { cn } from '@/lib/utils';

interface PoiDetailCardProps {
  poi: POIDetailData | null;
  loading?: boolean;
  error?: string | null;
  onGetDirections?: () => void;
  onClose?: () => void;
  onBack?: () => void;
  isSecondary?: boolean;
}

export const PoiDetailCard: React.FC<PoiDetailCardProps> = ({
  poi,
  loading = false,
  error = null,
  onGetDirections,
  onClose,
  onBack,
  isSecondary = false,
}) => {
  // Local tab state — only affects UI, no business logic
  const [activeTab, setActiveTab] = useState<'overview' | 'menu'>('overview');

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
   * isTourismPoi: true  → portrait (9:16) video cards  — POI exists in poi_details_tourism
   * isTourismPoi: false → landscape (16:9) video cards — POI exists in poi_details_business
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
          <PoiActions onGetDirections={onGetDirections} />
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

        {/* Tabs row */}
        <div className="flex gap-1 px-4 pb-3">
          {(['overview', 'menu'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'px-4 py-1.5 rounded-full text-xs tracking-normal font-normal transition-colors',
                activeTab === tab
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {tab === 'overview' ? 'Tổng quan' : 'Sản phẩm'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="poi-scroll-content flex-1 overflow-y-auto">
        {activeTab === 'overview' ? (
          <PoiOverviewSection poi={poi} images={images} videos={videos} isTourismPoi={isTourismPoi} />
        ) : (
          <PoiProductSection poiId={poi.id} />
        )}
      </div>

      {/* Fixed footer */}
      <div className="shrink-0">
        <PoiActions onGetDirections={onGetDirections} />
      </div>
    </div>
  );
};

export default PoiDetailCard;
