import React from 'react';

interface ProductDetailBannerProps {
  url: string | null;
  productName: string;
}

/**
 * ProductDetailBanner — Section 1.
 *
 * Full-width banner image with natural aspect ratio.
 * No hardcoded height — aspect ratio is preserved by the image itself.
 * Renders nothing when url is null.
 */
export const ProductDetailBanner: React.FC<ProductDetailBannerProps> = ({ url, productName }) => {
  if (!url) return null;

  return (
    <div className="px-6 w-full overflow-hidden">
      <img
        src={url}
        alt={`${productName} banner`}
        className="w-full object-cover rounded-xl"
        loading="lazy"
      />
    </div>
  );
};

export default ProductDetailBanner;
