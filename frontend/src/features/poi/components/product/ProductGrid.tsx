import React from 'react';
import { type ProductItem } from '@/services/supabase/product.service';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: ProductItem[];
  onSelectProduct?: (item: ProductItem) => void;
}

/**
 * ProductGrid renders the 2-column grid of ProductCard items.
 * Pure presentational — receives a mapped ProductItem[] with no database logic.
 */
export const ProductGrid: React.FC<ProductGridProps> = React.memo(({ products, onSelectProduct }) => {
  return (
    <div className="grid grid-cols-2 gap-3 px-1 py-0">
      {products.map((item) => (
        <ProductCard key={item.id} item={item} onSelect={onSelectProduct} />
      ))}
    </div>
  );
});
