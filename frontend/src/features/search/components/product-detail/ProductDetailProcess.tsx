import React from 'react';

interface ProductDetailProcessProps {
  url: string | null;
  productName: string;
}

/**
 * ProductDetailProcess — Section 5.
 *
 * Layout:
 *   - Dark-red header (#720000) with uppercase section title "QUY TRÌNH"
 *   - Cream content area (#fff8eb) with the process image
 *
 * Image source: poi.poi_media where
 *   media_category = 'quy_trinh'
 *   AND product_type_id = <id>
 *
 * Renders nothing when url is null.
 */
export const ProductDetailProcess: React.FC<ProductDetailProcessProps> = ({
  url,
  productName,
}) => {
  if (!url) return null;

  return (
    <div className="w-full mt-12">
      {/* Section header */}
      <div
        className="px-6 py-3"
        style={{ backgroundColor: '#720000' }}
      >
        <h2 className="text-base font-bold uppercase tracking-wide" style={{ color: 'white' }}>
          Quy trình
        </h2>
      </div>

      {/* Section content */}
      <div className="px-3 pt-6 " style={{ backgroundColor: '#fff8eb' }}>
        <div className="w-full rounded-xl overflow-hidden ">
          <img
            src={url}
            alt={`${productName} — quy trình sản xuất`}
            className="w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductDetailProcess;
