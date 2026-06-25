import React, { useState } from 'react';
import { type POIDetailData } from '../../services/poi.service';

interface PoiDetailCardProps {
  poi: POIDetailData | null;
  loading?: boolean;
  error?: string | null;
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
          // Portrait/square images (height >= width) render 2 per row (span 1 in grid)
          // Landscape images (height < width) render 1 per row (span 2 in grid)
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

const translateDay = (day: string): string => {
  const dayLower = day.toLowerCase();
  switch (dayLower) {
    case 'monday': return 'Thứ hai';
    case 'tuesday': return 'Thứ ba';
    case 'wednesday': return 'Thứ tư';
    case 'thursday': return 'Thứ năm';
    case 'friday': return 'Thứ sáu';
    case 'saturday': return 'Thứ bảy';
    case 'sunday': return 'Chủ nhật';
    default: return day.charAt(0).toUpperCase() + day.slice(1);
  }
};

const translateTimeValue = (value: string): string => {
  if (!value) return '';
  const valLower = value.toLowerCase().trim();
  if (valLower === 'open' || valLower === 'open hours' || valLower === 'đang mở cửa') return 'Đang mở cửa';
  if (valLower === 'closed' || valLower === 'đã đóng cửa') return 'Đã đóng cửa';
  if (valLower === '24/7' || valLower === 'open 24 hours' || valLower === 'open 24/7' || valLower === 'mở cửa 24/7') return 'Mở cửa 24/7';
  return value;
};

export const PoiDetailCard: React.FC<PoiDetailCardProps> = ({
  poi,
  loading = false,
  error = null,
  onGetDirections,
  onClose,
  isSecondary = false,
}) => {
  // 1. Render Loading State inside the unified glassmorphism wrapper
  if (loading) {
    return (
      <div className={isSecondary ? "poi-detail-card secondary-card poi-loading-card" : "poi-detail-card primary-card poi-loading-card"}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '24px' }}>
          <svg className="spin-animation" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: '#3b82f6' }}>
            <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16c4.41 0 8-3.59 8-8h2c0 5.52-4.48 10-10 10v-2z" />
          </svg>
          <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>Đang kết nối với Supabase...</span>
        </div>
      </div>
    );
  }

  // 2. Render Error State with Cause, Solution, and Affected Component
  if (error || !poi) {
    return (
      <div className={isSecondary ? "poi-detail-card secondary-card" : "poi-detail-card primary-card"}>
        <div className="poi-header">
          <span className="poi-tag" style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            ⚠️ Lỗi Truy Vấn
          </span>
          {onClose && (
            <button className="poi-close-btn" onClick={onClose} title="Đóng">
              <svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" /></svg>
            </button>
          )}
        </div>
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', color: '#f8fafc', fontSize: '0.82rem' }}>
          <div style={{ fontWeight: 700, color: '#f87171' }}>Không thể truy xuất thông tin địa điểm.</div>
          <div style={{ lineHeight: 1.4 }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>Thành phần bị ảnh hưởng:</span> POI Detail Card</div>
          <div style={{ lineHeight: 1.4 }}><span style={{ color: '#94a3b8', fontWeight: 600 }}>Nguyên nhân:</span> {error || 'No POI data returned from database.'}</div>
          <div style={{ lineHeight: 1.4 }}><span style={{ color: '#10b981', fontWeight: 600 }}>Giải pháp:</span> Kiểm tra kết nối cơ sở dữ liệu, đảm bảo bảng "poi.pois" đang hoạt động và xem log terminal backend.</div>
        </div>
      </div>
    );
  }

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

  // Render Star Ratings: ⭐⭐⭐⭐⭐ 4.5 (43276 reviews)
  const renderStars = (rating: number | null) => {
    const stars = [];
    const finalRating = rating !== null && rating !== undefined ? rating : 0.0;
    const fullStars = Math.floor(finalRating);
    const hasHalfStar = finalRating % 1 >= 0.5;

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
        <span className="poi-rating-value">{finalRating.toFixed(1)}</span>
        <span className="poi-reviews-count">
          {poi.luot_danh_gia !== null && poi.luot_danh_gia !== undefined 
            ? `(${poi.luot_danh_gia} đánh giá)` 
            : '(Chưa có đánh giá)'}
        </span>
      </div>
    );
  };

  const isTourism = poi.poi_type === 'TOURISM';
  const tagColor = poi.category_color_hex || '#3b82f6';

  return (
    <div className={isSecondary ? "poi-detail-card secondary-card" : "poi-detail-card primary-card"}>
      {/* Header section (Tag + Close) */}
      <div className="poi-header">
        <span 
          className="poi-tag" 
          style={{ 
            color: tagColor, 
            background: `${tagColor}15`, 
            borderColor: `${tagColor}35`,
            border: `1px solid ${tagColor}35`
          }}
        >
          {poi.category_name || poi.poi_type}
        </span>
        {onClose && (
          <button className="poi-close-btn" onClick={onClose} title="Close details">
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>

      {/* Place name + rating stars (pinned at top, centered) */}
      <div className="poi-title-rating-section">
        <h4 className="poi-name" style={{ color: tagColor }}>
          {poi.name?.toUpperCase()}
        </h4>
        {renderStars(poi.so_sao)}
      </div>

      {/* Scrollable body content (internal scrolling) */}
      <div className="poi-scroll-content">
        
        {/* Information Group */}
        <div className="poi-info-section">
          {/* Category / Nganh Hang (Business Card only) */}
          {!isTourism && poi.nganh_hang && (
            <div className="poi-info-row">
              <span className="poi-info-icon">💼</span>
              <span className="poi-info-label">Ngành hàng:</span>
              <span className="poi-info-value highlight-value">{poi.nganh_hang}</span>
            </div>
          )}

          {/* Address (Both) */}
          {poi.dia_chi && (
            <div className="poi-info-row">
              <span className="poi-info-icon">📍</span>
              <span className="poi-info-label">Địa chỉ:</span>
              <span className="poi-info-value">{poi.dia_chi}</span>
            </div>
          )}

          {/* Tourism properties */}
          {isTourism && (
            <>
              {poi.nam_xay_dung && (
                <div className="poi-info-row">
                  <span className="poi-info-icon">📅</span>
                  <span className="poi-info-label">Năm xây dựng:</span>
                  <span className="poi-info-value">{poi.nam_xay_dung}</span>
                </div>
              )}
              {poi.gia_ve && (
                <div className="poi-info-row">
                  <span className="poi-info-icon">🎟️</span>
                  <span className="poi-info-label">Giá vé:</span>
                  <span className="poi-info-value">{poi.gia_ve}</span>
                </div>
              )}
            </>
          )}

          {/* Phone (Both, but parsed list) */}
          {poi.sdt && (() => {
            let displayPhone = '';
            try {
              const numbers = JSON.parse(poi.sdt);
              if (Array.isArray(numbers) && numbers.length > 0) {
                displayPhone = numbers.join(', ');
              } else {
                displayPhone = poi.sdt;
              }
            } catch {
              displayPhone = poi.sdt;
            }
            return (
              <div className="poi-info-row">
                <span className="poi-info-icon">📞</span>
                <span className="poi-info-label">Số điện thoại:</span>
                <span className="poi-info-value">{displayPhone}</span>
              </div>
            );
          })()}

          {/* Opening Hours */}
          {poi.gio_mo_cua && (() => {
            const hours = poi.gio_mo_cua;
            const values = Object.values(hours);
            const is247 = values.length > 0 && values.every(val => val.toLowerCase() === '24/7' || val.toLowerCase() === 'open 24 hours' || val.toLowerCase() === 'open 24/7' || val.toLowerCase() === 'mở cửa 24/7');
            
            return (
              <div className="poi-info-row align-start">
                <span className="poi-info-icon">🕒</span>
                <span className="poi-info-label">Giờ mở cửa:</span>
                <div className="poi-info-value">
                  {is247 ? (
                    <span className="open-247">Mở cửa 24/7</span>
                  ) : (
                    <div className="hours-list">
                      {Object.entries(hours).map(([day, time]) => (
                        <div key={day} className="hours-day-line">
                          <span className="hours-day">{translateDay(day)}:</span>
                          <span className="hours-time">{translateTimeValue(time)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Website Links */}
          {poi.website && poi.website.length > 0 && (
            <div className="poi-info-row">
              <span className="poi-info-icon">🌐</span>
              <span className="poi-info-label">Website:</span>
              <div className="poi-info-value website-links">
                {poi.website.map((url, idx) => {
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
          )}
        </div>

        {/* Tourism Description / Introduction */}
        {isTourism && poi.gioi_thieu && (
          <div className="poi-description-section">
            <h5 className="section-title">Giới thiệu</h5>
            <p className="poi-description-text">{poi.gioi_thieu}</p>
          </div>
        )}

        {/* Media: Photos (Max 4, 2x2 grid for portrait/square, full-width rows for landscape) */}
        {images.length > 0 && (
          <div className="poi-media-section">
            <h5 className="section-title">Hình ảnh</h5>
            <div className="poi-media-grid">
              {images.map((img, idx) => (
                <PoiImageItem key={idx} url={img.url} caption={img.caption} />
              ))}
            </div>
          </div>
        )}

        {/* Media: Videos (Max 2, 2-column layout) */}
        {videos.length > 0 && (
          <div className="poi-media-section">
            <h5 className="section-title">Video</h5>
            <div className="poi-videos-grid">
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

      {/* Pinned action buttons at bottom */}
      {onGetDirections && (
        <div className="poi-actions-section">
          <button className="poi-directions-btn" onClick={onGetDirections}>
            <svg viewBox="0 0 24 24" className="action-icon">
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
