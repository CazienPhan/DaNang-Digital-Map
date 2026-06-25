import React, { useState } from 'react';
import { type POIDetailData } from '../../services/poi.service';

interface PoiDetailCardProps {
  poi: POIDetailData;
  onGetDirections?: () => void;
  onClose?: () => void;
  isSecondary?: boolean;
}

const PoiImageItem: React.FC<{ url: string; caption?: string }> = ({ url, caption }) => {
  const [aspect, setAspect] = useState<'portrait' | 'landscape'>('landscape');

  return (
    <div className={`poi-image-item ${aspect}`}>
      <img
        src={url}
        alt={caption || 'POI Media'}
        className="poi-detail-image"
        onLoad={(e) => {
          const img = e.currentTarget;
          // Portrait/square images (height >= width) render 2 per row
          // Landscape images (height < width) render 1 per row
          if (img.naturalHeight >= img.naturalWidth) {
            setAspect('portrait');
          } else {
            setAspect('landscape');
          }
        }}
      />
      {caption && <span className="poi-image-caption">{caption}</span>}
    </div>
  );
};

export const PoiDetailCard: React.FC<PoiDetailCardProps> = ({
  poi,
  onGetDirections,
  onClose,
  isSecondary = false,
}) => {
  // Helper to split whitespace/newline separated media URLs
  const getMediaUrls = (urlStr: string): string[] => {
    if (!urlStr) return [];
    return urlStr.split(/[\s\n\r]+/).map(u => u.trim()).filter(Boolean);
  };

  // Process and separate images and videos (Max 4 images, Max 2 videos)
  const rawMedia = poi.media || [];
  const images: { url: string; caption?: string }[] = [];
  const videos: { url: string; caption?: string }[] = [];

  rawMedia.forEach((m) => {
    const urls = getMediaUrls(m.url);
    urls.forEach((url) => {
      if (m.media_type === 'IMAGE' || url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)/)) {
        if (images.length < 4) {
          images.push({ url, caption: m.caption || undefined });
        }
      } else if (m.media_type === 'VIDEO' || url.toLowerCase().match(/\.(mp4|webm|ogg|mov)/)) {
        if (videos.length < 2) {
          videos.push({ url, caption: m.caption || undefined });
        }
      }
    });
  });

  // Render Star Ratings
  const renderStars = (rating: number | null) => {
    if (rating === null || rating === undefined) return null;
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<span key={i} className="star full">★</span>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<span key={i} className="star half">⯪</span>);
      } else {
        stars.push(<span key={i} className="star empty">☆</span>);
      }
    }
    return (
      <div className="poi-rating-row">
        <span className="poi-stars">{stars}</span>
        <span className="poi-rating-value">{rating.toFixed(1)}</span>
        {poi.luot_danh_gia !== null && poi.luot_danh_gia !== undefined && (
          <span className="poi-reviews-count">({poi.luot_danh_gia} reviews)</span>
        )}
      </div>
    );
  };

  // Helper to format opening hours
  const renderOpeningHours = (hours: Record<string, string> | null) => {
    if (!hours || Object.keys(hours).length === 0) return null;
    
    // Check if it's 24/7
    const values = Object.values(hours);
    if (values.length > 0 && values.every(val => val.toLowerCase() === '24/7' || val.toLowerCase() === 'open 24 hours')) {
      return <div className="poi-meta-item"><span className="meta-label">🕒 Opening:</span> <span className="open-247">Open 24/7</span></div>;
    }

    // Format individual days (collapsible or neat list)
    return (
      <div className="poi-meta-item hours-container">
        <span className="meta-label">🕒 Opening Hours:</span>
        <div className="hours-dropdown">
          {Object.entries(hours).map(([day, time]) => {
            const displayDay = day.charAt(0).toUpperCase() + day.slice(1);
            return (
              <div key={day} className="hours-row">
                <span className="hours-day">{displayDay}:</span>
                <span className="hours-time">{time}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper to format website links
  const renderWebsites = (urls: string[] | null) => {
    if (!urls || urls.length === 0) return null;
    return (
      <div className="poi-meta-item">
        <span className="meta-label">🌐 Website:</span>
        <div className="website-links">
          {urls.map((url, idx) => {
            let label = 'Visit Website';
            try {
              const parsed = new URL(url);
              label = parsed.hostname.replace('www.', '');
            } catch {
              // fallback
            }
            return (
              <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="poi-link">
                {label}
              </a>
            );
          })}
        </div>
      </div>
    );
  };

  // Render card based on POI Type (TOURISM is Tourism Card; others like OCOP_STORE, MARKET are Business Cards)
  const isTourism = poi.poi_type === 'TOURISM';
  const tagColor = poi.category_color_hex || '#3b82f6';
  
  return (
    <div className={isSecondary ? "place-detail-click-card secondary-card poi-detail-card" : "place-info-card poi-detail-card primary-card"}>
      {/* Header section */}
      <div className="place-detail-header">
        <span 
          className="location-tag" 
          style={{ 
            color: tagColor, 
            background: `${tagColor}15`, 
            borderColor: `${tagColor}35`,
            border: `1px solid ${tagColor}35`
          }}
        >
          📍 {poi.category_name || poi.poi_type}
        </span>
        {onClose && (
          <button className="close-card-btn" onClick={onClose} title="Close details">
            <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {/* Primary Info content */}
      <div className="place-detail-content">
        <h4 className="place-detail-title poi-title">{poi.name}</h4>
        
        {/* Star Rating */}
        {renderStars(poi.so_sao)}

        {/* Industry / Nganh Hang (Business Card only) */}
        {!isTourism && poi.nganh_hang && (
          <div className="poi-industry">
            <span className="industry-label">💼 Industry: </span>
            <span className="industry-value">{poi.nganh_hang}</span>
          </div>
        )}

        {/* Address */}
        {poi.dia_chi && (
          <div className="poi-address-row">
            <span className="poi-address-icon">📍</span>
            <p className="place-detail-address poi-address">{poi.dia_chi}</p>
          </div>
        )}

        {/* Additional tourism properties */}
        {isTourism && (
          <>
            {poi.nam_xay_dung && (
              <div className="poi-meta-item">
                <span className="meta-label">📅 Built:</span>
                <span className="meta-value">{poi.nam_xay_dung}</span>
              </div>
            )}
            {poi.gia_ve && (
              <div className="poi-meta-item ticket-price">
                <span className="meta-label">🎫 Ticket Price:</span>
                <span className="meta-value">{poi.gia_ve}</span>
              </div>
            )}
          </>
        )}

        {/* Phone / SDT */}
        {poi.sdt && (() => {
          try {
            const numbers = JSON.parse(poi.sdt);
            if (Array.isArray(numbers) && numbers.length > 0) {
              return (
                <div className="poi-meta-item">
                  <span className="meta-label">📞 Phone:</span>
                  <span className="meta-value">{numbers.join(', ')}</span>
                </div>
              );
            }
          } catch {
            return (
              <div className="poi-meta-item">
                <span className="meta-label">📞 Phone:</span>
                <span className="meta-value">{poi.sdt}</span>
              </div>
            );
          }
          return null;
        })()}

        {/* Opening Hours & Website */}
        {renderOpeningHours(poi.gio_mo_cua)}
        {renderWebsites(poi.website)}

        {/* Description / Introduction (Tourism Card only) */}
        {isTourism && poi.gioi_thieu && (
          <div className="poi-description-section">
            <h5 className="section-title">Introduction</h5>
            <p className="poi-description-text">{poi.gioi_thieu}</p>
          </div>
        )}

        {/* Media: Images Section */}
        {images.length > 0 && (
          <div className="poi-media-section">
            <h5 className="section-title">Photos</h5>
            <div className="poi-media-grid">
              {images.map((img, idx) => (
                <PoiImageItem key={idx} url={img.url} caption={img.caption} />
              ))}
            </div>
          </div>
        )}

        {/* Media: Videos Section */}
        {videos.length > 0 && (
          <div className="poi-media-section">
            <h5 className="section-title">Videos</h5>
            <div className="poi-videos-list">
              {videos.map((vid, idx) => (
                <div key={idx} className="poi-video-container">
                  <video src={vid.url} controls className="poi-detail-video" />
                  {vid.caption && <span className="poi-video-caption">{vid.caption}</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Directions action button */}
      {onGetDirections && (
        <div className="place-detail-actions poi-actions-row">
          <button 
            className="get-directions-btn" 
            onClick={onGetDirections} 
            style={{ background: '#3b82f6', color: '#ffffff', width: '100%', justifyContent: 'center' }}
          >
            <svg viewBox="0 0 24 24" className="action-icon" style={{ fill: 'currentColor' }}>
              <path d="M22.43 10.43L13.57 1.57c-.78-.78-2.05-.78-2.83 0l-8.86 8.86c-.78.78-.78 2.05 0 2.83l8.86 8.86c.78.78 2.05.78 2.83 0l8.86-8.86c.78-.78.78-2.05 0-2.83zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5L18 11l-4 3.5z" />
            </svg>
            <span>Get Directions</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PoiDetailCard;
