import { useState, useCallback } from 'react';
import { type MapCoordinate } from '../components/Map/MapContainer';
import { RoutingService, type RouteResult } from '../services/map4d/routing.service';

export interface LocationState {
  lat: number;
  lng: number;
  address: string;
  name?: string;
  category?: string;
}

export function useDirection() {
  const [origin, setOrigin] = useState<LocationState | null>(null);
  const [destination, setDestination] = useState<LocationState | null>(null);
  const [routeData, setRouteData] = useState<RouteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const calculateRoute = useCallback(async (
    startLoc: MapCoordinate,
    endLoc: MapCoordinate
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await RoutingService.fetchRoute(startLoc, endLoc);
      setRouteData(result);
      return result;
    } catch (err: any) {
      console.error('Route calculation error:', err);
      setRouteData(null);
      setError('No route found');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setRouteData(null);
    setError(null);
  }, []);

  const clearRouteData = useCallback(() => {
    setRouteData(null);
    setError(null);
  }, []);

  return {
    origin,
    setOrigin,
    destination,
    setDestination,
    routeData,
    setRouteData,
    calculateRoute,
    clearRoute,
    clearRouteData,
    loading,
    error,
    setError,
    panelOpen,
    setPanelOpen,
  };
}
export default useDirection;
