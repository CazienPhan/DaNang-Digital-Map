import React, { useState, useEffect } from 'react';
import { SearchService, type PlaceSuggestion } from '@/services/map4d/search.service';
import { type MapCoordinate } from '@/features/map';
import { useDebounce } from '@/hooks/useDebounce';
import { useGeolocation } from '@/hooks/useGeolocation';
import SearchResult from './SearchResult';
import { DirectionPanel, type LocationState } from '@/features/directions';
import { type RouteResult } from '@/services/map4d/routing.service';
import PlaceInfoCard from './PlaceInfoCard';
import { PoiDetailCard } from '@/features/poi';
import { type POIDetailData } from '@/services/supabase/poi.service';

interface SearchBarProps {
  currentCenter?: MapCoordinate;
  onSelectPlace: (latLng: MapCoordinate) => void;
  onGPSClickSuccess?: (coords: MapCoordinate, address: string) => void;
  onSelectPlaceSuccess?: (place: PlaceSuggestion) => void;
  directionActive: boolean;
  onDirectionClick: () => void;
  origin: LocationState | null;
  setOrigin: (loc: LocationState | null) => void;
  destination: LocationState | null;
  setDestination: (loc: LocationState | null) => void;
  routeData: RouteResult | null;
  onCalculateRoute: (start: MapCoordinate, end: MapCoordinate, mode?: string) => void;
  onClearRoute: () => void;
  routeLoading: boolean;
  routeError: string | null;
  onCloseDirection: () => void;
  selectedPlace: LocationState | null;
  onCloseInfoCard: () => void;
  cachedGps?: LocationState | null;
  hasClickCard?: boolean;
  selectedTransportMode: string;
  setSelectedTransportMode: (mode: string) => void;
  matrixData: Record<string, { distance: string; duration: string }> | null;
  matrixLoading: boolean;
  onCalculateMatrix: (start: MapCoordinate, end: MapCoordinate) => void;
  selectedPoiDetails?: POIDetailData | null;
  poiDetailLoading?: boolean;
  poiDetailError?: string | null;
}

type GpsState = 'default' | 'loading' | 'success' | 'error';

