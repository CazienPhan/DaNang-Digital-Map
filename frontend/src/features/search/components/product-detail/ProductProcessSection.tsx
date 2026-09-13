import React, { useRef, useState } from 'react';
import { Play, Pause } from 'lucide-react';

interface ProductProcessSectionProps {
  productName: string;
  imageUrl: string | null;
  videoUrl: string | null;
  title: string | null;
  body: string | null;
}

/**
 * ProductProcessSection — content of pill 2 (Quy trình sản xuất):
 * video (autoplay/loop, play-pause overlay) when available, else a static
 * image, then bold subtitle, then body paragraph. Video takes priority
 * over the image when both are present.
 */
export const ProductProcessSection: React.FC<ProductProcessSectionProps> = ({
  productName,
  imageUrl,
  videoUrl,
  title,
  body,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);

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
    <div className="space-y-3">
      {videoUrl ? (
        <div className="relative w-full overflow-hidden">
          <video
            ref={videoRef}
            src={videoUrl}
            className="h-48 w-full object-cover"
            aria-label={`${productName} — video quy trình sản xuất`}
            playsInline
            loop
            autoPlay
            muted
            onEnded={() => setIsPlaying(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              type="button"
              aria-label={isPlaying ? 'Tạm dừng video' : 'Phát video'}
              onClick={togglePlay}
              className={[
                'flex items-center justify-center rounded-full transition-all duration-200',
                'h-14 w-14 shadow-lg',
                isPlaying
                  ? 'bg-black/30 opacity-0 hover:opacity-100'
                  : 'bg-black/50 opacity-100',
              ].join(' ')}
            >
              {isPlaying
                ? <Pause size={22} fill="white" className="text-white" />
                : <Play size={24} fill="white" className="ml-1 text-white" />
              }
            </button>
          </div>
        </div>
      ) : (
        imageUrl && (
          <div className="w-full overflow-hidden">
            <img
              src={imageUrl}
              alt={productName}
              className="w-full h-40 object-cover"
              loading="lazy"
            />
          </div>
        )
      )}
      {title && <p className="mt-4 text-sm font-bold text-foreground uppercase">{title}</p>}
      {body && (
        <p className="text-justify text-xs leading-relaxed whitespace-pre-line text-foreground">
          {body}
        </p>
      )}
    </div>
  );
};

export default ProductProcessSection;
