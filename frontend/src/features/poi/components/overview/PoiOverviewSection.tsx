import React from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { PoiMediaGallery } from './PoiMediaGallery';
import { PoiDescription } from './PoiDescription';
import { PoiInformation } from './PoiInformation';
import { PoiVideoGallery } from './PoiVideoGallery';

interface PoiOverviewSectionProps {
  poi: POIDetailData;
  images: { url: string; caption?: string }[];
  videos: { url: string; caption?: string }[];
  isTourismPoi: boolean;
}

/**
 * PoiOverviewSection assembles all blocks displayed in the Overview tab
 * of the primary PoiDetailCard. It is a pure presentational component:
 * it accepts pre-derived data and renders without any state or side effects.
 */
export const PoiOverviewSection: React.FC<PoiOverviewSectionProps> = React.memo(
  ({ poi, images, videos, isTourismPoi }) => {

    return (
      <div className="flex flex-col gap-4">
        {/* 1. Photo Gallery */}
        <PoiMediaGallery images={images} />

        {/* 2. Description card — rendered when gioi_thieu is available (Tourism and Business) */}
        {poi.gioi_thieu && (
          <PoiDescription
            description={poi.gioi_thieu ?? undefined}
            name={poi.name ?? undefined}
          />
        )}

        {/* 3. Contact Information — includes Opening Hours as final row */}
        <PoiInformation poi={poi} openingHours={poi.gio_mo_cua} />

        {/* 4. Videos */}
        <PoiVideoGallery videos={videos} isTourismPoi={isTourismPoi} />

        {/* 6. News placeholder — reserved for future development */}
        {/* <NewsFeed /> — not yet implemented */}
      </div>
    );
  }
);
