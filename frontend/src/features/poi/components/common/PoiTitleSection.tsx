import React from 'react';
// import { ShieldCheck, Star } from 'lucide-react';
import { Star } from 'lucide-react';
interface PoiTitleSectionProps {
  name?: string;
  rating: number | null;
  reviewCount: number | null;
  tagColor: string;
  categoryName?: string;
  /**
   * This POI's own logo — poi_media.url of its 'logo_story' row, resolved by
   * the caller. null/undefined when the POI has no logo, and then no logo
   * area is rendered at all and the name uses the full width.
   */
  logoUrl?: string | null;
}

export const PoiTitleSection: React.FC<PoiTitleSectionProps> = React.memo(({ name, rating, reviewCount, tagColor: _tagColor, categoryName, logoUrl }) => {
  const finalRating = rating !== null && rating !== undefined ? rating : 0;
  // const isOcop = categoryName === 'Sản phẩm OCOP';

  return (
    <div className="flex items-center gap-1 px-5 pb-3">
      {/* Logo — roughly a third of the header, only when this POI really has
          one. `contain` keeps the whole mark visible whatever its shape. */}
      {logoUrl && (
        <div className="flex w-[30%] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted aspect-square max-h-28">
          <img
            src={logoUrl}
            alt={name ? `Logo ${name}` : 'Logo'}
            loading="lazy"
            className="h-full w-full object-contain"
          />
        </div>
      )}

      {/* Name + meta — min-w-0 so long names wrap instead of pushing the logo */}
      <div className="min-w-0 flex-1">
      {/* Main title */}
      <h1 className="text-[18px] uppercase font-black tracking-normal leading-tight text-[#a05d00] mb-2">
        {name}
      </h1>

      {/* Category · Rating · Review count */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        {categoryName && (
          <span className="text-xs font-normal">
            {categoryName}
          </span>
        )}
        {categoryName && finalRating > 0 && (
          <span className="text-xs text-muted-foreground/40">-</span>
        )}
        {finalRating > 0 && (
          <>
            <span className="flex items-center gap-0.5 text-amber-400">
              {Array.from({ length: Math.floor(finalRating) }).map((_, index) => (
                <Star
                  key={index}
                  size={15}
                  fill="currentColor"
                  strokeWidth={0}
                />
              ))}
            </span>

            {reviewCount !== null && reviewCount !== undefined && (
              <span className="text-xs text-muted-foreground/60">
                ({reviewCount.toLocaleString()} đánh giá)
              </span>
            )}
          </>
        )}
      </div>

      {/* OCOP certification badge — only for OCOP category
      {isOcop && (
        <div className="flex items-center gap-1.5 mt-2 text-emerald-600">
          <ShieldCheck size={15} strokeWidth={2} />
          <span className="text-xs font-semibold">Chứng nhận sản phẩm OCOP</span>
        </div>
      )} */}
      </div>
    </div>
  );
});
