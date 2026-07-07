import React from 'react';

interface PoiActionsProps {
  onGetDirections?: () => void;
}

export const PoiActions: React.FC<PoiActionsProps> = React.memo(({ onGetDirections }) => {
  if (!onGetDirections) return null;

  return (
    <div className="poi-actions-section">
      <button className="poi-directions-btn" onClick={onGetDirections}>
        <svg viewBox="0 0 24 24" className="action-icon">
          <path d="M22.43 10.43L13.57 1.57c-.78-.78-2.05-.78-2.83 0l-8.86 8.86c-.78.78-.78 2.05 0 2.83l8.86 8.86c.78.78 2.05.78 2.83 0l8.86-8.86c.78-.78.78-2.05 0-2.83zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5L18 11l-4 3.5z" />
        </svg>
        <span>Get Directions</span>
      </button>
    </div>
  );
});
