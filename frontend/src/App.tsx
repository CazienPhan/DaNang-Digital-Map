import { useState } from 'react';
import MapContainer, { type MapCoordinate } from './components/Map/MapContainer';
import SearchBar from './components/Search/SearchBar';
import { useDirection, type LocationState } from './hooks/useDirection';
import { SearchService, type PlaceSuggestion } from './services/map4d/search.service';
import './App.css';

function App() {
  const [center, setCenter] = useState<MapCoordinate>({ lat: 16.0544, lng: 108.2022 });
  const [zoom, setZoom] = useState<number>(13);
  const [markerPosition, setMarkerPosition] = useState<MapCoordinate | null>(null);
  
  // Track selected place in search mode (for Case 2: Search First)
  const [selectedPlace, setSelectedPlace] = useState<LocationState | null>(null);

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

  const handleSelectPlace = (latLng: MapCoordinate) => {
    setCenter(latLng);
    setZoom(16);
    setMarkerPosition(latLng);
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
    if (panelOpen) {
      setPanelOpen(false);
      clearRoute();
      setSelectedPlace(null);
      return;
    }

    if (selectedPlace && selectedPlace.name !== 'Current Location') {
      // Case 2: Search first -> Automatically Origin = current GPS, Destination = selected place
      setPanelOpen(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          try {
            const address = await SearchService.reverseGeocode(coords.lat, coords.lng);
            const startAddress = address || 'Current Location';
            setOrigin({ lat: coords.lat, lng: coords.lng, address: startAddress });
            setDestination(selectedPlace);
          } catch {
            setOrigin({ lat: coords.lat, lng: coords.lng, address: 'Current Location' });
            setDestination(selectedPlace);
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
        setPanelOpen(true);
      } else {
        // Case 3: Open direction panel and set Origin = current GPS, Destination = empty
        setPanelOpen(true);
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const coords = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
            try {
              const address = await SearchService.reverseGeocode(coords.lat, coords.lng);
              const startAddress = address || 'Current Location';
              setOrigin({ lat: coords.lat, lng: coords.lng, address: startAddress });
              setDestination(null);
            } catch {
              setOrigin({ lat: coords.lat, lng: coords.lng, address: 'Current Location' });
              setDestination(null);
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
    clearRoute();
    setSelectedPlace(null);
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
        destination={destination}
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
        }}
      />
      <MapContainer
        center={center}
        zoom={zoom}
        markerPosition={panelOpen ? null : markerPosition}
        routePath={panelOpen && routeData ? routeData.path : null}
        originMarker={panelOpen && origin ? { lat: origin.lat, lng: origin.lng } : null}
        destinationMarker={panelOpen && destination ? { lat: destination.lat, lng: destination.lng } : null}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}

export default App;
