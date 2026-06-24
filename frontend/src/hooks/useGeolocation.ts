import { useState, useCallback } from 'react';
import { type MapCoordinate } from '../components/Map/MapContainer';

export interface GeolocationState {
  getPosition: (
    onSuccess: (coords: MapCoordinate) => void,
    onFailure: (err: string) => void
  ) => void;
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to manage HTML5 Geolocation browser requests.
 * Tracks loading state and handles error notifications.
 */
export function useGeolocation(): GeolocationState {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPosition = useCallback((
    onSuccess: (coords: MapCoordinate) => void,
    onFailure: (err: string) => void
  ) => {
    if (!navigator.geolocation) {
      const msg = 'Geolocation is not supported by your browser.';
      setError(msg);
      onFailure(msg);
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLoading(false);
        onSuccess({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (geoError) => {
        setLoading(false);
        let msg = 'Failed to retrieve coordinates.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          msg = 'GPS access denied. Please grant location permissions.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          msg = 'Request to get user location timed out.';
        }
        setError(msg);
        onFailure(msg);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

  return { getPosition, loading, error };
}
export default useGeolocation;
