import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PoiVideoGalleryProps {
  videos: { url: string; caption?: string }[];
  /**
   * isTourismPoi: true  -> portrait (9:16) cards -- POI from poi_details_tourism
   * isTourismPoi: false -> landscape (16:9) cards -- POI from poi_details_business
   */
  isTourismPoi: boolean;
}

/** Individual video card with independent hover-play / leave-pause behaviour */
const VideoCard: React.FC<{
  url: string;
  caption?: string;
  portrait: boolean;
}> = ({ url, caption, portrait }) => {
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

  if (portrait) {
    return (
      /* Portrait card -- Tourism POIs (poi_details_tourism), 9:16 */
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
  }

  return (
    /* Landscape card -- Business POIs (poi_details_business), 16:9 */
    <div className="shrink-0 w-55 aspect-[16/9] snap-start rounded-xl overflow-hidden relative cursor-pointer group bg-black">
      <video
        ref={videoRef}
        src={url}
        controls
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {caption && (
        <div className="absolute bottom-0 inset-x-0 bg-black/50 backdrop-blur-sm px-2 py-1 pointer-events-none">
          <span className="text-[0.6rem] text-white/90 leading-tight line-clamp-1">
            {caption}
          </span>
        </div>
      )}
    </div>
  );
};

export const PoiVideoGallery: React.FC<PoiVideoGalleryProps> = React.memo(({ videos, isTourismPoi }) => {
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
            portrait={isTourismPoi}
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
