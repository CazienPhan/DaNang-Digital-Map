import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PoiVideoGalleryProps {
  videos: { url: string; caption?: string }[];
  /**
   * isTourismPoi is kept for API compatibility but no longer controls card orientation.
   * Both Business POIs (poi_details_business) and Tourism POIs (poi_details_tourism)
   * now use the same portrait (9:16) vertical video presentation.
   */
  isTourismPoi: boolean;
}

/** Individual video card with independent hover-play / leave-pause behaviour */
const VideoCard: React.FC<{
  url: string;
  caption?: string;
}> = ({ url, caption }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleMouseEnter = () => {
    videoRef.current?.play();
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Both Tourism and Business POIs use the portrait (9:16) vertical format.
  return (
    /* Portrait card -- all POIs (poi_details_tourism and poi_details_business), 9:16 */
    <div className="shrink-0 w-28 aspect-[9/16] snap-start rounded-xl overflow-hidden relative cursor-pointer group bg-black">
      <video
        ref={videoRef}
        src={url}
        controls
        className="w-full h-full object-cover"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {caption && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-2 pointer-events-none">
          <p className="font-black text-[11px] leading-tight text-[#FFE4B0]">
            {caption}
          </p>
        </div>
      )}
    </div>
  );
};

export const PoiVideoGallery: React.FC<PoiVideoGalleryProps> = React.memo(({ videos, isTourismPoi: _isTourismPoi }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (videos.length === 0) return null;

  const scroll = (direction: 'left' | 'right') => {
    scrollRef.current?.scrollBy({
      left: direction === 'right' ? 280 : -280,
      behavior: 'smooth',
    });
  };

  return (
    <div className="relative">
      {/* Section label */}
      <p className="uppercase text-sm font-extrabold text-foreground pt-3 pb-1 mb-2">New Feed</p>

      {/* Horizontal scroll strip */}
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {videos.map((vid, idx) => (
          <VideoCard
            key={idx}
            url={vid.url}
            caption={vid.caption}
          />
        ))}
      </div>

      {/* Navigation buttons -- only shown when there are multiple videos */}
      {videos.length > 1 && (
        <>
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 mt-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-white transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Cuon trai"
          >
            <ChevronLeft size={16} strokeWidth={2.5} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 mt-2 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/90 shadow-md backdrop-blur-sm text-foreground/70 hover:text-foreground hover:bg-white transition-all duration-200 hover:scale-105 active:scale-95"
            aria-label="Cuon phai"
          >
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </>
      )}
    </div>
  );
});
