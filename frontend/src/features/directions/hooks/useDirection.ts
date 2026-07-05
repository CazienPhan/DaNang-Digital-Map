import { useState, useCallback } from 'react';
import { type MapCoordinate } from '@/features/map/components/MapContainer';
import { RoutingService, type RouteResult } from '@/services/map4d/routing.service';

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

  // Core transportation states
  const [selectedTransportMode, setSelectedTransportMode] = useState<string>('car');
  const [matrixData, setMatrixData] = useState<Record<string, { distance: string; duration: string }> | null>(null);
  const [matrixLoading, setMatrixLoading] = useState(false);

  const calculateRoute = useCallback(async (
    startLoc: MapCoordinate,
    endLoc: MapCoordinate,
    mode?: string
  ) => {
    setLoading(true);
    setError(null);
    try {
      const result = await RoutingService.fetchRoute(startLoc, endLoc, mode || selectedTransportMode);
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
  }, [selectedTransportMode]);

  const calculateMatrix = useCallback(async (
    startLoc: MapCoordinate,
    endLoc: MapCoordinate
  ) => {
    setMatrixLoading(true);
    const modes = ['car', 'motorcycle', 'bike', 'foot'];
    const originStr = `${startLoc.lat},${startLoc.lng}`;
    const destStr = `${endLoc.lat},${endLoc.lng}`;
    
    try {
      const promises = modes.map(async (mode) => {
        try {
          const res = await RoutingService.fetchDistanceMatrix(originStr, destStr, mode);
          if (res && res.code === 'ok' && res.result?.routeRows?.[0]?.elements?.[0]) {
            const el = res.result.routeRows[0].elements[0];
            if (el.status === 'ok') {
              return {
                mode,
                distance: el.distance.text,
                duration: el.duration.text
              };
            }
          }
          return { mode, distance: '--', duration: '--' };
        } catch (err) {
          console.error(`Failed to calculate matrix for mode ${mode}:`, err);
          return { mode, distance: '--', duration: '--' };
        }
      });

      const results = await Promise.all(promises);
      const newMatrix: Record<string, { distance: string; duration: string }> = {};
      results.forEach((item) => {
        newMatrix[item.mode] = { distance: item.distance, duration: item.duration };
      });
      setMatrixData(newMatrix);
    } catch (err) {
      console.error('Error fetching distance matrix:', err);
    } finally {
      setMatrixLoading(false);
    }
  }, []);

  const clearRoute = useCallback(() => {
    setOrigin(null);
    setDestination(null);
    setRouteData(null);
    setError(null);
    setSelectedTransportMode('car');
    setMatrixData(null);
  }, []);

  const clearRouteData = useCallback(() => {
    setRouteData(null);
    setError(null);
    setSelectedTransportMode('car');
    setMatrixData(null);
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
    selectedTransportMode,
    setSelectedTransportMode,
    matrixData,
    matrixLoading,
    calculateMatrix,
  };
}
export default useDirection;
