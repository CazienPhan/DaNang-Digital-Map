import React from 'react';

interface ProductDetailOverviewProps {
  name: string;
  overview: string | null;
}

/**
 * ProductDetailOverview — Section 2.
 *
 * Displays the product name as the visual focus (h1) and the overview
 * inside a bordered description box.
 */
export const ProductDetailOverview: React.FC<ProductDetailOverviewProps> = ({
  name,
  overview,
}) => {
  return (
    <div className="px-6 py-10 space-y-3">
      <h1 className="text-xl text-center font-extrabold uppercase text-foreground leading-tight">{name}</h1>

      {overview && (
        <div className="border border-border rounded-lg p-3 bg-muted/30">
          <p className="text-xs text-justify text-foreground/80 leading-relaxed whitespace-pre-line">
            {overview}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductDetailOverview;
