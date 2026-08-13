import React from 'react';

interface ProductDetailOverviewProps {
  name: string;
  overview: string | null;
}

/**
 * ProductDetailOverview — Section 2.
 *
 * Displays the product name (product_types.name) and overview
 * (product_types.overview) on a dark-red (#720000) background.
 *
 * Name  → color #ffc14c (amber)
 * Text  → color white
 */
export const ProductDetailOverview: React.FC<ProductDetailOverviewProps> = ({
  name,
  overview,
}) => {
  return (
    <section
      className="relative z-10 mt-12 mb-8 w-full px-6 py-8"
      style={{ backgroundColor: '#720000' }}
    >
      <h1
        className="text-center text-2xl font-extrabold uppercase leading-tight"
        style={{ color: '#ffc14c' }}
      >
        {name}
      </h1>

      {overview && (
        <p
          className=" mx-2 mt-4 text-justify text-xs leading-relaxed whitespace-pre-line"
          style={{ color: 'white' }}
        >
          {overview}
        </p>
      )}
    </section>
  );
};

export default ProductDetailOverview;