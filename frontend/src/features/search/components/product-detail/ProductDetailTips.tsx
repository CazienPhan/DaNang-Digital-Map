import React from 'react';

interface ProductDetailTipsProps {
  cong_dung: string[];
}

/**
 * ProductDetailCongDung — Section 6.
 *
 * Layout:
 *   - Dark-red header (#720000) with uppercase section title "CÔNG DỤNG"
 *   - Cream content area (#fff8eb) with the cong_dung list
 *
 * Content comes exclusively from product_types.cong_dung (string[]).
 * No tab or switcher — cong_dung only, no huong_dan_su_dung.
 */
export const ProductDetailTips: React.FC<ProductDetailTipsProps> = ({
  cong_dung,
}) => {
  if (!cong_dung || cong_dung.length === 0) return null;

  return (
    <div className="w-full mt-12 ">
      {/* Section header */}
      <div
        className="px-6 py-3"
        style={{ backgroundColor: '#720000' }}
      >
        <h2 className="text-base font-bold uppercase tracking-normal" style={{ color: 'white' }}>
          Công dụng
        </h2>
      </div>

      {/* Section content */}
      <div className="px-6 py-6" style={{ backgroundColor: '#fff8eb' }}>
        <ul className="list-disc list-outside pl-5 space-y-2">
          {cong_dung.map((item, index) => (
            <li
              key={index}
              className="text-xs leading-normal"
              style={{ color: 'black' }}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ProductDetailTips;
