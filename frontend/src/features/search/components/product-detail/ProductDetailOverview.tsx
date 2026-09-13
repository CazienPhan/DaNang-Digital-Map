import React from 'react';

interface ProductDetailOverviewProps {
  name: string;
  overview: string | null;
  thumbnailUrl: string | null;
}

/**
 * ProductDetailOverview — thumbnail/logo (left) + product name (right, same
 * row, ~2 words/line), then the overview paragraph. White background.
 */
export const ProductDetailOverview: React.FC<ProductDetailOverviewProps> = ({
  name,
  overview,
  thumbnailUrl,
}) => {

  return (
    <section className="w-full bg-white pt-4 pb-6 ">
      <div className="flex items-center gap-3">
        {thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={name}
            className="h-25 w-25 shrink-0 object-contain"
            loading="lazy"
          />
        )}
      <h1 className="font-utm-dinh-tran min-w-0 flex-1 text-left text-[3.2rem] leading-[0.9] text-foreground">
        {name}
      </h1>
      </div>

      {overview && (
        <p className="mt-3 text-justify text-xs leading-relaxed whitespace-pre-line text-muted-foreground">
          {overview}
        </p>
      )}
    </section>
  );
};

export default ProductDetailOverview;
