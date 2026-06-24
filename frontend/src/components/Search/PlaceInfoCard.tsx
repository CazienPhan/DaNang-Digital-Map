import React from 'react';
import { type LocationState } from '../../hooks/useDirection';

interface PlaceInfoCardProps {
  place: LocationState;
  onClose: () => void;
  onGetDirections: () => void;
}

export const PlaceInfoCard: React.FC<PlaceInfoCardProps> = ({
  place,
  onClose,
  onGetDirections,
}) => {
  return (
    <div className="place-info-card">
      <button className="close-card-btn" onClick={onClose} title="Close info">
        <svg viewBox="0 0 24 24">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>
      <div className="place-info-content">
        <h4 className="place-info-title">{place.name || 'Selected Location'}</h4>
        {place.address && <p className="place-info-address">{place.address}</p>}
        <div className="place-info-coords">
          <span className="coords-label">Coordinates: </span>
          <span className="coords-value">
            {place.lat.toFixed(6)}, {place.lng.toFixed(6)}
          </span>
        </div>
      </div>
      <div className="place-info-actions">
        <button className="get-directions-btn" onClick={onGetDirections}>
          <svg viewBox="0 0 24 24" className="action-icon">
            <path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5L18 11l-4 3.5z" />
          </svg>
          Directions
        </button>
      </div>
    </div>
  );
};

export default PlaceInfoCard;
