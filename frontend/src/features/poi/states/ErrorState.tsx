import React from "react";

interface ErrorStateProps {
    isSecondary?: boolean;
    error?: string | null;
    onClose?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({
    isSecondary = false,
    error = null,
    onClose,
}) => {

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

});

export default ErrorState;
