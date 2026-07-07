import React from 'react';
import { renderStars } from "../../utils/rating";

interface PoiTitleSectionProps {
  name?: string;
  rating: number | null;
  reviewCount: number | null;
  tagColor: string;
}

export const PoiTitleSection: React.FC<PoiTitleSectionProps> = React.memo(({ name, rating, reviewCount, tagColor }) => {
  return (
    <div className="poi-title-rating-section">
      <h2 className="poi-name text-xl font-semibold tracking-tight leading-tight break-words" style={{ color: tagColor }}>
        {name?.toUpperCase()}
      </h2>
      {renderStars(rating, reviewCount)}
    </div>
  );
});
