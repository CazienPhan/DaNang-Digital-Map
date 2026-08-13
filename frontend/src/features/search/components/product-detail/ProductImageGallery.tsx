import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ProductImageGalleryProps {
  /** Real image URLs from poi_media (media_category='Quy trinh', media_type='Image'). */
  imageUrls: string[];
  productName: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** How many pixels to scroll per button click. */
const SCROLL_AMOUNT = 176;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * ProductImageGallery
 *
 * Horizontal scrollable image carousel displayed between ProductDetailOverview
 * and ProductFindStoreButton.
 *
 * DATA SOURCE: poi_media where
 *   media_category = 'Quy trinh'
 *   AND media_type  = 'Image'
 *   AND product_type_id = <current product id>
 *
 * Renders nothing when imageUrls is empty.
 *
 * No standalone heading or background — the gallery inherits the surrounding
 * Product Detail content area styling and appears as an inline element.
 */
export const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  imageUrls,
  productName,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Empty state: hide the entire section as per project convention.
  if (imageUrls.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'left' ? -SCROLL_AMOUNT : SCROLL_AMOUNT,
      behavior: 'smooth',
    });
  };

  return (
    <div className="w-full relative px-2 py-1">
      {/* Left scroll button */}
      <button
        type="button"
        aria-label="Cuộn trái"
        onClick={() => scroll('left')}
        className="absolute left-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition hover:scale-105 active:scale-90"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#720000' }}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Scrollable image strip */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto scroll-smooth px-10 scrollbar-hidden"
      >
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className="shrink-0 w-[152px] h-[152px] rounded-xl overflow-hidden border border-amber-200"
          >
            <img
              src={url}
              alt={`${productName} — hình ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <button
        type="button"
        aria-label="Cuộn phải"
        onClick={() => scroll('right')}
        className="absolute right-2 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full shadow-md transition hover:scale-105 active:scale-90"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', color: '#720000' }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default ProductImageGallery;
