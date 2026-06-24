import React from 'react';
import { type PlaceDetail } from '../../services/placeDetail.service';

interface PlaceDetailCardProps {
  place: PlaceDetail;
  cardType: 'DEFAULT_CLICK_CARD' | 'SEARCH_RESULT_CARD';
  onGetDirections?: () => void;
  onClose?: () => void;
}

export const PlaceDetailCard: React.FC<PlaceDetailCardProps> = ({
  place,
  cardType,
  onGetDirections,
  onClose,
}) => {
  if (cardType === 'SEARCH_RESULT_CARD') {
    return (
      <div className="place-detail-click-card secondary-card">
        <div className="place-detail-content">
          <h4 className="place-detail-title">{place.name}</h4>
          <p className="place-detail-address">{place.address}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="place-detail-click-card">
      <div className="place-detail-header">
        <span className="location-tag">
          📍 {place.category || 'Location'}
        </span>
        {onClose && (
          <button className="close-card-btn" onClick={onClose} title="Close detail card">
            <svg viewBox="0 0 24 24" style={{ width: '16px', height: '16px', fill: 'currentColor' }}>
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}
      </div>
      <div className="place-detail-content">
        <h4 className="place-detail-title">{place.name}</h4>
        <p className="place-detail-address">{place.address}</p>
        {cardType === 'DEFAULT_CLICK_CARD' && (
          <div className="place-detail-coords">
            <span className="coords-label">Coordinates: </span>
            {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
          </div>
        )}
      </div>
      {cardType === 'DEFAULT_CLICK_CARD' && onGetDirections && (
        <div className="place-detail-actions">
          <button className="get-directions-btn" onClick={onGetDirections}>
            <svg viewBox="0 0 24 24" className="action-icon">
              <path d="M22.43 10.43L13.57 1.57c-.78-.78-2.05-.78-2.83 0l-8.86 8.86c-.78.78-.78 2.05 0 2.83l8.86 8.86c.78.78 2.05.78 2.83 0l8.86-8.86c.78-.78.78-2.05 0-2.83zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5L18 11l-4 3.5z" />
            </svg>
            <span>Directions</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PlaceDetailCard;
