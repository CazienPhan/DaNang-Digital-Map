import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type MapCoordinate } from '@/features/map';
import { useDebounce } from '@/hooks/useDebounce';
import SearchResult from './SearchResult';
import { SearchListing } from './SearchListing';
import { DirectionPanel, type LocationState } from '@/features/directions';
import { type RouteResult } from '@/services/map4d/routing.service';
import { PoiDetailCard } from '@/features/poi';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { Button, Input } from '@/components/ui';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Search, X, Navigation } from 'lucide-react';
import SearchModeSwitcher from './SearchModeSwitcher';
import type { SearchMode } from '../types/SearchMode';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import { SearchEngineAdapter } from '../services/SearchEngineAdapter';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface SearchBarProps {
  currentCenter?: MapCoordinate;
  onSelectPlace: (latLng: MapCoordinate) => void;
  onGPSClickSuccess?: (coords: MapCoordinate, address: string) => void;
  /**
   * Called when the user selects an autocomplete suggestion or a listing item.
   * Receives the frozen SearchSuggestion DTO — never a provider-specific type.
   */
  onSelectPlaceSuccess?: (suggestion: SearchSuggestion) => void;
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
  /**
   * Increment this value from App.tsx each time a map POI is clicked.
   * SearchBar reacts by switching to 'detail' view.
   */
  externalPoiSelectSignal?: number;
}

