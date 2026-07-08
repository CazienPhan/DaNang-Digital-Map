import React, { useState } from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import LoadingState from "../states/LoadingState";
import ErrorState from "../states/ErrorState";
import { PoiHeader } from './sections/PoiHeader';
import { PoiTitleSection } from './sections/PoiTitleSection';
import { PoiInformation } from './sections/PoiInformation';

import { PoiDescription } from './sections/PoiDescription';
import { PoiMediaGallery } from './sections/PoiMediaGallery';
import { PoiVideoGallery } from './sections/PoiVideoGallery';
import { PoiActions } from './sections/PoiActions';
import { cn } from '@/lib/utils';

interface PoiDetailCardProps {
  poi: POIDetailData | null;
  loading?: boolean;
  error?: string | null;
  onGetDirections?: () => void;
  onClose?: () => void;
  isSecondary?: boolean;
}

export const PoiDetailCard: React.FC<PoiDetailCardProps> = ({
  poi,
  loading = false,
  error = null,
  onGetDirections,
  onClose,
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

  // Process and separate images and videos (Max 4 images, Max 2 videos)
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
        if (videos.length < 2) {
          videos.push({ url, caption: m.caption || undefined });
        }
      }
    });
  });

  const isTourism = poi.poi_type === 'TOURISM';
  const tagColor = poi.category_color_hex || '#3b82f6';

  // --- Secondary card: preserve existing floating card behavior ---
  if (isSecondary) {
    return (
      <div className="poi-detail-card secondary-card">
        <div className="shrink-0 flex flex-col">
          <PoiHeader tagColor={tagColor} categoryName={poi.category_name ?? undefined} poiType={poi.poi_type ?? undefined} onClose={onClose} />
          <PoiTitleSection name={poi.name ?? undefined} rating={poi.so_sao} reviewCount={poi.luot_danh_gia} tagColor={tagColor} categoryName={poi.category_name ?? undefined} />
        </div>
        <div className="poi-scroll-content flex-1 overflow-y-auto">
          <PoiInformation poi={poi} />

          <PoiMediaGallery images={images} />
          {isTourism && <PoiDescription description={poi.gioi_thieu ?? undefined} name={poi.name ?? undefined} />}
          <PoiVideoGallery videos={videos} />
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
              {tab === 'overview' ? 'Tổng quan' : 'Thực đơn'}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="poi-scroll-content flex-1 overflow-y-auto">
        {activeTab === 'overview' ? (
          <div className="flex flex-col gap-4">
            {/* 1. Photo Gallery */}
            <PoiMediaGallery images={images} />

            {/* 2. Description card (Tourism only) */}
            {isTourism && (
              <PoiDescription
                description={poi.gioi_thieu ?? undefined}
                name={poi.name ?? undefined}
              />
            )}

            {/* 3. Contact Information */}
            <PoiInformation poi={poi} />

            {/* 4. Opening Hours — now rendered as InfoRow inside PoiInformation */}

            {/* 5. Videos */}
            <PoiVideoGallery videos={videos} />

            {/* 6. News placeholder — reserved for future development */}
            {/* <NewsFeed /> — not yet implemented */}
          </div>
        ) : (
          /* Menu tab — empty state, no fake data */
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-2xl">🍽️</span>
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">Chưa có thực đơn</p>
            <p className="text-xs text-muted-foreground">Thông tin thực đơn sẽ được cập nhật trong thời gian tới.</p>
          </div>
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
