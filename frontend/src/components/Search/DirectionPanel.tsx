import React, { useState, useEffect } from 'react';
import { SearchService, type PlaceSuggestion } from '../../services/map4d/search.service';
import { type LocationState } from '../../hooks/useDirection';
import { type RouteResult } from '../../services/map4d/routing.service';
import { useDebounce } from '../../hooks/useDebounce';

interface DirectionPanelProps {
  currentCenter?: { lat: number; lng: number };
  origin: LocationState | null;
  setOrigin: (loc: LocationState | null) => void;
  destination: LocationState | null;
  setDestination: (loc: LocationState | null) => void;
  routeData: RouteResult | null;
  onCalculateRoute: (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => void;
  onClear: () => void;
  loading: boolean;
  error: string | null;
  onClose: () => void;
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
}) => {
  const [originText, setOriginText] = useState('');
  const [destText, setDestText] = useState('');

  const debouncedOrigin = useDebounce(originText, 300);
  const debouncedDest = useDebounce(destText, 300);

  const [originSuggestions, setOriginSuggestions] = useState<PlaceSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<PlaceSuggestion[]>([]);

  const [activeInput, setActiveInput] = useState<'origin' | 'dest' | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);

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

  // Calculate route automatically when both coordinates are active
  useEffect(() => {
    if (origin && destination) {
      onCalculateRoute(
        { lat: origin.lat, lng: origin.lng },
        { lat: destination.lat, lng: destination.lng }
      );
    } else {
      onClear();
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
    if (originSuggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev < originSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev) => (prev > 0 ? prev - 1 : originSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (focusedIndex >= 0 && focusedIndex < originSuggestions.length) {
        handleSelectOrigin(originSuggestions[focusedIndex]);
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
    <div className="direction-panel">
      <div className="direction-panel-header">
        <h3>Directions Navigation</h3>
        <button className="close-panel-btn" onClick={onClose} title="Close Directions">
          <svg viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>
      </div>

      <div className="direction-inputs-container">
        {/* Swap Button on the left */}
        <button className="swap-btn" onClick={handleSwap} title="Swap start and destination">
          <svg viewBox="0 0 24 24">
            <path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3zM9 3L5 6.99h3V14h2V6.99h3L9 3z" />
          </svg>
        </button>

        <div className="inputs-wrapper">
          {/* Origin Search */}
          <div className="input-group">
            <span className="dot origin-dot"></span>
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
            {originSuggestions.length > 0 && activeInput === 'origin' && (
              <div className="direction-autocomplete-list">
                {originSuggestions.map((item, index) => (
                  <div
                    key={item.id}
                    className={`direction-autocomplete-item${focusedIndex === index ? ' focused' : ''}`}
                    onMouseDown={() => handleSelectOrigin(item)}
                  >
                    <span className="name">{item.name}</span>
                    <span className="addr">{item.address}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Destination Search */}
          <div className="input-group">
            <span className="dot dest-dot"></span>
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

      {routeData && !loading && !error && (
        <div className="route-info-card">
          <div className="route-metric">
            <svg viewBox="0 0 24 24" className="icon">
              <path d="M12.5 18.5c-1.9 0-3.4-1.5-3.4-3.4 0-1.2.6-2.2 1.5-2.8l-1.4-1.4c-1.3.9-2.1 2.4-2.1 4.2 0 2.8 2.2 5 5 5 1.8 0 3.3-.8 4.2-2.1l-1.4-1.4c-.6.9-1.6 1.5-2.8 1.5zM16 11.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1m-3.5-3c-2.8 0-5 2.2-5 5H5l3.5 3.5L12 13.5H9.5c0-1.9 1.5-3.4 3.4-3.4 1.2 0 2.2.6 2.8 1.5l1.4-1.4C15.8 9.3 14.3 8.5 12.5 8.5z" />
            </svg>
            <div className="metric-details">
              <span className="value">{routeData.distance}</span>
              <span className="label">Distance</span>
            </div>
          </div>
          <div className="route-metric">
            <svg viewBox="0 0 24 24" className="icon">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <div className="metric-details">
              <span className="value">{routeData.duration}</span>
              <span className="label">Duration</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectionPanel;
