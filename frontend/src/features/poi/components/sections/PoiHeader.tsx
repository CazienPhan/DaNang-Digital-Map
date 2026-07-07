import React from 'react';

interface PoiHeaderProps {
  tagColor: string;
  categoryName?: string;
  poiType?: string;
  onClose?: () => void;
}

export const PoiHeader: React.FC<PoiHeaderProps> = React.memo(({ tagColor, categoryName, poiType, onClose }) => {
  return (
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
        {categoryName || poiType}
      </span>
      {onClose && (
        <button className="poi-close-btn" onClick={onClose} title="Close details">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      )}
    </div>
  );
});
