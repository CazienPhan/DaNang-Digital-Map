import React from 'react';

interface ProductDetailProcessProps {
  url: string | null;
  productName: string;
}

/**
 * ProductDetailProcess — Section 6.
 *
 * Full-width process/production image.
 * Sourced from product_media where media_category = 'quy_trinh'.
 * Renders nothing when url is null.
 */
export const ProductDetailProcess: React.FC<ProductDetailProcessProps> = ({
  url,
  productName,
}) => {
  if (!url) return null;

  return (
    <div className="px-4 py-4">
      <h2 className="text-sm font-bold uppercase tracking-normal text-muted-foreground mb-3">
        Quy trình sản xuất
      </h2>
      <div className="w-full rounded-xl overflow-hidden border border-border">
        <img
          src={url}
          alt={`${productName} — quy trình sản xuất`}
          className="w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default ProductDetailProcess;
