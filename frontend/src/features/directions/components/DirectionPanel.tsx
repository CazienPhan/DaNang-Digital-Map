import React from "react";
import { useDirectionRoute } from "@/features/directions/hooks/useDirectionRoute";
import type { PlaceSuggestion } from "@/services/map4d/search.service";
import { type LocationState } from "@/features/directions/hooks/useDirection";
import { type RouteResult } from "@/services/map4d/routing.service";
import DirectionLocationInput from "@/features/directions/components/DirectionLocationInput";
import TransportModeSelector from "@/features/directions/components/TransportModeSelector";
import RouteSummaryCard from "@/features/directions/components/RouteSummaryCard";
import { useDirectionSearch } from "@/features/directions/hooks/useDirectionSearch";
import { Card, CardHeader, CardContent, CardTitle, Button, Alert, AlertDescription } from "@/components/ui";
import { X, ArrowUpDown, Loader2 } from "lucide-react";

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
  currentCenter, origin, setOrigin, destination, setDestination, routeData,
  onCalculateRoute, onClear, loading, error, onClose, cachedGps,
  selectedTransportMode, setSelectedTransportMode, onCalculateMatrix,
}) => {

  const {
    originText, setOriginText,
    destText, setDestText,
    originSuggestions, setOriginSuggestions,
    destSuggestions, setDestSuggestions,
    activeInput, setActiveInput,
    focusedIndex, setFocusedIndex,
  } = useDirectionSearch({ currentCenter, origin, destination });

  useDirectionRoute({
    origin, destination, selectedTransportMode,
    onCalculateRoute, onClear, onCalculateMatrix,
  });

  const handleSelectCurrentLocation = () => {
    if (cachedGps) {
      setOrigin({
        lat: cachedGps.lat, lng: cachedGps.lng,
        address: cachedGps.address, name: 'Current Location',
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
      lat: suggestion.location.lat, lng: suggestion.location.lng,
      address: suggestion.name,
    });
    setOriginSuggestions([]);
  };

  const handleSelectDest = (suggestion: PlaceSuggestion) => {
    setDestination({
      lat: suggestion.location.lat, lng: suggestion.location.lng,
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
          if (focusedIndex === 0) handleSelectCurrentLocation();
          else handleSelectOrigin(originSuggestions[focusedIndex - 1]);
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
    <div className="flex flex-col gap-4 w-[calc(100vw-24px)] md:w-[400px]">
      <Card className="w-full shadow-lg rounded-xl overflow-visible bg-white border border-gray-100 z-10 relative">
        <CardHeader className="h-14 px-4 py-0 flex flex-row items-center justify-between border-b border-gray-100">
          <CardTitle className="text-lg font-medium text-gray-800">
            Directions
          </CardTitle>
          <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full hover:bg-gray-100 text-gray-500">
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          <TransportModeSelector selectedMode={selectedTransportMode} onChange={setSelectedTransportMode} />
          
          <div className="flex items-center w-full relative">
            <div className="flex flex-col items-center justify-center mr-3 h-full pb-1">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" />
              <div className="w-0.5 h-12 bg-gray-300 my-1 flex-shrink-0" />
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
            </div>

            <div className="flex-1 flex flex-col gap-3 relative min-w-0">
              <DirectionLocationInput
                placeholder="Choose starting point..."
                value={originText}
                onChange={(value: string) => { setOriginText(value); if (origin) setOrigin(null); }}
                suggestions={originSuggestions}
                active={activeInput === "origin"}
                onFocus={() => setActiveInput("origin")}
                onBlur={() => setTimeout(() => setActiveInput(null), 250)}
                onKeyDown={handleOriginKeyDown}
                onSelect={handleSelectOrigin}
                focusedIndex={focusedIndex}
                cachedGps={cachedGps}
                onSelectCurrent={handleSelectCurrentLocation}
                onClearLocation={() => setOrigin(null)}
              />
              <DirectionLocationInput
                placeholder="Choose destination..."
                value={destText}
                onChange={(value: string) => { setDestText(value); if (destination) setDestination(null); }}
                suggestions={destSuggestions}
                active={activeInput === "dest"}
                onFocus={() => setActiveInput("dest")}
                onBlur={() => setTimeout(() => setActiveInput(null), 250)}
                onKeyDown={handleDestKeyDown}
                onSelect={handleSelectDest}
                focusedIndex={focusedIndex}
                cachedGps={cachedGps}
                onClearLocation={() => setDestination(null)}
              />
            </div>
            
            <div className="ml-3 flex items-center justify-center">
              <Button size="icon" variant="outline" className="rounded-full h-8 w-8 text-gray-500" onClick={handleSwap} title="Swap locations">
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading && (
            <Alert className="bg-gray-50 border-gray-100">
              <Loader2 className="animate-spin h-4 w-4 text-blue-500" />
              <AlertDescription className="text-gray-600">Finding Route...</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
      
      {routeData && !loading && !error && (
        <div className="w-full relative z-0">
          <RouteSummaryCard routeData={routeData} />
        </div>
      )}
    </div>
  );
};

export default DirectionPanel;