import React from 'react';

interface LoadingStateProps {
    isSecondary?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = React.memo(({
    isSecondary = false,
}) => {
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
});

export default LoadingState;