export const SearchBar: React.FC<SearchBarProps> = ({
  currentCenter,
  onSelectPlace,
  onGPSClickSuccess,
  onSelectPlaceSuccess,
  directionActive,
  onDirectionClick,
  origin,
  setOrigin,
  destination,
  setDestination,
  routeData,
  onCalculateRoute,
  onClearRoute,
  routeLoading,
  routeError,
  onCloseDirection,
  selectedPlace,
  onCloseInfoCard,
  cachedGps,
  hasClickCard,
  selectedTransportMode,
  setSelectedTransportMode,
  matrixData,
  matrixLoading,
  onCalculateMatrix,
  selectedPoiDetails = null,
  poiDetailLoading = false,
  poiDetailError = null,
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { getPosition } = useGeolocation();
  const [gpsState, setGpsState] = useState<GpsState>('default');

  // Helper to trigger and clear visual feedback toasts
  const showToast = (message: string) => {
    setToastMessage(message);
    const toastTimer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return toastTimer;
  };

  // Reset focus index when suggestions or query changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [suggestions, query]);

  // Trigger search requests with debouncing and query cancellation (AbortController)
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    if (selectedPlace && (selectedPlace.name === debouncedQuery || selectedPlace.address === debouncedQuery)) {
      setSuggestions([]);
      return;
    }

    const abortController = new AbortController();
    const locationBias = currentCenter ? `${currentCenter.lat},${currentCenter.lng}` : undefined;

    SearchService.searchPlaces(debouncedQuery, locationBias, abortController.signal)
      .then((results) => {
        setSuggestions(results);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setSuggestions([]);
          showToast('Failed to fetch autocomplete suggestions.');
        }
      });

    return () => {
      // Cancel previous pending API request as the user continues to keystroke
      abortController.abort();
    };
  }, [debouncedQuery, currentCenter]);

  // Synchronize query text with selectedPlace details
  useEffect(() => {
    if (selectedPlace) {
      setQuery(selectedPlace.name || selectedPlace.address || '');
    } else {
      setQuery('');
    }
  }, [selectedPlace]);

  // Request user positioning coordinates using HTML5 Geolocation hook
  const handleGPSClick = () => {
    setGpsState('loading');
    getPosition(
      async (coords) => {
        try {
          // Resolve coordinates using Map4D Reverse Geocoding API proxy
          const resolvedAddress = await SearchService.reverseGeocode(coords.lat, coords.lng);
          const finalAddress = resolvedAddress || `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
          
          setQuery(finalAddress);

          setGpsState('success');
          // Focus view on location and insert marker
          onSelectPlace(coords);
          setSuggestions([]);

          // Callback to parent GPS success handler
          if (onGPSClickSuccess) {
            onGPSClickSuccess(coords, finalAddress);
          }
        } catch (error) {
          console.error('GPS Reverse Geocoding failed:', error);
          const fallbackAddress = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
          setQuery(fallbackAddress);
          setGpsState('success');
          onSelectPlace(coords);
          if (onGPSClickSuccess) {
            onGPSClickSuccess(coords, fallbackAddress);
          }
          showToast('Failed to resolve coordinates to physical address.');
        } finally {
          // Return GPS icon state back to default after 2 seconds
          setTimeout(() => setGpsState('default'), 2000);
        }
      },
      (errorMsg) => {
        setGpsState('error');
        showToast(errorMsg);
        // Return GPS icon state back to default after 4 seconds
        setTimeout(() => setGpsState('default'), 4000);
      }
    );
  };

  const handleSuggestionSelect = (place: PlaceSuggestion) => {
    onSelectPlace(place.location);
    // Populate the input with the selected suggestion's name
    setQuery(place.name);
    setSuggestions([]);
    
    // Callback to parent Search selection handler
    if (onSelectPlaceSuccess) {
      onSelectPlaceSuccess(place);
    }
  };

  // Keyboard navigation event handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < suggestions.length) {
        handleSuggestionSelect(suggestions[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSuggestions([]);
      setFocusedIndex(-1);
    }
  };

  if (directionActive) {
    return (
      <div className="search-container">
        <DirectionPanel
          currentCenter={currentCenter}
          origin={origin}
          setOrigin={setOrigin}
          destination={destination}
          setDestination={setDestination}
          routeData={routeData}
          onCalculateRoute={onCalculateRoute}
          onClear={onClearRoute}
          loading={routeLoading}
          error={routeError}
          onClose={onCloseDirection}
          cachedGps={cachedGps}
          selectedTransportMode={selectedTransportMode}
          setSelectedTransportMode={setSelectedTransportMode}
          matrixData={matrixData}
          matrixLoading={matrixLoading}
          onCalculateMatrix={onCalculateMatrix}
        />
        {/* Inline lightweight toast warnings */}
        {toastMessage && (
          <div className="toast-notification">
            {toastMessage}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className="search-input-wrapper">
        {/* Search status/indicator icon */}
        <div className="search-icon">
          <svg viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
        </div>

        {/* Search Input field */}
        <input
          type="text"
          className="search-input"
          placeholder="Search Da Nang places..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            if (val === '') {
              onCloseInfoCard();
            }
          }}
          onKeyDown={handleKeyDown}
        />

        {/* Clear Search button (X) */}
        {query && (
          <button
            type="button"
            className="clear-search-button"
            onClick={() => {
              setQuery('');
              onCloseInfoCard();
            }}
            title="Clear search"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        )}

        {/* GPS location fetch trigger with multi-state support */}
        <button
          type="button"
          className={`gps-button state-${gpsState}`}
          onClick={handleGPSClick}
          title="Center to current GPS location"
          disabled={gpsState === 'loading'}
        >
          {gpsState === 'loading' ? (
            <svg className="spin-animation" viewBox="0 0 24 24">
              <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16c4.41 0 8-3.59 8-8h2c0 5.52-4.48 10-10 10v-2z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
            </svg>
          )}
        </button>
      </div>

      {/* Autocomplete suggestion dropdown results list overlay */}
      {suggestions.length > 0 && (
        <SearchResult
          suggestions={suggestions}
          onSelectSuggestion={handleSuggestionSelect}
          focusedIndex={focusedIndex}
        />
      )}

      {/* Primary Card View (Loader, POI Card, or standard click card) */}
      {!directionActive && (selectedPoiDetails || poiDetailLoading || poiDetailError) && (
        <PoiDetailCard
          poi={selectedPoiDetails}
          loading={poiDetailLoading}
          error={poiDetailError}
          isSecondary={false}
          onClose={onCloseInfoCard}
          onGetDirections={onDirectionClick}
        />
      )}

      {!poiDetailLoading && !selectedPoiDetails && !poiDetailError && selectedPlace && !directionActive && !hasClickCard && (
        <PlaceInfoCard
          place={selectedPlace}
          onGetDirections={onDirectionClick}
        />
      )}

      {/* Inline lightweight toast warnings */}
      {toastMessage && (
        <div className="toast-notification">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
export default SearchBar;
