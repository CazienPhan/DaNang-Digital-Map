import React from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { type ProductItem } from '@/services/supabase/product.service';

interface ProductCardProps {
  item: ProductItem;
  onSelect?: (item: ProductItem) => void;
  /** Called when the user clicks "Thêm vào giỏ hàng". */
  onAddToCart?: (item: ProductItem) => void;
  /** Called when the user clicks "Mua ngay". */
  onBuyNow?: (item: ProductItem) => void;
}

/**
 * ProductCard renders a single product.
 * Pure presentational — no API calls, no data fetching.
 * Receives a fully mapped ProductItem from ProductGrid.
 */
export const ProductCard: React.FC<ProductCardProps> = React.memo(
  ({ item, onSelect, onAddToCart, onBuyNow }) => {
    const handleAddToCart = (e: React.MouseEvent) => {
      // Stop event so the card's onClick (product detail) is not triggered.
      e.stopPropagation();
      if (onAddToCart) {
        onAddToCart(item);
      } else {
        // No cart architecture currently exists in this codebase.
        // This is a UI entry-point — wire onAddToCart to CartContext when available.
        console.warn(
          `[ProductCard] Cart not implemented. ` +
          `Would add product "${item.name}" (id: ${item.id}) to cart.`
        );
      }
    };

    const handleBuyNow = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onBuyNow) {
        onBuyNow(item);
      } else {
        // No purchase/checkout flow currently exists in this codebase.
        // This is a UI entry-point — wire onBuyNow to the checkout flow when available.
        console.warn(
          `[ProductCard] Checkout not implemented. ` +
          `Would initiate purchase for "${item.name}" (id: ${item.id}).`
        );
      }
    };

    return (
      <div
        onClick={onSelect ? () => onSelect(item) : undefined}
        className={`group relative flex flex-col bg-card border border-border/60 rounded-2xl overflow-hidden hover:shadow-md hover:border-border transition-all duration-200 ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
      >
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
            <span className="absolute top-2 left-2 inline-flex items-center justify-center gap-0.5 text-[0.6rem] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-sm leading-none">
              OCOP
              {item.ocopSoSao != null && (
                <span className="inline-flex items-center gap-0">
                  <span className="font-extrabold text-[#FFD058] leading-none">
                    {item.ocopSoSao}
                  </span>
                  <Star
                    size={12}
                    fill="#FFD058"
                    stroke="none"
                    className="shrink-0"
                    aria-hidden="true"
                  />
                </span>
              )}
            </span>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-1.5 p-3 pb-2">
          {/* Name */}
          <p className="text-xs font-normal text-foreground leading-snug line-clamp-2">
            {item.name}
          </p>

          {/* Category tags: danh_muc + product_type
          {item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[10px] text-justify tracking-normal whitespace-pre-line leading-snug text-muted-foreground bg-muted px-0 py-0.5 rounded-full leading-none"
                >
                  {tag}
                </span>
              ))}
            </div>
          )} */}

          {/* Price — hidden when null (price unknown / not set) */}
          {item.price != null && (
            <p className="text-xs font-semibold text-foreground mt-auto">
              {item.price}
            </p>
          )}
        </div>

        {/* ── Action row: Add to Cart + Mua ngay ─────────────────────────── */}
        <div className="flex items-center gap-1.5 px-3 pb-3 pt-0.5">
          {/* Add to Cart — icon-only, compact */}
          <Button
            id={`product-cart-${item.id}`}
            variant="outline"
            size="icon-sm"
            onClick={handleAddToCart}
            className="shrink-0 h-7 w-7 border-border/50 hover:border-[#fd9401] hover:text-[#fd9401] transition-colors"
            aria-label={`Thêm ${item.name} vào giỏ hàng`}
            title={`Thêm ${item.name} vào giỏ hàng`}
          >
            <ShoppingCart size={13} />
          </Button>

          {/* Mua ngay — fills remaining space */}
          <Button
            id={`product-buynow-${item.id}`}
            onClick={handleBuyNow}
            className="flex-1 h-7 text-[11px] font-semibold gap-1 px-2 min-w-0 text-black"
            style={{ backgroundColor: '#ffe48a' }}
            aria-label={`Mua ngay ${item.name}`}
            title={`Mua ngay ${item.name}`}
          >
            Mua ngay
          </Button>
        </div>
      </div>
    );
  }
);
