import React from 'react';

interface ProductCultureSectionProps {
  productName: string;
  imageUrl: string | null;
  body: string | null;
}

/**
 * ProductCultureSection — content of pill 3 (Văn hóa & truyền thống):
 * optional image followed by body paragraph. No separate title field.
 */
export const ProductCultureSection: React.FC<ProductCultureSectionProps> = ({
  productName,
  imageUrl,
  body,
}) => {
  return (
    <div className="space-y-3">
      {body && (
        <p className="text-justify text-xs leading-relaxed whitespace-pre-line text-foreground">
          {body}
        </p>
      )}
      {imageUrl && (
        <div className="w-full overflow-hidden">
          <img
            src={imageUrl}
            alt={productName}
            className="w-full h-48 object-cover"
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

export default ProductCultureSection;
