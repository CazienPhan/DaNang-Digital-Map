import { useState, useEffect } from 'react';
import MapContainer, { type MapCoordinate } from './components/Map/MapContainer';
import SearchBar from './components/Search/SearchBar';
import { useDirection, type LocationState } from './hooks/useDirection';
import { SearchService, type PlaceSuggestion } from './services/map4d/search.service';
import PlaceDetailCard from './components/Search/PlaceDetailCard';
import { type PlaceDetail } from './services/placeDetail.service';
import MapClickHandler from './components/Map/MapClickHandler';
import PoiClientService, { type POIData, type POIDetailData } from './services/poi.service';
import PoiDetailCard from './components/Search/PoiDetailCard';
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

  // Database POI states
  const [pois, setPois] = useState<POIData[] | null>(null);
  const [poiError, setPoiError] = useState<{ message: string; cause: string; solution: string } | null>(null);
  const [selectedPoiDetails, setSelectedPoiDetails] = useState<POIDetailData | null>(null);
  const [poiDetailLoading, setPoiDetailLoading] = useState<boolean>(false);
  const [poiDetailError, setPoiDetailError] = useState<string | null>(null);

  // Backup state to restore on directions close
  const [backupState, setBackupState] = useState<{
    selectedPlace: LocationState | null;
    selectedPoiDetails: POIDetailData | null;
    markerPosition: MapCoordinate | null;
  } | null>(null);

  // Secondary POI card states (used during active route mode)
  const [secondaryPoiDetails, setSecondaryPoiDetails] = useState<POIDetailData | null>(null);
  const [secondaryPoiLoading, setSecondaryPoiLoading] = useState<boolean>(false);

  // Cache resolved GPS location coordinates and geocoded physical address
  const [cachedGps, setCachedGps] = useState<LocationState | null>(null);

  const [mapInstance, setMapInstance] = useState<any>(null);

  // Fetch real POIs from database on load
  useEffect(() => {
    PoiClientService.getPOIs()
      .then((data) => {
        setPois(data);
        setPoiError(null);
      })
      .catch((err) => {
        setPoiError({
          message: 'Failed to load POI database records',
          cause: err.message || 'Database connection offline or table missing.',
          solution: 'Verify Supabase connection, check if table "poi.pois" is online, and inspect backend logs.',
        });
      });
  }, []);

  const handlePoiClick = (poi: POIData) => {
    // 1. If routeMode is active: DO NOT change active route/destination or update search inputs
    if (routeMode) {
      setCenter({ lat: poi.lat, lng: poi.lng });
      setClickedLocation(null); // Prevent raw click marker overlay
      setSecondarySelectedPlace(null); // Dismiss standard secondary card
      
      setSecondaryPoiLoading(true);
      setSecondaryPoiDetails(null);

      PoiClientService.getPOIDetails(poi.id)
        .then((details) => {
          setSecondaryPoiDetails(details);
          setSecondaryPoiLoading(false);
        })
        .catch((err) => {
          console.error('Failed to fetch detailed POI during route:', err);
          setSecondaryPoiLoading(false);
          // Fallback to simple secondary card
          setSecondarySelectedPlace({
            name: poi.name,
            address: poi.dia_chi || `${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`,
            lat: poi.lat,
            lng: poi.lng,
            category: poi.poi_type,
          });
        });
      return;
    }

    // 2. Default Flow: Update search input with POI name, zoom and show as primary card
    setSelectedPlace({
      lat: poi.lat,
      lng: poi.lng,
      name: poi.name,
      address: poi.dia_chi || `${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`,
      category: poi.poi_type,
    });
    setCenter({ lat: poi.lat, lng: poi.lng });
    setZoom(16);
    setClickedLocation(null);
    setSecondarySelectedPlace(null);

    setPoiDetailLoading(true);
    setPoiDetailError(null);
    setSelectedPoiDetails(null);

    PoiClientService.getPOIDetails(poi.id)
      .then((details) => {
        setSelectedPoiDetails(details);
        setPoiDetailLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch detailed POI from Supabase:', err);
        setPoiDetailError(err.message || 'POI information is temporarily unavailable.');
        setPoiDetailLoading(false);
        // Fallback: render basic card
        setSecondarySelectedPlace({
          name: poi.name,
          address: poi.dia_chi || `${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`,
          lat: poi.lat,
          lng: poi.lng,
          category: poi.poi_type,
        });
      });
  };

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
    selectedTransportMode,
    setSelectedTransportMode,
    matrixData,
    matrixLoading,
    calculateMatrix,
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

  const enterRouteMode = (newDestination: LocationState | null) => {
    // Back up current primary state before route entry
    setBackupState({
      selectedPlace,
      selectedPoiDetails,
      markerPosition,
    });

    setRouteMode(true);
    setPanelOpen(true);
    if (newDestination) {
      setDestination(newDestination);
    }
  };

  const handlePoiGetDirections = (poi: POIDetailData | POIData) => {
    const destState: LocationState = {
      lat: poi.lat,
      lng: poi.lng,
      name: poi.name,
      address: (poi as any).dia_chi || `${poi.lat.toFixed(6)}, ${poi.lng.toFixed(6)}`,
    };

    // Clear detail cards and markers
    setSelectedPoiDetails(null);
    setSecondaryPoiDetails(null);
    setSecondarySelectedPlace(null);
    setClickedLocation(null);

    enterRouteMode(destState);

    // Set origin to GPS location
    if (cachedGps) {
      setOrigin(cachedGps);
    } else {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          try {
            const address = await SearchService.reverseGeocode(coords.lat, coords.lng);
            const startAddress = address || 'Current Location';
            const startState = { lat: coords.lat, lng: coords.lng, address: startAddress, name: 'Current Location' };
            setOrigin(startState);
            setCachedGps(startState);
          } catch {
            const startState = { lat: coords.lat, lng: coords.lng, address: 'Current Location', name: 'Current Location' };
            setOrigin(startState);
            setCachedGps(startState);
          }
        },
        (error) => {
          console.error('GPS access denied for POI route calculation:', error);
          setRouteError('GPS access denied. Set starting point manually.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  const handleDirectionClick = () => {
    if (panelOpen) {
      handleCloseDirection();
      return;
    }

    enterRouteMode(null);

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
    setRouteMode(false);
    setPanelOpen(false);
    clearRoute();
    clearRouteData();

    // Restore previous Search, Card, and Location state
    if (backupState) {
      setSelectedPlace(backupState.selectedPlace);
      setSelectedPoiDetails(backupState.selectedPoiDetails);
      setMarkerPosition(backupState.markerPosition);
      setBackupState(null);
    } else {
      setSelectedPlace(null);
      setSelectedPoiDetails(null);
      setMarkerPosition(null);
    }
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
          setSelectedPoiDetails(null);
          setPoiDetailError(null);
          setBackupState(null);
          clearRoute();
        }}
        cachedGps={cachedGps}
        hasClickCard={false}
        selectedTransportMode={selectedTransportMode}
        setSelectedTransportMode={setSelectedTransportMode}
        matrixData={matrixData}
        matrixLoading={matrixLoading}
        onCalculateMatrix={calculateMatrix}
        selectedPoiDetails={selectedPoiDetails}
        poiDetailLoading={poiDetailLoading}
        poiDetailError={poiDetailError}
      />
      <MapContainer
        center={center}
        zoom={zoom}
        markerPosition={routeMode ? null : markerPosition}
        clickMarker={clickedLocation}
        routePath={routeMode && routeData ? routeData.path : null}
        originMarker={routeMode && origin ? { lat: origin.lat, lng: origin.lng } : null}
        destinationMarker={routeMode && activeDestination ? { lat: activeDestination.lat, lng: activeDestination.lng } : null}
        pois={pois}
        onPoiClick={handlePoiClick}
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
          onGetDirections={() => {
            const locationState = {
              lat: secondarySelectedPlace.lat,
              lng: secondarySelectedPlace.lng,
              address: secondarySelectedPlace.address,
              name: secondarySelectedPlace.name,
            };
            setSecondarySelectedPlace(null);
            setClickedLocation(null);
            enterRouteMode(locationState);
          }}
        />
      )}

      {secondaryPoiLoading && (
        <div className="place-detail-click-card secondary-card poi-loading-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
            <svg className="spin-animation" viewBox="0 0 24 24" style={{ width: '28px', height: '28px', fill: '#3b82f6' }}>
              <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16c4.41 0 8-3.59 8-8h2c0 5.52-4.48 10-10 10v-2z" />
            </svg>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Connecting to Supabase...</span>
          </div>
        </div>
      )}

      {secondaryPoiDetails && (
        <PoiDetailCard
          poi={secondaryPoiDetails}
          isSecondary={true}
          onClose={() => {
            setSecondaryPoiDetails(null);
          }}
          onGetDirections={() => handlePoiGetDirections(secondaryPoiDetails)}
        />
      )}
      {poiError && (
        <div className="database-error-banner" style={{
          position: 'absolute',
          top: '70px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: 'rgba(254, 242, 242, 0.95)',
          border: '1px solid #ef4444',
          borderRadius: '8px',
          padding: '12px 16px',
          maxWidth: '400px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          backdropFilter: 'blur(4px)',
          fontFamily: 'inherit'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px' }}>⚠️ Database Error</span>
            <button onClick={() => setPoiError(null)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#ef4444', marginLeft: 'auto', fontSize: '18px', lineHeight: '1' }}>&times;</button>
          </div>
          <div style={{ fontSize: '13px', color: '#1f2937', marginTop: '6px' }}><strong>Error:</strong> {poiError.message}</div>
          <div style={{ fontSize: '12px', color: '#4b5563', marginTop: '4px' }}><strong>Cause:</strong> {poiError.cause}</div>
          <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}><strong>Solution:</strong> {poiError.solution}</div>
        </div>
      )}
    </div>
  );
}

export default App;
