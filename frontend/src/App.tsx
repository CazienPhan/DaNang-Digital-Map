import { useState, useEffect } from 'react';
import MapContainer, { type MapCoordinate } from './components/Map/MapContainer';
import SearchBar from './components/Search/SearchBar';
import { useDirection, type LocationState } from './hooks/useDirection';
import { SearchService, type PlaceSuggestion } from './services/map4d/search.service';
import PlaceDetailCard from './components/Search/PlaceDetailCard';
import MapClickHandler from './components/Map/MapClickHandler';
import { type PlaceDetail } from './services/placeDetail.service';
import './App.css';

function App() {
  const [center, setCenter] = useState<MapCoordinate>({ lat: 16.0544, lng: 108.2022 });
  const [zoom, setZoom] = useState<number>(13);
  const [markerPosition, setMarkerPosition] = useState<MapCoordinate | null>(null);
  
  // 1. Core separated states
  const [selectedPlace, setSelectedPlace] = useState<LocationState | null>(null);
  const [activeDestination, setActiveDestination] = useState<LocationState | null>(null);
  const [routeMode, setRouteMode] = useState<boolean>(false);
  const [secondarySelectedPlace, setSecondarySelectedPlace] = useState<PlaceDetail | null>(null);
  const [clickedLocation, setClickedLocation] = useState<MapCoordinate | null>(null);

  // Cache resolved GPS location coordinates and geocoded physical address
  const [cachedGps, setCachedGps] = useState<LocationState | null>(null);

  const [mapInstance, setMapInstance] = useState<any>(null);

  const {
    origin,
    setOrigin,
    destination,
    setDestination,
    routeData,
    calculateRoute,
    clearRoute,
    clearRouteData,
    loading: routeLoading,
    error: routeError,
    setError: setRouteError,
    panelOpen,
    setPanelOpen,
  } = useDirection();

  // Synchronize activeDestination with routing destination from useDirection hook
  useEffect(() => {
    setActiveDestination(destination);
  }, [destination]);

  const handleSelectPlace = (latLng: MapCoordinate) => {
    setCenter(latLng);
    setZoom(16);
    setMarkerPosition(latLng);
    setSecondarySelectedPlace(null);
    setClickedLocation(null);
  };

  const handleGPSClickSuccess = (coords: MapCoordinate, address: string) => {
    // Case 1: Save originLocation = current location
    const locationState = {
      lat: coords.lat,
      lng: coords.lng,
      address: address,
      name: 'Current Location',
    };
    setOrigin(locationState);
    setSelectedPlace(locationState);
    setCachedGps(locationState); // Save to cache
    setSecondarySelectedPlace(null);
    setClickedLocation(null);
  };

  const handlePlaceResolved = (place: PlaceDetail, cardType: 'DEFAULT_CLICK_CARD' | 'SEARCH_RESULT_CARD') => {
    if (cardType === 'DEFAULT_CLICK_CARD') {
      // Scenario 1: Default search state (no active search)
      setSelectedPlace({
        lat: place.lat,
        lng: place.lng,
        address: place.address,
        name: place.name,
        category: place.category,
      });
      setMarkerPosition({ lat: place.lat, lng: place.lng });
      // Clear secondary card/marker
      setSecondarySelectedPlace(null);
      setClickedLocation(null);
    } else {
      // Scenario 2/3: Active search/routing state
      setClickedLocation({ lat: place.lat, lng: place.lng });
      setSecondarySelectedPlace(place);
    }
  };

  const handleSelectPlaceSuccess = (place: PlaceSuggestion) => {
    // Case 2: Save selectedPlace
    setSelectedPlace({
      lat: place.location.lat,
      lng: place.location.lng,
      address: place.address || place.name || '',
      name: place.name,
    });
  };

  const handleDirectionClick = () => {
    setRouteMode(true);
    if (panelOpen) {
      setPanelOpen(false);
      return;
    }

    setPanelOpen(true);

    if (origin && destination) {
      return;
    }

    if (selectedPlace && selectedPlace.name !== 'Current Location') {
      // Case 2: Search first -> Automatically Origin = current GPS, Destination = selected place
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          try {
            const address = await SearchService.reverseGeocode(coords.lat, coords.lng);
            const startAddress = address || 'Current Location';
            const locationState = { lat: coords.lat, lng: coords.lng, address: startAddress };
            setOrigin(locationState);
            setDestination(selectedPlace);
            setCachedGps(locationState); // Save to cache
          } catch {
            const locationState = { lat: coords.lat, lng: coords.lng, address: 'Current Location' };
            setOrigin(locationState);
            setDestination(selectedPlace);
            setCachedGps(locationState); // Save to cache
          }
        },
        () => {
          setOrigin(null);
          setDestination(selectedPlace);
          setRouteError('GPS access denied. Set starting point manually.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      // Case 3: No context, or Case 1: GPS first
      if (origin) {
        // Case 1: GPS was clicked first, origin is already populated
        setDestination(null);
      } else {
        // Case 3: Open direction panel and set Origin = current GPS, Destination = empty
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            try {
              const address = await SearchService.reverseGeocode(coords.lat, coords.lng);
              const startAddress = address || 'Current Location';
              const locationState = { lat: coords.lat, lng: coords.lng, address: startAddress };
              setOrigin(locationState);
              setDestination(null);
              setCachedGps(locationState); // Save to cache
            } catch {
              const locationState = { lat: coords.lat, lng: coords.lng, address: 'Current Location' };
              setOrigin(locationState);
              setDestination(null);
              setCachedGps(locationState); // Save to cache
            }
          },
          () => {
            setOrigin(null);
            setDestination(null);
            setRouteError('GPS access denied. Set starting point manually.');
          },
          { enableHighAccuracy: true, timeout: 8000 }
        );
      }
    }
  };

  const handleCloseDirection = () => {
    setPanelOpen(false);
    // Closing Directions does NOT reset destination context or clear routing
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <SearchBar
        currentCenter={center}
        onSelectPlace={handleSelectPlace}
        onGPSClickSuccess={handleGPSClickSuccess}
        onSelectPlaceSuccess={handleSelectPlaceSuccess}
        directionActive={panelOpen}
        onDirectionClick={handleDirectionClick}
        origin={origin}
        setOrigin={setOrigin}
        destination={activeDestination}
        setDestination={setDestination}
        routeData={routeData}
        onCalculateRoute={calculateRoute}
        onClearRoute={clearRouteData}
        routeLoading={routeLoading}
        routeError={routeError}
        onCloseDirection={handleCloseDirection}
        selectedPlace={selectedPlace}
        onCloseInfoCard={() => {
          setSelectedPlace(null);
          setMarkerPosition(null);
          setRouteMode(false);
          setSecondarySelectedPlace(null);
          setClickedLocation(null);
          clearRoute();
        }}
        cachedGps={cachedGps}
        hasClickCard={false}
      />
      <MapContainer
        center={center}
        zoom={zoom}
        markerPosition={routeMode ? null : markerPosition}
        clickMarker={clickedLocation}
        routePath={routeMode && routeData ? routeData.path : null}
        originMarker={routeMode && origin ? { lat: origin.lat, lng: origin.lng } : null}
        destinationMarker={routeMode && activeDestination ? { lat: activeDestination.lat, lng: activeDestination.lng } : null}
        style={{ width: '100%', height: '100%' }}
        onMapReady={setMapInstance}
      />
      {mapInstance && (
        <MapClickHandler
          mapInstance={mapInstance}
          onPlaceResolved={handlePlaceResolved}
          hasContext={routeMode}
        />
      )}
      {secondarySelectedPlace && (
        <PlaceDetailCard
          place={secondarySelectedPlace}
          cardType="SEARCH_RESULT_CARD"
          onClose={() => {
            setSecondarySelectedPlace(null);
            setClickedLocation(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
