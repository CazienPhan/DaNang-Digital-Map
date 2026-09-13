import React from 'react';
import { ProductImageGallery } from './ProductImageGallery';

interface ProductHistorySectionProps {
  productName: string;
  galleryImageUrls: string[];
  title: string | null;
  body: string | null;
}

/**
 * ProductHistorySection — content of pill 1 (Câu chuyện lịch sử):
 * gallery carousel, bold subtitle, then body paragraph.
 */
export const ProductHistorySection: React.FC<ProductHistorySectionProps> = ({
  productName,
  galleryImageUrls,
  title,
  body,
}) => {
  return (
    <div className="space-y-3">
      <ProductImageGallery imageUrls={galleryImageUrls} productName={productName} />
      {title && <p className="mt-4 text-sm font-bold text-foreground uppercase">{title}</p>}
      {body && (
        <p className="text-justify text-xs leading-relaxed whitespace-pre-line text-foreground">
          {body}
        </p>
      )}
    </div>
  );
};

export default ProductHistorySection;
