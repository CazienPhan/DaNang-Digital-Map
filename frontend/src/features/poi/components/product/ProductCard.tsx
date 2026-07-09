import React from 'react';
import { type ProductItem } from '@/services/supabase/product.service';

interface ProductCardProps {
  item: ProductItem;
}

/**
 * ProductCard renders a single product.
 * Pure presentational — no API calls, no data fetching.
 * Receives a fully mapped ProductItem from ProductGrid.
 */
export const ProductCard: React.FC<ProductCardProps> = React.memo(({ item }) => {
  return (
    <div className="group relative flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-md hover:border-border transition-all duration-200 cursor-default">
      {/* Product image */}
      <div className="relative aspect-square bg-muted overflow-hidden">
        {item.img ? (
          <img
            src={item.img}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              // Image failed to load — hide it and show the emoji fallback
              const target = e.currentTarget as HTMLImageElement;
              target.style.display = 'none';
              const fallback = target.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Placeholder: shown when hinh_anh_url is null OR image fails to load */}
        <div
          className="w-full h-full flex items-center justify-center text-muted-foreground/25 absolute inset-0"
          style={{ display: item.img ? 'none' : 'flex' }}
        >
          <span className="text-4xl">📦</span>
        </div>

        {/* OCOP badge — only when badge === 'OCOP' */}
        {item.badge === 'OCOP' && (
          <span className="absolute top-2 left-2 text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm leading-none">
            OCOP
          </span>
        )}
      </div>

      {/* Product info */}
      <div className="flex flex-col gap-1.5 p-3">
        {/* Name */}
        <p className="text-xs font-semibold text-foreground leading-snug line-clamp-2">
          {item.name}
        </p>

        {/* Category tags: danh_muc + product_type */}
        {item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((tag, i) => (
              <span
                key={i}
                className="text-[10px] leading-snug text-muted-foreground bg-muted px-0 py-0.5 rounded-full leading-none"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Price — hidden when null (price unknown / not set) */}
        {item.price != null && (
          <p className="text-xs font-bold text-foreground mt-auto">
            {item.price.toLocaleString('vi-VN')}
          </p>
        )}
      </div>
    </div>
  );
});
