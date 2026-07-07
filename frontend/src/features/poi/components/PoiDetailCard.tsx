import React from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import LoadingState from "../states/LoadingState";
import ErrorState from "../states/ErrorState";
import { PoiHeader } from './sections/PoiHeader';
import { PoiTitleSection } from './sections/PoiTitleSection';
import { PoiInformation } from './sections/PoiInformation';
import { PoiOpeningHours } from './sections/PoiOpeningHours';
import { PoiDescription } from './sections/PoiDescription';
import { PoiMediaGallery } from './sections/PoiMediaGallery';
import { PoiVideoGallery } from './sections/PoiVideoGallery';
import { PoiActions } from './sections/PoiActions';

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
  // 1. Render Loading State inside the unified glassmorphism wrapper
  if (loading) {
    return (
      <LoadingState
        isSecondary={isSecondary}
      />
    );
  }

  // 2. Render Error State with Cause, Solution, and Affected Component
  if (error || !poi) {
    return (
      <ErrorState
        isSecondary={isSecondary}
        error={error}
        onClose={onClose}
      />
    );
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

  return (
    <div className={isSecondary ? "poi-detail-card secondary-card" : "poi-detail-card primary-card"}>
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
      />

      {/* Scrollable body content (internal scrolling) */}
      <div className="poi-scroll-content">
        <PoiInformation poi={poi} />

        <PoiOpeningHours hours={poi.gio_mo_cua} />

        {isTourism && (
          <PoiDescription description={poi.gioi_thieu ?? undefined} />
        )}

        <PoiMediaGallery images={images} />

        <PoiVideoGallery videos={videos} />
      </div>

      <PoiActions onGetDirections={onGetDirections} />
    </div>
  );
};

export default PoiDetailCard;
