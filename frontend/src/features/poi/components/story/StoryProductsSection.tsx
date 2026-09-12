import React from 'react';
import { type ProductItem } from '@/services/supabase/product.service';
import { type StoryProductItem } from '@/services/supabase/poiStory.service';
import { StorySection } from './StorySection';
import { StoryProductCard } from './StoryProductCard';

interface StoryProductsSectionProps {
  /** Products of this POI with products.is_highlighted = true. */
  products: StoryProductItem[];
  /** Opens the existing Product Detail flow for the clicked product. */
  onSelectProduct?: (item: ProductItem) => void;
}

/**
 * Section 03 — Sản phẩm nổi bật.
 *
 * A column of identically proportioned product cards. "Tìm hiểu thêm" hands the
 * real product to the application's existing product-detail flow — no separate
 * product-detail architecture is introduced here.
 */
export const StoryProductsSection: React.FC<StoryProductsSectionProps> = React.memo(
  ({ products, onSelectProduct }) => {
    const handleLearnMore = (item: StoryProductItem) => {
      if (onSelectProduct) {
        onSelectProduct(item);
      } else {
        // Same convention as ProductCard: this is a UI entry-point only.
        console.warn(
          `[StoryProductsSection] Product detail handler not wired. ` +
            `Would open product "${item.name}" (id: ${item.id}).`
        );
      }
    };

    return (
      <StorySection title="Sản phẩm nổi bật">
        <div className="flex flex-col gap-3">
          {products.map((item) => (
            <StoryProductCard key={item.id} item={item} onLearnMore={handleLearnMore} />
          ))}
        </div>
      </StorySection>
    );
  }
);
