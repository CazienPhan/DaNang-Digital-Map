import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SearchService, type PlaceSuggestion } from '@/services/map4d/search.service';
import { type MapCoordinate } from '@/features/map';
import { useDebounce } from '@/hooks/useDebounce';
import SearchResult from './SearchResult';
import { SearchListing } from './SearchListing';
import { DirectionPanel, type LocationState } from '@/features/directions';
import { type RouteResult } from '@/services/map4d/routing.service';

import { PoiDetailCard } from '@/features/poi';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { Button, Input } from "@/components/ui";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Search, X, Navigation } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  /**
   * Increment this value from App.tsx each time a map POI is clicked.
   * SearchBar reacts by switching to 'detail' view — the same view used
   * by Workflow A (listing select) and Workflow B (suggestion select).
   */
  externalPoiSelectSignal?: number;
}

// ---------------------------------------------------------------------------
// UI-only state — controls which panel the sidebar renders.
// Does NOT duplicate business logic or existing state.
// ---------------------------------------------------------------------------
// 'refining' = user is typing a new query while a previous Search Listing is still visible.
// The listing stays mounted; only a new Enter press replaces it.
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
  // ---- Existing state (untouched) ----
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 350);
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ---- New UI-only state ----
  const [searchView, setSearchView] = useState<SearchView>('idle');
  // Ref always holds the current searchView so the autocomplete effect can
  // read the live value without needing searchView in its dependency array
  // (avoids extra API calls on every view-state transition).
  const searchViewRef = useRef<SearchView>(searchView);
  useEffect(() => { searchViewRef.current = searchView; }, [searchView]);
  const [listingResults, setListingResults] = useState<PlaceSuggestion[]>([]);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingQuery, setListingQuery] = useState('');

  // Ref to the current in-flight autocomplete AbortController.
  // Lets handleEnterSearch cancel any pending autocomplete fetch so it
  // cannot repopulate suggestions after the user commits a search.
  const autocompleteAbortRef = useRef<AbortController | null>(null);

  // ---- Helper: toast ----
  const showToast = (message: string) => {
    setToastMessage(message);
    const toastTimer = setTimeout(() => {
      setToastMessage(null);
    }, 4000);
    return toastTimer;
  };

  // ---- Autocomplete: debounced query → suggestions ----
  useEffect(() => {
    if (debouncedQuery.trim().length < 1) {
      setSuggestions([]);
      // If user cleared the input while refining, go back to listing
      if (searchViewRef.current === 'autocomplete') {
        setSearchView('idle');
      } else if (searchViewRef.current === 'refining') {
        setSearchView('listing');
      }
      return;
    }

    if (selectedPlace && (selectedPlace.name === debouncedQuery || selectedPlace.address === debouncedQuery)) {
      setSuggestions([]);
      return;
    }

    // Mark autocomplete view while typing — but don't clobber 'listing',
    // 'refining', or 'detail'. Use the ref so we always read the CURRENT value
    // without adding searchView to the deps (which would cause extra API calls).
    const currentView = searchViewRef.current;
    if (currentView !== 'listing' && currentView !== 'refining' && currentView !== 'detail') {
      setSearchView('autocomplete');
    }

    const abortController = new AbortController();
    autocompleteAbortRef.current = abortController;  // expose to handleEnterSearch
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
      abortController.abort();
      autocompleteAbortRef.current = null;
    };
  }, [debouncedQuery, currentCenter]);

  // ---- Sync query text with selectedPlace ----
  useEffect(() => {
    if (selectedPlace) {
      setQuery(selectedPlace.name || selectedPlace.address || '');
    } else if (searchView === 'idle') {
      setQuery('');
    }
  }, [selectedPlace]);

  // ---- Map POI click → open detail view (Workflow C) ----
  // App.tsx increments externalPoiSelectSignal each time a map POI is clicked.
  // We react by switching to 'detail' — the same view used by Workflows A and B.
  // The signal is ignored on mount (value 0) to avoid opening the sidebar on load.
  useEffect(() => {
    if (!externalPoiSelectSignal) return;
    setSearchView('detail');
  }, [externalPoiSelectSignal]);


  const handleSuggestionSelect = (place: PlaceSuggestion) => {
    onSelectPlace(place.location);
    setQuery(place.name);
    setSuggestions([]);
    // Jump straight to detail — no listing shown
    setSearchView('detail');

    if (onSelectPlaceSuccess) {
      onSelectPlaceSuccess(place);
    }
  };

  // ---- Enter key → full search listing ----
  const handleEnterSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Cancel any in-flight autocomplete fetch so its .then() callback cannot
    // repopulate suggestions after we clear them below.
    autocompleteAbortRef.current?.abort();
    autocompleteAbortRef.current = null;

    // Clear autocomplete dropdown and transition to listing view.
    setSuggestions([]);
    setListingQuery(trimmed);
    setListingResults([]);
    setListingLoading(true);
    setSearchView('listing');

    try {
      const locationBias = currentCenter ? `${currentCenter.lat},${currentCenter.lng}` : undefined;
      const results = await SearchService.searchPlaces(trimmed, locationBias);
      // Cap at 20 results per spec
      setListingResults(results.slice(0, 20));
    } catch (err: any) {
      console.error('Search listing fetch failed:', err);
      setListingResults([]);
      showToast('Failed to fetch search results. Please try again.');
    } finally {
      setListingLoading(false);
    }
  }, [query, currentCenter]);

  // ---- Listing item clicked (Flow 1, Step 4 - Case 3) ----
  const handleListingSelect = (place: PlaceSuggestion) => {
    onSelectPlace(place.location);
    setQuery(place.name);
    setSuggestions([]);
    setSearchView('detail');

    if (onSelectPlaceSuccess) {
      onSelectPlaceSuccess(place);
    }
  };

  // ---- Back arrow: listing → detail → listing (no re-fetch) ----
  const handleBack = () => {
    // Clear the detail state without touching listing results
    setSearchView('listing');
  };

  // ---- Clear button: clears everything and returns to idle ----
  const handleClearAll = () => {
    setQuery('');
    setSuggestions([]);
    setListingResults([]);
    setListingQuery('');
    setSearchView('idle');
    onCloseInfoCard();
  };

  // ---- When user starts typing, handle view state transitions ----
  const handleQueryChange = (val: string) => {
    setQuery(val);
    if (val === '') {
      handleClearAll();
      return;
    }
    // When the user types while a Search Listing is visible, switch to
    // 'refining' — the previous listing stays mounted as background context.
    // Do NOT clear listingResults; only a new Enter press replaces them.
    if (searchView === 'listing') {
      setSearchView('refining');
    } else if (searchView === 'refining') {
      // Already refining — no state change needed, listing stays mounted.
    } else if (searchView === 'detail') {
      // Typing while in detail — go to autocomplete (no listing to preserve)
      setSearchView('autocomplete');
    }
  };

  // ---- Sidebar open condition ----
  const isSidebarOpen = !!(
    searchView === 'listing' ||   // showing search listing
    searchView === 'refining' ||  // previous listing still visible while typing new query
    selectedPoiDetails ||
    poiDetailLoading ||
    poiDetailError ||
    selectedPlace ||
    hasClickCard
  );

  // ---- Right button logic ----
  // - Searching/listing/refining: show X (clear all)
  // - Idle/detail: show Navigation (directions)
  const isSearching = searchView === 'autocomplete' || searchView === 'listing' || searchView === 'refining';

  // ---- Back arrow prop for PoiDetailCard ----
  // Only pass onBack when user came from listing (not from autocomplete select)
  const poiOnBack = searchView === 'detail' && listingResults.length > 0
    ? handleBack
    : undefined;

  return (
    <>
      {/* SEARCH BAR — always visible, independent of direction/sidebar state */}
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

          {/* Rightmost button: X (clear all) while searching, Navigation otherwise */}
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

        {/* Autocomplete dropdown — shown whenever there are suggestions,
            including while the previous listing is still visible ('refining') */}
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
              <div className="h-[90px] shrink-0" />

              {/* Sidebar content — switches based on searchView */}
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

                {/* LISTING VIEW — shown during 'listing' and also during 'refining'
                    (user is typing a new query; previous results remain as context) */}
                {(searchView === 'listing' || searchView === 'refining') && (
                  <SearchListing
                    results={listingResults}
                    loading={listingLoading}
                    query={listingQuery}
                    onSelectItem={handleListingSelect}
                  />
                )}

                {/* DETAIL VIEW — only rendered when the user is explicitly in the detail
                    view. Using a positive 'detail' check (instead of !== 'listing')
                    ensures the card stays hidden during 'refining', even if
                    selectedPoiDetails still holds the previously viewed POI. */}
                {searchView === 'detail' && !directionActive && (selectedPoiDetails || poiDetailLoading || poiDetailError) && (
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

              {/* Inline lightweight toast warnings */}
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