import React from 'react';
import { type POIDetailData } from '@/services/supabase/poi.service';

interface PoiInformationProps {
  poi: POIDetailData;
}

export const PoiInformation: React.FC<PoiInformationProps> = React.memo(({ poi }) => {
  const isTourism = poi.poi_type === 'TOURISM';

  return (
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



      {/* Website Links */}
      {poi.website && (Array.isArray(poi.website) || typeof poi.website === 'string') && (() => {
        const websiteList = Array.isArray(poi.website)
          ? poi.website
          : (typeof (poi.website as any) === 'string' && (poi.website as any).trim() !== '' ? [poi.website as any] : []);
        if (websiteList.length === 0) return null;
        return (
          <div className="poi-info-row">
            <span className="poi-info-icon">🌐</span>
            <span className="poi-info-label">Website:</span>
            <div className="poi-info-value website-links">
              {websiteList.map((url, idx) => {
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
      })()}
    </div>
  );
});
