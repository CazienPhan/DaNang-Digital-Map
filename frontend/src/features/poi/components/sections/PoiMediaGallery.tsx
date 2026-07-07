import React, { useState } from 'react';

const PoiImageItem: React.FC<{ url: string; caption?: string }> = React.memo(({ url, caption }) => {
  const [aspect, setAspect] = useState<'portrait' | 'landscape'>('landscape');

  return (
    <div className={`poi-image-item ${aspect}`}>
      <img
        src={url}
        alt={caption || 'POI Media'}
        className="poi-detail-image"
        onLoad={(e) => {
          const img = e.currentTarget;
          if (img.naturalHeight >= img.naturalWidth) {
            setAspect('portrait');
          } else {
            setAspect('landscape');
          }
        }}
      />
      {caption && <span className="poi-image-caption text-xs text-muted-foreground">{caption}</span>}
    </div>
  );
});

interface PoiMediaGalleryProps {
  images: { url: string; caption?: string }[];
}

export const PoiMediaGallery: React.FC<PoiMediaGalleryProps> = React.memo(({ images }) => {
  if (images.length === 0) return null;

  return (
    <div className="poi-media-section">
      <h3 className="section-title text-sm font-semibold uppercase tracking-wide text-muted-foreground">Hình ảnh</h3>
      <div className="poi-media-grid">
        {images.map((img, idx) => (
          <PoiImageItem key={idx} url={img.url} caption={img.caption} />
        ))}
      </div>
    </div>
  );
});
