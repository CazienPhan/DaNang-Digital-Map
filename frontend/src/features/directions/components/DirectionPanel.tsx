import React, { useState, useEffect } from 'react';
import { SearchService, type PlaceSuggestion } from '@/services/map4d/search.service';
import { type LocationState } from '@/features/directions/hooks/useDirection';
import { type RouteResult } from '@/services/map4d/routing.service';
import { useDebounce } from '@/hooks/useDebounce';

interface DirectionPanelProps {
  currentCenter?: { lat: number; lng: number };
  origin: LocationState | null;
  setOrigin: (loc: LocationState | null) => void;
  destination: LocationState | null;
  setDestination: (loc: LocationState | null) => void;
  routeData: RouteResult | null;
  onCalculateRoute: (start: { lat: number; lng: number }, end: { lat: number; lng: number }, mode?: string) => void;
  onClear: () => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  cachedGps?: LocationState | null;
  selectedTransportMode: string;
  setSelectedTransportMode: (mode: string) => void;
  matrixData: Record<string, { distance: string; duration: string }> | null;
  matrixLoading: boolean;
  onCalculateMatrix: (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => void;
}

export const DirectionPanel: React.FC<DirectionPanelProps> = ({
  currentCenter,
  origin,
  setOrigin,
  destination,
  setDestination,
  routeData,
  onCalculateRoute,
  onClear,
  loading,
  error,
  onClose,
  cachedGps,
  selectedTransportMode,
  setSelectedTransportMode,
  onCalculateMatrix,
}) => {
  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');

  const debouncedOrigin = useDebounce(originText, 300);
  const debouncedDest = useDebounce(destText, 300);

  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);

  const [activeInput, setActiveInput] = useState<'origin' | 'dest' | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

