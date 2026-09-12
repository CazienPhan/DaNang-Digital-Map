import React from 'react';

interface ProductDetailBannerProps {
  url: string | null;
  productName: string;
}

/**
 * ProductDetailBanner — full-width banner image.
 * Sourced from poi.poi_media where:
 *   media_category = 'banner' AND media_type = 'IMAGE'
 * Renders nothing when url is null.
 */
export const ProductDetailBanner: React.FC<ProductDetailBannerProps> = ({
  url,
  productName,
}) => {
  if (!url) return null;

  return (
    <div className="w-full overflow-hidden">
      <img
        src={url}
        alt={productName}
        className="w-full h-48 object-cover"
        loading="lazy"
      />
    </div>
  );
};

export default ProductDetailBanner;
