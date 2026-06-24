import { useState } from 'react';
import { type MapCoordinate } from '../components/Map/MapContainer';
import { type PlaceDetail } from '../services/placeDetail.service';

export type CardType = 'DEFAULT_CLICK_CARD' | 'SEARCH_RESULT_CARD' | 'GPS_LOCATION_CARD' | null;

export const usePlaceDetail = () => {
  const [clickedLocation, setClickedLocation] = useState<MapCoordinate | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetail | null>(null);
  const [currentCardType, setCurrentCardType] = useState<CardType>(null);

  const clearPlaceDetail = () => {
    setClickedLocation(null);
    setSelectedPlace(null);
    setCurrentCardType(null);
  };

  return {
    clickedLocation,
    setClickedLocation,
    selectedPlace,
    setSelectedPlace,
    currentCardType,
    setCurrentCardType,
    clearPlaceDetail,
  };
};

export default usePlaceDetail;