  const transportModes = [
    {
      id: 'car',
      label: 'Car',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      )
    },
    {
      id: 'motorcycle',
      label: 'Motorbike',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <circle cx="5" cy="18" r="3" />
          <circle cx="19" cy="18" r="3" />
          <path d="M19 15c0-2.21-1.79-4-4-4h-1.5l-2.5-3.5h-4l-1.5 2H3v2h2l1.5-2H8l2.5 3.5H15c1.1 0 2 .9 2 2s-.9 2-2 2h-2v2h2c2.21 0 4-1.79 4-4z"/>
        </svg>
      )
    },
    {
      id: 'bike',
      label: 'Bicycle',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <circle cx="5.5" cy="15.5" r="3" />
          <circle cx="18.5" cy="15.5" r="3" />
          <path d="M10.8 12.2l.9-1.1c.39-.39.39-1.02 0-1.41L10 8.3c-.39-.39-1.02-.39-1.41 0l-.9 1.1c-.39.39-.39 1.02 0 1.41l1.7 1.7.9-1.1c.39-.39 1.02-.39 1.41 0zM15.5 12h-4.3L8.5 7h4v2h2.5l-1.2-2.4H10v1.5H8.2L5.4 12.5H8v1.5h2.8z" />
        </svg>
      )
    },
    {
      id: 'foot',
      label: 'Walking',
      icon: (
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 17.6l-1.4-.5c-.4-.1-.7.2-.6.6l.8 2.5c.1.3.4.5.7.5H11v-2h2.2l2.4-7.5c.3-.9-.4-1.8-1.4-1.8H9.8z"/>
        </svg>
      )
    }
  ];

  const handleSelectCurrentLocation = () => {
    if (cachedGps) {
      setOrigin({
        lat: cachedGps.lat,
        lng: cachedGps.lng,
        address: cachedGps.address,
        name: 'Current Location',
      });
      setOriginText(cachedGps.address);
      setOriginSuggestions([]);
    }
  };

  // Reset focus index when suggestions or active input changes
  useEffect(() => {
    setFocusedIndex(-1);
  }, [originSuggestions, destSuggestions, activeInput]);

  // Sync inputs with state values (such as GPS reverse-geocodes or search-first values)
  useEffect(() => {
    if (origin) {
      setOriginText(origin.address);
    } else {
      setOriginText('');
    }
  }, [origin]);

  useEffect(() => {
    if (destination) {
      setDestText(destination.address);
    } else {
      setDestText('');
    }
  }, [destination]);

  // Query origin suggestions
  useEffect(() => {
    if (activeInput !== 'origin' || debouncedOrigin.trim().length < 1 || (origin && origin.address === debouncedOrigin)) {
      setOriginSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const locationBias = currentCenter ? `${currentCenter.lat},${currentCenter.lng}` : undefined;
    SearchService.searchPlaces(debouncedOrigin, locationBias, controller.signal)
      .then(setOriginSuggestions)
      .catch(() => setOriginSuggestions([]));
    return () => controller.abort();
  }, [debouncedOrigin, activeInput, origin, currentCenter]);

  // Query destination suggestions
  useEffect(() => {
    if (activeInput !== 'dest' || debouncedDest.trim().length < 1 || (destination && destination.address === debouncedDest)) {
      setDestSuggestions([]);
      return;
    }
    const controller = new AbortController();
    const locationBias = currentCenter ? `${currentCenter.lat},${currentCenter.lng}` : undefined;
    SearchService.searchPlaces(debouncedDest, locationBias, controller.signal)
      .then(setDestSuggestions)
      .catch(() => setDestSuggestions([]));
    return () => controller.abort();
  }, [debouncedDest, activeInput, destination, currentCenter]);

  // Calculate detailed route when coordinates or selected mode changes
  useEffect(() => {
    if (origin && destination) {
      onCalculateRoute(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng },
        selectedTransportMode
      );
    } else {
      onClear();
    }
  }, [origin, destination, selectedTransportMode]);

  // Calculate matrix values only when origin or destination changes
  useEffect(() => {
    if (origin && destination && onCalculateMatrix) {
      onCalculateMatrix(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng }
      );
    }
  }, [origin, destination]);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleSelectOrigin = (suggestion: PlaceSuggestion) => {
    setOrigin({
      lat: suggestion.location.lat,
      lng: suggestion.location.lng,
      address: suggestion.name,
    });
    setOriginSuggestions([]);
  };

  const handleSelectDest = (suggestion: PlaceSuggestion) => {
    setDestination({
      lat: suggestion.location.lat,
      lng: suggestion.location.lng,
      address: suggestion.name,
    });
    setDestSuggestions([]);
  };

  const handleOriginKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalItems = originSuggestions.length + (cachedGps ? 1 : 0);
    if (totalItems === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < totalItems) {
        if (cachedGps) {
          if (focusedIndex === 0) {
            handleSelectCurrentLocation();
          } else {
            handleSelectOrigin(originSuggestions[focusedIndex - 1]);
          }
        } else {
          handleSelectOrigin(originSuggestions[focusedIndex]);
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOriginSuggestions([]);
      setFocusedIndex(-1);
    }
  };

  const handleDestKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (destSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < destSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : destSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < destSuggestions.length) {
        handleSelectDest(destSuggestions[focusedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setDestSuggestions([]);
      setFocusedIndex(-1);
    }
  };

  return (
    <>
      <div className="direction-panel">
        <div className="direction-panel-header">
          <h3>Directions Navigation</h3>
          <button className="close-panel-btn" onClick={onClose} title="Close Directions">
            <svg viewBox="0 0 24 24">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Transport Mode Selection Tabs */}
        <div className="transport-tabs">
          {transportModes.map((modeInfo) => {
            const isActive = selectedTransportMode === modeInfo.id;

            return (
              <button
                key={modeInfo.id}
                type="button"
                className={`transport-tab-btn${isActive ? ' active' : ''}`}
                onClick={() => setSelectedTransportMode(modeInfo.id)}
                title={modeInfo.label}
              >
                <div className="tab-icon">{modeInfo.icon}</div>
                <span className="tab-label">{modeInfo.label}</span>
              </button>
            );
          })}
        </div>

        <div className="direction-inputs-container">
          {/* Google Maps style Origin/Destination left indicators */}
          <div className="route-indicator">
            <span className="indicator-dot origin-indicator-dot"></span>
            <span className="indicator-line"></span>
            <span className="indicator-dot dest-indicator-dot"></span>
          </div>

          <div className="inputs-wrapper">
            {/* Origin Search */}
            <div className="input-group">
              <input
                type="text"
                className="direction-input"
                placeholder="Choose starting point..."
                value={originText}
                onChange={(e) => {
                  setOriginText(e.target.value);
                  if (origin && origin.address !== e.target.value) {
                    setOrigin(null); // Clear selected coords if edited
                  }
                }}
                onKeyDown={handleOriginKeyDown}
                onFocus={() => setActiveInput('origin')}
                onBlur={() => setTimeout(() => setActiveInput(null), 250)}
              />
              {activeInput === 'origin' && (cachedGps || originSuggestions.length > 0) && (
                <div className="direction-autocomplete-list">
                  {cachedGps && (
                    <div
                      className={`direction-autocomplete-item${focusedIndex === 0 ? ' focused' : ''}`}
                      onMouseDown={handleSelectCurrentLocation}
                    >
                      <span className="name" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ color: '#10b981' }}>📍</span> Current Location
                      </span>
                      <span className="addr">{cachedGps.address}</span>
                    </div>
                  )}
                  {originSuggestions.map((item, index) => {
                    const actualIndex = cachedGps ? index + 1 : index;
                    return (
                      <div
                        key={item.id}
                        className={`direction-autocomplete-item${focusedIndex === actualIndex ? ' focused' : ''}`}
                        onMouseDown={() => handleSelectOrigin(item)}
                      >
                        <span className="name">{item.name}</span>
                        <span className="addr">{item.address}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Destination Search */}
            <div className="input-group">
              <input
                type="text"
                className="direction-input"
                placeholder="Choose destination..."
                value={destText}
                onChange={(e) => {
                  setDestText(e.target.value);
                  if (destination && destination.address !== e.target.value) {
                    setDestination(null); // Clear selected coords if edited
                  }
                }}
                onKeyDown={handleDestKeyDown}
                onFocus={() => setActiveInput('dest')}
                onBlur={() => setTimeout(() => setActiveInput(null), 250)}
              />
              {destSuggestions.length > 0 && activeInput === 'dest' && (
                <div className="direction-autocomplete-list">
                  {destSuggestions.map((item, index) => (
                    <div
                      key={item.id}
                      className={`direction-autocomplete-item${focusedIndex === index ? ' focused' : ''}`}
                      onMouseDown={() => handleSelectDest(item)}
                    >
                      <span className="name">{item.name}</span>
                      <span className="addr">{item.address}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Swap Button on the right */}
          <button className="swap-btn" onClick={handleSwap} title="Swap start and destination">
            <svg viewBox="0 0 24 24">
              <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
            </svg>
          </button>
        </div>

        {/* Info panel results */}
        {loading && (
          <div className="direction-status loading">
            <svg className="spin-animation" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: '#3b82f6', marginRight: '8px' }}>
              <path d="M12 4V2C6.48 2 2 6.48 2 12h2c0-4.41 3.59-8 8-8zm0 16c4.41 0 8-3.59 8-8h2c0 5.52-4.48 10-10 10v-2z" />
            </svg>
            <span>Finding route...</span>
          </div>
        )}

        {error && (
          <div className="direction-status error">
            <span>{error}</span>
          </div>
        )}
      </div>

      {routeData && !loading && !error && (
        <div className="route-summary-card">
          <div className="route-metric">
            <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="6" cy="19" r="3" />
              <circle cx="18" cy="5" r="3" />
              <path d="M9 19h6.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H15" />
            </svg>
            <div className="metric-details">
              <span className="value">{routeData.distance}</span>
              <span className="label">Distance</span>
            </div>
          </div>
          <div className="route-metric">
            <svg viewBox="0 0 24 24" className="icon" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <div className="metric-details">
              <span className="value">{routeData.duration}</span>
              <span className="label">Duration</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectionPanel;
