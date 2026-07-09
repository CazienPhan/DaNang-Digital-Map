import React from 'react';
import { ShieldCheck, Star } from 'lucide-react';

interface PoiTitleSectionProps {
  name?: string;
  rating: number | null;
  reviewCount: number | null;
  tagColor: string;
  categoryName?: string;
}

export const PoiTitleSection: React.FC<PoiTitleSectionProps> = React.memo(({ name, rating, reviewCount, tagColor, categoryName }) => {
  const finalRating = rating !== null && rating !== undefined ? rating : 0;
  const isOcop = categoryName === 'Sản phẩm OCOP';

  return (
    <div className="px-4 pb-4">
      {/* Main title */}
      <h1 className="text-[24px] uppercase font-black tracking-normal leading-tight text-foreground mb-2">
        {name}
      </h1>

      {/* Category · Rating · Review count */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {categoryName && (
          <span className="text-xs font-normal" style={{ color: tagColor }}>
            {categoryName}
          </span>
        )}
        {categoryName && finalRating > 0 && (
          <span className="text-xs text-muted-foreground/40">-</span>
        )}
        {finalRating > 0 && (
          <>
            <span className="flex items-center gap-1 text-xs text-amber-400 font-semibold">
              <Star size={13} fill="currentColor" strokeWidth={0} />
              {finalRating.toFixed(1)}
            </span>
            {reviewCount !== null && reviewCount !== undefined && (
              <span className="text-xs text-muted-foreground/60">
                ({reviewCount.toLocaleString()} đánh giá)
              </span>
            )}
          </>
        )}
      </div>

      {/* OCOP certification badge — only for OCOP category */}
      {isOcop && (
        <div className="flex items-center gap-1.5 mt-2 text-emerald-600">
          <ShieldCheck size={15} strokeWidth={2} />
          <span className="text-xs font-semibold">Chứng nhận sản phẩm OCOP</span>
        </div>
      )}
    </div>
  );
});
