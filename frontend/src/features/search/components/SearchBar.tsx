import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { type MapCoordinate } from '@/features/map';
import { useDebounce } from '@/hooks/useDebounce';
import SearchResult from './SearchResult';
import { SearchListing } from './SearchListing';
import { DirectionPanel, type LocationState } from '@/features/directions';
import { type RouteResult } from '@/services/map4d/routing.service';
import { PoiDetailCard, ProductDetailPanel, CartSummary, ExperienceRegistrationForm } from '@/features/poi';
import { useCart } from '@/hooks/useCart';
import { type POIDetailData } from '@/services/supabase/poi.service';
import { type ProductItem } from '@/services/supabase/product.service';
import { Button, Input } from '@/components/ui';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Search, X, Navigation } from 'lucide-react';
import SearchModeSwitcher from './SearchModeSwitcher';
import type { SearchMode } from '../types/SearchMode';
import type { SearchSuggestion } from '../types/SearchSuggestion';
import { SearchEngineAdapter } from '../services/SearchEngineAdapter';
import { ProductDetailCard } from './product-detail/ProductDetailCard';

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
// 'refining'        = user is typing while a previous listing is still visible.
// 'product-detail'  = product selected; Product Info Detail is shown.
// ---------------------------------------------------------------------------
type SearchView = 'idle' | 'autocomplete' | 'listing' | 'refining' | 'detail' | 'product-detail';

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

  // ---- Selected product (Product Detail) ----
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // ---- Selected product from a POI's "Sản phẩm" tab (side panel next to the POI Sheet) ----
  const [selectedPoiProduct, setSelectedPoiProduct] = useState<ProductItem | null>(null);
  useEffect(() => {
    // Close the product panel whenever the underlying POI changes or the detail view closes.
    setSelectedPoiProduct(null);
  }, [selectedPoiDetails?.id, searchView]);

  // ---- Cart ----
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);
  // Tracks which POI tab was active when cart was opened, so closing the cart
  // returns the user to that same tab (Products, not Overview).
  const [cartReturnTab, setCartReturnTab] = useState<'overview' | 'menu'>('overview');

  /** Opens the cart and remembers the return tab. */
  const openCart = (returnTab: 'overview' | 'menu' = 'menu') => {
    setCartReturnTab(returnTab);
    setCartOpen(true);
  };

  /** Closes the cart WITHOUT clearing cart contents. */
  const closeCart = () => setCartOpen(false);

  // ---- Experience Registration Form ----
  const [experienceFormOpen, setExperienceFormOpen] = useState(false);

  /** Opens the experience registration form. Closes cart if open. */
  const openExperienceForm = () => {
    setCartOpen(false);
    setExperienceFormOpen(true);
  };

  /** Closes the experience registration form; returns to POI detail. */
  const closeExperienceForm = () => setExperienceFormOpen(false);

  // Close the experience form whenever the underlying POI changes or the detail view closes.
  useEffect(() => {
    setExperienceFormOpen(false);
  }, [selectedPoiDetails?.id, searchView]);

  // ---- Measure the POI Sheet's actual rendered width so ProductDetailPanel can
  // sit flush against its right edge on desktop, regardless of the Sheet's own
  // responsive width classes. The Sheet's content only mounts once `open` is
  // true, so a plain useRef + mount-time effect can miss it — a callback ref
  // re-attaches the observer every time the DOM node actually appears. ----
  const [sheetWidth, setSheetWidth] = useState(0);
  const sheetResizeObserverRef = useRef<ResizeObserver | null>(null);
  const sheetContentRef = useCallback((el: HTMLDivElement | null) => {
    sheetResizeObserverRef.current?.disconnect();
    sheetResizeObserverRef.current = null;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect.width;
      if (width) setSheetWidth(width);
    });
    observer.observe(el);
    sheetResizeObserverRef.current = observer;
  }, []);

  // ---- AbortController ref ----
  const autocompleteAbortRef = useRef<AbortController | null>(null);

  // ---- Suppress the next autocomplete fetch triggered by a programmatic
  // query change (e.g. selecting a suggestion sets query = suggestion.title,
  // which would otherwise re-trigger the debounced autocomplete effect and
  // re-open the dropdown right after selection). ----
  const suppressAutocompleteRef = useRef(false);

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
    if (suppressAutocompleteRef.current) {
      suppressAutocompleteRef.current = false;
      return;
    }

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
    suppressAutocompleteRef.current = true;
    setSuggestions([]);

    if (suggestion.type === 'product') {
      // Product Detail: hide dropdown, set product id, switch to product-detail view.
      setQuery(suggestion.title);
      setSelectedProductId(suggestion.id);
      setSearchView('product-detail');
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
    suppressAutocompleteRef.current = true;
    setSuggestions([]);

    if (suggestion.type === 'product') {
      // Product Detail: switch from listing to product-detail view.
      setQuery(suggestion.title);
      setSelectedProductId(suggestion.id);
      setSearchView('product-detail');
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

  // ---- Back arrow: product-detail → listing | detail → listing ----
  const handleBack = () => {
    if (searchView === 'product-detail') {
      setSelectedProductId(null);
      setSearchView('listing');
    } else {
      setSearchView('listing');
    }
  };

  // ---- Clear ----
  const handleClearAll = () => {
    setQuery('');
    setSuggestions([]);
    setListingResults([]);
    setListingQuery('');
    setSelectedProductId(null);
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
    searchView === 'product-detail' ||
    selectedPoiDetails ||
    poiDetailLoading ||
    poiDetailError ||
    selectedPlace ||
    hasClickCard
  );

  const isSearching =
    searchView === 'autocomplete' ||
    searchView === 'listing' ||
    searchView === 'refining' ||
    searchView === 'product-detail';

  const poiOnBack =
    searchView === 'detail' && listingResults.length > 0 ? handleBack : undefined;

  const productOnBack =
    searchView === 'product-detail' && listingResults.length > 0 ? handleBack : undefined;

  // ---- Render ----
  return (
    <>
      {/* SEARCH BAR */}
      <div className="absolute top-6 left-2.5 z-[100] w-[360px] max-w-[85vw] p-3">
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#fd9401]">
            <Search size={18} />
          </div>
          <Input
            type="text"
            className="pl-10 pr-10 bg-background rounded-lg shadow-sm border-1 h-10 text-base"
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
              <Navigation className="h-5 w-5 text-[#fd9401]" />
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
            ref={sheetContentRef}
            side="left"
            withOverlay={false}
            className={[
              'w-[480px] sm:w-[520px] sm:max-w-[520px] p-0 h-screen flex flex-col shadow-lg',
              searchView === 'product-detail' ? '' : 'bg-background border-r',
            ].join(' ')}
            style={searchView === 'product-detail' ? { backgroundColor: '#ffe48a' } : undefined}
            showCloseButton={false}
          >
            {/* #720000 border ring — absolute overlay so it is never clipped by
                 overflow-hidden children and is always visible on all four sides. */}
            {searchView === 'product-detail' && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-50"
                style={{ border: '6px solid #720000' }}
              />
            )}

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

                {/* PRODUCT DETAIL */}
                {searchView === 'product-detail' && (
                  <ProductDetailCard
                    productId={selectedProductId}
                    onClose={handleClearAll}
                    onBack={productOnBack}
                  />
                )}

                {/* POI DETAIL, CART SUMMARY, or EXPERIENCE REGISTRATION FORM */}
                {searchView === 'detail' &&
                  !directionActive &&
                  (selectedPoiDetails || poiDetailLoading || poiDetailError) && (
                    experienceFormOpen ? (
                      <ExperienceRegistrationForm
                        onClose={closeExperienceForm}
                      />
                    ) : cartOpen ? (
                      <CartSummary
                        onClose={closeCart}
                      />
                    ) : (
                      <PoiDetailCard
                        poi={selectedPoiDetails}
                        loading={poiDetailLoading}
                        error={poiDetailError}
                        isSecondary={false}
                        defaultTab={cartReturnTab}
                        onClose={() => {
                          setSelectedPoiProduct(null);
                          setCartOpen(false);
                          setExperienceFormOpen(false);
                          onCloseInfoCard();
                        }}
                        onGetDirections={onDirectionClick}
                        onBack={poiOnBack}
                        onSelectProduct={setSelectedPoiProduct}
                        onOverviewTabSelected={() => setSelectedPoiProduct(null)}
                        onAddToCart={(item) => cart.addItem(item)}
                        onBuyNow={(item) => {
                          cart.addItem(item);
                          openCart('menu');
                        }}
                        onOpenCart={() => openCart('menu')}
                        onRegisterExperience={openExperienceForm}
                        cartItemCount={cart.totalItems}
                      />
                    )
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

      {!directionActive && searchView === 'detail' && (
        <ProductDetailPanel
          product={selectedPoiProduct}
          anchorLeft={sheetWidth || undefined}
          onClose={() => setSelectedPoiProduct(null)}
        />
      )}
    </>
  );
};

export default SearchBar;