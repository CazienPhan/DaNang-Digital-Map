import React, { useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface PoiMediaGalleryProps {
  images: { url: string; caption?: string }[];
}

export const PoiMediaGallery: React.FC<PoiMediaGalleryProps> = React.memo(({ images }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (images.length === 0) return null;

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 200, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Section label */}
      {/* <p className="text-sm font-bold tracking-normal text-stone-800 mb-2">
        Hình ảnh
      </p> */}

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {images.map((img, idx) => (
          <div
            key={idx}
            className="shrink-0 w-36 h-36 rounded-xl overflow-hidden snap-start bg-muted relative group"
            title={img.caption}
          >
            <img
              src={img.url}
              alt={img.caption || `Ảnh ${idx + 1}`}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
            {img.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm px-2 py-1">
                <span className="text-[0.6rem] text-white/90 leading-tight line-clamp-1">
                  {img.caption}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating scroll-right button — only shown when there are multiple images */}
      {images.length > 1 && (
        <button
          onClick={scrollRight}
          className="absolute right-0 top-1/2 -translate-y-1/2 mt-2 z-10
            w-8 h-8 flex items-center justify-center
            rounded-full bg-white/90 shadow-md backdrop-blur-sm
            text-foreground/70 hover:text-foreground hover:bg-white
            transition-all duration-200 hover:scale-105 active:scale-95"
          aria-label="Xem thêm ảnh"
        >
          <ChevronRight size={16} strokeWidth={2.5} />
        </button>
      )}
    </div>
  );
});
