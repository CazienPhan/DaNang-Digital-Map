import React from 'react';

interface PoiVideoGalleryProps {
  videos: { url: string; caption?: string }[];
}

export const PoiVideoGallery: React.FC<PoiVideoGalleryProps> = React.memo(({ videos }) => {
  if (videos.length === 0) return null;

  return (
    <div className="poi-media-section">
      <h3 className="section-title !normal-case !text-xs !font-semibold !tracking-normal !text-foreground">New Feed</h3>
      <div className="poi-videos-grid">
        {videos.map((vid, idx) => (
          <div key={idx} className="poi-video-container">
            <video src={vid.url} controls className="poi-detail-video" />
            {vid.caption && <span className="poi-video-caption text-xs text-muted-foreground">{vid.caption}</span>}
          </div>
        ))}
      </div>
    </div>
  );
});
