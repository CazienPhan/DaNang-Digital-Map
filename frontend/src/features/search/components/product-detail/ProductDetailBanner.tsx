import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface ProductDetailVideoBannerProps {
  url: string | null;
  productName: string;
}

/**
 * ProductDetailVideoBanner — Section 1.
 *
 * Full-width video banner with play/pause control.
 * Sourced from poi.poi_media where:
 *   media_category = 'banner' AND media_type = 'VIDEO'
 * Renders nothing when url is null.
 */
export const ProductDetailBanner: React.FC<ProductDetailVideoBannerProps> = ({
  url,
  productName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  if (!url) return null;

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative mx-7 overflow-hidden border-1 border-[#720000]">
      <video
        ref={videoRef}
        src={url}
        className="w-full object-cover"
        aria-label={`${productName} video`}
        playsInline
        loop
        autoPlay
        onEnded={() => setIsPlaying(false)}
      />

      {/* Play / Pause overlay button */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
          onClick={togglePlay}
          className={[
            'flex items-center justify-center rounded-full transition-all duration-200',
            'w-14 h-14 shadow-lg',
            isPlaying
              ? 'bg-black/30 opacity-0 hover:opacity-100'
              : 'bg-black/50 opacity-100',
          ].join(' ')}
        >
          {isPlaying
            ? <Pause size={22} fill="white" className="text-white" />
            : <Play size={24} fill="white" className="text-white ml-1" />
          }
        </button>
      </div>
    </div>
  );
};

export default ProductDetailBanner;
