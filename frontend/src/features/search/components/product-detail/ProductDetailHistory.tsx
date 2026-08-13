import React from 'react';
import type { HistoryItem } from '@/services/supabase/productDetail.service';

interface ProductDetailHistoryProps {
  items: HistoryItem[];
}

/**
 * ProductDetailHistory — Section 4.
 *
 * Layout:
 *   - Dark-red header (#720000) with uppercase section title "LỊCH SỬ HÌNH THÀNH"
 *   - Cream content area (#fff8eb) with the history entries
 *
 * Each history entry: image | year | description
 * All data comes from product_types.lich_su_hinh_thanh:
 *   { thoi_gian, mo_ta, hinh_anh_url }
 */
export const ProductDetailHistory: React.FC<ProductDetailHistoryProps> = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="w-full">
      {/* Section header */}
      <div
        className="px-6 py-3"
        style={{ backgroundColor: '#720000' }}
      >
        <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: 'white' }}>
          Lịch sử hình thành
        </h2>
      </div>

      {/* Section content */}
      <div className="px-7 py-10 space-y-8" style={{ backgroundColor: '#fff8eb' }}>
        {items.map((item, index) => (
          <div key={index} className="flex items-stretch gap-4">

            {/* Left column — 90×90 square image */}
            <div className="shrink-0 self-center">
              <div className="w-[90px] h-[100px] rounded-xl overflow-hidden border-[1.25px] border-[black] bg-amber-100">
                {item.hinh_anh_url ? (
                  <img
                    src={item.hinh_anh_url}
                    alt={item.thoi_gian}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-amber-100">
                    <span className="text-sm text-amber-700 text-center leading-tight px-1">
                      {item.thoi_gian}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right column — year + description */}
            <div className="flex-1 flex flex-col text-justify">
              <p className="text-sm uppercase font-bold leading-tight mb-1.5" style={{ color: '#720000' }}>
                {item.thoi_gian}
              </p>
              <p className="text-xs text-justify font-extralight leading-relaxed" style={{ color: 'black' }}>
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
