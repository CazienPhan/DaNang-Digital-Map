import { MAP4D_CONFIG } from '@/config/map.config';
import { type MapCoordinate } from '@/features/map/components/MapContainer';

export interface RouteResult {
  path: MapCoordinate[];
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
}

export class RoutingService {
  /**
   * Decodes an overview polyline string returned by Map4D Route API
   * into an array of MapCoordinates (latitude, longitude).
   */
  static decodePolyline(encoded: string): MapCoordinate[] {
    const points: MapCoordinate[] = [];
    let index = 0;
    const len = encoded.length;
    let lat = 0;
    let lng = 0;

    while (index < len) {
      let b;
      let shift = 0;
      let result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;

      shift = 0;
      result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;

      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5,
      });
    }

    return points;
  }

  /**
   * Fetches routing details from backend Express proxy server.
   * @param origin Starting coordinate.
   * @param destination Ending coordinate.
   * @param mode Travel mode (car, motorcycle, bike, foot).
   */
  static async fetchRoute(origin: MapCoordinate, destination: MapCoordinate, mode?: string): Promise<RouteResult> {
    try {
      const originStr = `${origin.lat},${origin.lng}`;
      const destStr = `${destination.lat},${destination.lng}`;
      let url = `${MAP4D_CONFIG.backendUrl}/api/map4d/route?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}`;
      if (mode) {
        url += `&mode=${encodeURIComponent(mode)}`;
      }
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.code === 'ok' && data.result && data.result.routes && data.result.routes.length > 0) {
        const route = data.result.routes[0];
        const overviewPolyline = route.overviewPolyline || '';
        const path = overviewPolyline ? this.decodePolyline(overviewPolyline) : [];

        return {
          path,
          distance: route.distance?.text || '0 km',
          duration: route.duration?.text || '0 mins',
          distanceValue: route.distance?.value || 0,
          durationValue: route.duration?.value || 0,
        };
      }

      throw new Error('No routes returned from Map4D API.');
    } catch (error) {
      console.error('Failed to fetch route via proxy service:', error);
      throw error;
    }
  }

  /**
   * Fetches distance matrix details from backend Express proxy server.
   */
  static async fetchDistanceMatrix(origins: string, destinations: string, mode?: string): Promise<any> {
    try {
      let url = `${MAP4D_CONFIG.backendUrl}/api/map4d/route/matrix?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}`;
      if (mode) {
        url += `&mode=${encodeURIComponent(mode)}`;
      }
      
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch distance matrix via proxy service:', error);
      throw error;
    }
  }
}
export default RoutingService;
