import React, { useEffect } from 'react';
import { PlaceDetailService, type PlaceDetail } from '@/services/map4d/placeDetail.service';

interface MapClickHandlerProps {
  mapInstance: any;
  onPlaceResolved: (place: PlaceDetail, cardType: 'DEFAULT_CLICK_CARD' | 'SEARCH_RESULT_CARD') => void;
  hasContext: boolean;
}

export const MapClickHandler: React.FC<MapClickHandlerProps> = ({
  mapInstance,
  onPlaceResolved,
  hasContext,
}) => {
  useEffect(() => {
    if (!mapInstance) return;

    // Register click event on Map4D instance
    const listener = mapInstance.addListener('click', async (args: any) => {
      // Avoid processing click if a POI, Marker, Place, or Mappoi was clicked to prevent event conflicts
      if (args && (args.poi || args.mappoi || args.place || args.marker)) {
        return;
      }
      if (args && args.location) {
        const lat = args.location.lat;
        const lng = args.location.lng;
        try {
          const detail = await PlaceDetailService.getPlaceDetail(lat, lng);
          const resolvedCardType = hasContext ? 'SEARCH_RESULT_CARD' : 'DEFAULT_CLICK_CARD';
          onPlaceResolved(detail, resolvedCardType);
        } catch (err) {
          console.error('Failed to handle map click reverse geocoding:', err);
        }
      }
    });

    return () => {
      // Unbind click listener to prevent leakages
      if (listener && typeof listener.remove === 'function') {
        listener.remove();
      }
    };
  }, [mapInstance, onPlaceResolved, hasContext]);

  return null;
};

export default MapClickHandler;
