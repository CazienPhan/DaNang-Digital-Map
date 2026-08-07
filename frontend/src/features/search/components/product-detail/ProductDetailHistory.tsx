import React from 'react';
import type { HistoryItem } from '@/services/supabase/productDetail.service';

interface ProductDetailHistoryProps {
  items: HistoryItem[];
}

/**
 * ProductDetailHistory — Section 4.
 *
 * Layout: square image | thin vertical divider | year + description
 *
 * Renders the lich_su_hinh_thanh JSON array from Supabase.
 * Each item: { thoi_gian: string, mo_ta: string, hinh_anh_url: string }
 * No content is hardcoded — all data is dynamic.
 */
export const ProductDetailHistory: React.FC<ProductDetailHistoryProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="px-6 py-10">
      <h2 className="text-sm font-bold uppercase tracking-normal text-foreground mb-4">
        Lịch sử hình thành
      </h2>

      <div className="space-y-5">
        {items.map((item, index) => (
          <div key={index} className="flex items-stretch gap-0">

            {/* Left column — 90×90 square image */}
            <div className="shrink-0">
              <div className="w-[90px] h-[90px] rounded-xl overflow-hidden border border-border bg-muted">
                {item.hinh_anh_url ? (
                  <img
                    src={item.hinh_anh_url}
                    alt={item.thoi_gian}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-[10px] text-muted-foreground text-center leading-tight px-1">
                      {item.thoi_gian}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Middle — thin vertical divider */}
            <div className="flex items-stretch justify-center w-5 shrink-0">
              {/* <div className="w-px bg-border self-stretch" aria-hidden="true" /> */}
            </div>

            {/* Right column — year + description */}
            <div className="flex-1 flex flex-col text-justify">
              <p className="text-xs text-justify font-bold text-foreground leading-tight mb-1.5">
                {item.thoi_gian}
              </p>
              <p className="text-xs text-justify text-foreground/75 leading-relaxed">
                {item.mo_ta}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductDetailHistory;