// ---------------------------------------------------------------------------
// View state — controls which panel the sidebar renders.
// 'refining' = user is typing while a previous listing is still visible.
// ---------------------------------------------------------------------------
type SearchView = 'idle' | 'autocomplete' | 'listing' | 'refining' | 'detail';

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SearchBar: React.FC<SearchBarProps> = ({
  currentCenter,
  onSelectPlace,
  onGPSClickSuccess: _onGPSClickSuccess,
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
  externalPoiSelectSignal = 0,
}) => {
  // ---- Query ----
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ---- Search mode ----
  const [searchMode, setSearchMode] = useState<SearchMode>('place');

  // ---- View state ----
  const [searchView, setSearchView] = useState<SearchView>('idle');
  const searchViewRef = useRef<SearchView>(searchView);
  useEffect(() => { searchViewRef.current = searchView; }, [searchView]);

  // ---- Listing state ----
  const [listingResults, setListingResults] = useState<SearchSuggestion[]>([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingQuery, setListingQuery] = useState('');

  // ---- AbortController ref ----
  const autocompleteAbortRef = useRef<AbortController | null>(null);

  // ---- Adapter — stable per mode; locationBias is passed per-call ----
  // The adapter is only recreated when searchMode changes. locationBias is
  // forwarded directly to each call, so the map center can change freely
  // without triggering a new adapter instance.
  const adapter = useMemo(
    () => new SearchEngineAdapter(searchMode),
    [searchMode],
  );

  // ---- locationBias — derived from currentCenter ----
  const locationBias = currentCenter
    ? `${currentCenter.lat},${currentCenter.lng}`
    : undefined;

  // ---- Toast helper ----
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // ---- Autocomplete effect ----
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      if (searchViewRef.current === 'autocomplete') setSearchView('idle');
      else if (searchViewRef.current === 'refining') setSearchView('listing');
      return;
    }

    if (
      selectedPlace &&
      (selectedPlace.name === debouncedQuery || selectedPlace.address === debouncedQuery)
    ) {
      setSuggestions([]);
      return;
    }

    const currentView = searchViewRef.current;
    if (currentView !== 'listing' && currentView !== 'refining' && currentView !== 'detail') {
      setSearchView('autocomplete');
    }

    const abortController = new AbortController();
    autocompleteAbortRef.current = abortController;

    adapter
      .autocomplete(debouncedQuery, locationBias, abortController.signal)
      .then((results) => setSuggestions(results))
      .catch((err: unknown) => {
        if (err instanceof Error && err.name !== 'AbortError') {
          setSuggestions([]);
          showToast('Failed to fetch autocomplete suggestions.');
        }
      });

    return () => {
      abortController.abort();
      autocompleteAbortRef.current = null;
    };
  }, [debouncedQuery, adapter, locationBias, selectedPlace]);

  // ---- Sync query with selectedPlace ----
  useEffect(() => {
    if (selectedPlace) {
      setQuery(selectedPlace.name || selectedPlace.address || '');
    } else if (searchView === 'idle') {
      setQuery('');
    }
  }, [selectedPlace]);

  // ---- Map POI click → detail view (Workflow C) ----
  useEffect(() => {
    if (!externalPoiSelectSignal) return;
    setSearchView('detail');
  }, [externalPoiSelectSignal]);

  // ---- Mode switch → clear stale results, preserve query text ----
  useEffect(() => {
    setSuggestions([]);
    setListingResults([]);
    setListingQuery('');
    if (searchView === 'listing' || searchView === 'refining') {
      setSearchView('idle');
    }
  }, [searchMode]);

  // ---- Suggestion selected ----
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSuggestions([]);

    if (suggestion.type === 'product') {
      // Phase 7.5.5 — Product Detail is built in Phase 8.
      // For now, acknowledge the selection and stay in current view.
      console.log('[SearchBar] Product selected:', suggestion);
      setQuery(suggestion.title);
      return;
    }

    // Place suggestion: move the map and open POI detail.
    if (suggestion.location) {
      onSelectPlace(suggestion.location);
    }
    setQuery(suggestion.title);
    setSearchView('detail');
    onSelectPlaceSuccess?.(suggestion);
  };

  // ---- Enter key → full search ----
  const handleEnterSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    autocompleteAbortRef.current?.abort();
    autocompleteAbortRef.current = null;

    setSuggestions([]);
    setListingQuery(trimmed);
    setListingResults([]);
    setListingLoading(true);
    setSearchView('listing');

    try {
      const results = await adapter.search(trimmed, locationBias);
      setListingResults(results.slice(0, 20));
    } catch (err: unknown) {
      console.error('Search listing fetch failed:', err);
      setListingResults([]);
      showToast('Failed to fetch search results. Please try again.');
    } finally {
      setListingLoading(false);
    }
  }, [query, adapter, locationBias]);

  // ---- Listing item selected ----
  const handleListingSelect = (suggestion: SearchSuggestion) => {
    setSuggestions([]);

    if (suggestion.type === 'product') {
      // Phase 7.5.5 — Product Detail is built in Phase 8.
      // For now, acknowledge the selection and stay in the listing view.
      console.log('[SearchBar] Product selected from listing:', suggestion);
      setQuery(suggestion.title);
      return;
    }

    // Place suggestion: move the map and open POI detail.
    if (suggestion.location) {
      onSelectPlace(suggestion.location);
    }
    setQuery(suggestion.title);
    setSearchView('detail');
    onSelectPlaceSuccess?.(suggestion);
  };

  // ---- Back arrow: detail → listing ----
  const handleBack = () => setSearchView('listing');

  // ---- Clear ----
  const handleClearAll = () => {
    setQuery('');
    setSuggestions([]);
    setListingResults([]);
    setListingQuery('');
    setSearchView('idle');
    onCloseInfoCard();
  };

  // ---- Typing handler ----
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val === '') {
      handleClearAll();
      return;
    }
    if (searchView === 'listing') setSearchView('refining');
    else if (searchView === 'detail') setSearchView('autocomplete');
  };

  // ---- Derived flags ----
  const isSidebarOpen = !!(
    searchView === 'listing' ||
    searchView === 'refining' ||
    selectedPoiDetails ||
    poiDetailLoading ||
    poiDetailError ||
    selectedPlace ||
    hasClickCard
  );

  const isSearching =
    searchView === 'autocomplete' ||
    searchView === 'listing' ||
    searchView === 'refining';

  const poiOnBack =
    searchView === 'detail' && listingResults.length > 0 ? handleBack : undefined;

  // ---- Render ----
  return (
    <>
      {/* SEARCH BAR */}
      <div className="absolute top-6 left-2.5 z-[100] w-[360px] max-w-[85vw] p-3">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search size={18} />
          </div>
          <Input
            type="text"
            className="pl-10 pr-10 bg-background rounded-lg shadow-md border-0 h-10 text-base"
            placeholder="Search..."
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleEnterSearch();
              }
            }}
          />

          {isSearching ? (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={handleClearAll}
              aria-label="Clear search"
            >
              <X size={18} />
            </Button>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={onDirectionClick}
              aria-label="Directions"
            >
              <Navigation className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Mode switcher */}
        <SearchModeSwitcher value={searchMode} onChange={setSearchMode} />

        {/* Autocomplete dropdown */}
        {suggestions.length > 0 && (
          <SearchResult
            suggestions={suggestions}
            onSelectSuggestion={handleSuggestionSelect}
          />
        )}
      </div>

      {/* Direction Panel or Sidebar */}
      {directionActive ? (
        <div className="absolute top-[120px] left-0 z-20 w-3/4 sm:max-w-sm">
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
        </div>
      ) : (
        <Sheet open={isSidebarOpen} modal={false} disablePointerDismissal={true}>
          <SheetContent
            side="left"
            withOverlay={false}
            className="w-[480px] sm:w-[520px] sm:max-w-[520px] p-0 h-screen bg-background flex flex-col shadow-lg border-r"
            showCloseButton={false}
          >
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="h-[140px] shrink-0" />

              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

                {/* LISTING */}
                {(searchView === 'listing' || searchView === 'refining') && (
                  <SearchListing
                    results={listingResults}
                    loading={listingLoading}
                    query={listingQuery}
                    onSelectItem={handleListingSelect}
                  />
                )}

                {/* DETAIL */}
                {searchView === 'detail' &&
                  !directionActive &&
                  (selectedPoiDetails || poiDetailLoading || poiDetailError) && (
                    <PoiDetailCard
                      poi={selectedPoiDetails}
                      loading={poiDetailLoading}
                      error={poiDetailError}
                      isSecondary={false}
                      onClose={onCloseInfoCard}
                      onGetDirections={onDirectionClick}
                      onBack={poiOnBack}
                    />
                  )}

              </div>

              {toastMessage && (
                <div className="toast-notification absolute bottom-4 left-4 z-50">
                  {toastMessage}
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default SearchBar;