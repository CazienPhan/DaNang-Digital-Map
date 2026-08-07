import React from 'react';
import { ImageIcon } from 'lucide-react';
import type { HighlightItem } from '@/services/supabase/productDetail.service';

interface ProductDetailHighlightsProps {
  items: HighlightItem[];
}

/**
 * ProductDetailHighlights — Section 5.
 *
 * Renders diem_noi_bat JSON items as a two-column responsive card grid.
 * Each card contains: image/icon, title, description.
 * Never hardcodes highlight entries — all content is dynamic from Supabase.
 */
export const ProductDetailHighlights: React.FC<ProductDetailHighlightsProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="px-6 py-6">
      <h2 className="text-sm font-bold uppercase tracking-normal text-muted-foreground mb-3">
        Điểm nổi bật
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors"
          >
            {/* Image or fallback icon */}
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              {item.hinh_anh_url ? (
                <img
                  src={item.hinh_anh_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <ImageIcon className="h-6 w-6 text-muted-foreground/40" />
              )}
            </div>

            {/* Title */}
            <p className="text-xs text-justify font-semibold text-foreground leading-snug line-clamp-2">
              {item.title}
            </p>

            {/* Description */}
            {item.description && (
              <p className="text-xs text-justify text-gray-700 leading-relaxed line-clamp-3">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailHighlights;
