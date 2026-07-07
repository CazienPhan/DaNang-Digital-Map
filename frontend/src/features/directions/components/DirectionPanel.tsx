import React from "react";

import { useDirectionRoute }
  from "@/features/directions/hooks/useDirectionRoute";


import type { PlaceSuggestion }
  from "@/services/map4d/search.service";


import { type LocationState }
  from "@/features/directions/hooks/useDirection";


import { type RouteResult }
  from "@/services/map4d/routing.service";


import DirectionLocationInput
  from "@/features/directions/components/DirectionLocationInput";


import TransportModeSelector
  from "@/features/directions/components/TransportModeSelector";


import RouteSummaryCard
  from "@/features/directions/components/RouteSummaryCard";


import { useDirectionSearch }
  from "@/features/directions/hooks/useDirectionSearch";


import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Button,
  Alert,
  AlertDescription
}
  from "@/components/ui";


import {
  X,
  ArrowUpDown,
  Loader2
}
  from "lucide-react";

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

  const {

    originText,
    setOriginText,

    destText,
    setDestText,


    originSuggestions,
    setOriginSuggestions,


    destSuggestions,
    setDestSuggestions,


    activeInput,
    setActiveInput,


    focusedIndex,
    setFocusedIndex,


  }
    =
    useDirectionSearch({

      currentCenter,

      origin,

      destination,

    });

  useDirectionRoute({

    origin,

    destination,

    selectedTransportMode,

    onCalculateRoute,

    onClear,

    onCalculateMatrix,

  });

  // NOTE: giữ nguyên cấu trúc dữ liệu transportModes, chỉ đổi icon sang Lucide (STEP: Import icon)

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
      setFocusedIndex((prev: number) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev: number) => (prev > 0 ? prev - 1 : totalItems - 1));
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
      setFocusedIndex((prev: number) => (prev < destSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prev: number) => (prev > 0 ? prev - 1 : destSuggestions.length - 1));
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
      {/* STEP 1: Card thay cho direction-panel */}
      <Card
        className="
        w-[420px]
        max-w-[90vw]
        shadow-lg
        rounded-xl
        "
      >
        {/* STEP 2: Header */}
        <CardHeader>
          <div
            className="
            flex
            items-center
            justify-between
            "
          >
            <CardTitle>
              Directions
            </CardTitle>
            <Button
              size="icon"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* STEP 3: Body */}
        <CardContent
          className="space-y-4"
        >
          {/* Transport Mode Selection Tabs (STEP 8) */}
          <TransportModeSelector

            selectedMode={selectedTransportMode}

            onChange={setSelectedTransportMode}

          />

          <div className="direction-inputs-container">
            {/* Google Maps style Origin/Destination left indicators */}
            <div className="route-indicator">
              <span className="indicator-dot origin-indicator-dot"></span>
              <span className="indicator-line"></span>
              <span className="indicator-dot dest-indicator-dot"></span>
            </div>
            <div className="inputs-wrapper">
              {/* Origin Search (STEP 4) */}
              <DirectionLocationInput

                placeholder="Choose starting point..."

                value={originText}


                onChange={(value: string) => {

                  setOriginText(value);

                  if (origin) {
                    setOrigin(null);
                  }

                }}


                suggestions={originSuggestions}


                active={
                  activeInput === "origin"
                }


                onFocus={() =>
                  setActiveInput("origin")
                }


                onBlur={() =>
                  setTimeout(
                    () => setActiveInput(null),
                    250
                  )
                }


                onKeyDown={handleOriginKeyDown}


                onSelect={handleSelectOrigin}


                focusedIndex={focusedIndex}


                cachedGps={cachedGps}


                onSelectCurrent={
                  handleSelectCurrentLocation
                }


                onClearLocation={() => {
                  setOrigin(null)
                }}

              />

              {/* Destination Search (STEP 4) */}
              <DirectionLocationInput

                placeholder="Choose end point..."

                value={destText}


                onChange={(value: string) => {

                  setDestText(value);

                  if (destination) {
                    setDestination(null);
                  }

                }}


                suggestions={destSuggestions}


                active={
                  activeInput === "dest"
                }


                onFocus={() =>
                  setActiveInput("dest")
                }


                onBlur={() =>
                  setTimeout(
                    () => setActiveInput(null),
                    250
                  )
                }


                onKeyDown={handleDestKeyDown}


                onSelect={handleSelectDest}


                focusedIndex={focusedIndex}

                cachedGps={cachedGps}

                onClearLocation={() => {
                  setDestination(null)
                }}

              />
              {/* Swap Button on the right (STEP 5) */}
              <Button
                size="icon"
                variant="outline"
                onClick={handleSwap}
                title="Swap start and destination"
              >
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Info panel results (STEP 6) */}
            {loading && (
              <Alert>
                <Loader2 className="animate-spin h-4 w-4" />
                <AlertDescription>
                  Finding Route...
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert
                variant="destructive"
              >
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* STEP 7: Route Summary */}
      {
        routeData &&
        !loading &&
        !error &&

        <RouteSummaryCard
          routeData={routeData}
        />

      }
    </>
  );
};

export default DirectionPanel;