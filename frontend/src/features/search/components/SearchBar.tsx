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
import { Button, Input, Alert, AlertDescription } from "@/components/ui";
import { Search, X, LocateFixed, Loader2, } from "lucide-react";

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


  if (directionActive) {
    return (
      <div
        className="
        absolute
        top-5
        left-5
        z-50
        w-[420px]
        max-w-[90vw]
        "
      >
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
          <Alert
            className="
          mt-3
          "
          >
            <AlertDescription>
              {toastMessage}
            </AlertDescription>

          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="search-container">
      <div className=" relative w-[420px] max-w-[90vw]"
      >
        {/* Search status/indicator icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Search size={18} />
        </div>
        {/* Search Input field */}
        <Input
          type="text"
          className="pl-10 pr-20"
          placeholder="Bạn muốn đến đâu"
          value={query}

          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);

            if (val === "") {
              onCloseInfoCard();
            }
          }}

        />
        {/* Clear Search button (X) */}
        {query && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-12 top-1/2 -translate-y-1/2"
            onClick={() => {
              setQuery("");
              onCloseInfoCard();
            }}
          >
            <X size={18} />
          </Button>
        )}

        {/* GPS location fetch trigger with multi-state support */}
        <Button
          size="icon"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={handleGPSClick}
          disabled={gpsState === "loading"}
        >
          {
            gpsState === "loading"
              ?
              <Loader2 className="animate-spin" />
              :
              <LocateFixed
                className="
 h-5
 w-5
 "
              />
          }
        </Button>
      </div>

      {/* Autocomplete suggestion dropdown results list overlay */}
      {suggestions.length > 0 && (
        <SearchResult
          suggestions={suggestions}
          onSelectSuggestion={handleSuggestionSelect}
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
