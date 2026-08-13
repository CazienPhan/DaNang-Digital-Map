import { MAP4D_CONFIG } from '@/config/map.config';
import { fetchMap4d } from './http';
import { type MapCoordinate } from '@/features/map/components/MapContainer';

/** Một chặng trong lộ trình (nếu Map4D trả về). */
export interface RouteStep {
  instruction: string;
  distance?: string;
}

export interface RouteResult {
  path: MapCoordinate[];
  distance: string;
  duration: string;
  distanceValue: number; // in meters
  durationValue: number; // in seconds
  /**
   * Danh sách chặng đường. Không phải phản hồi nào của Map4D cũng có, nên
   * luôn kiểm tra rỗng trước khi hiển thị.
   */
  steps?: RouteStep[];
}

/**
 * Trích các chặng từ phản hồi Map4D một cách phòng thủ — cấu trúc legs/steps
 * thay đổi tuỳ endpoint và tuỳ phương tiện, thiếu thì trả mảng rỗng.
 */
function extractSteps(route: any): RouteStep[] {
  const legs = Array.isArray(route?.legs) ? route.legs : [];
  const steps: RouteStep[] = [];

  for (const leg of legs) {
    for (const s of Array.isArray(leg?.steps) ? leg.steps : []) {
      // Map4D trả câu chỉ dẫn tiếng Việt sẵn ở `htmlInstructions`
      // (ví dụ: "Rẽ phải vào Nguyễn Thái Học").
      const instruction =
        s?.htmlInstructions ?? s?.instruction ?? s?.streetName ?? '';
      if (!instruction) continue;
      steps.push({
        instruction: String(instruction).replace(/<[^>]+>/g, '').trim(),
        distance: s?.distance?.text ?? undefined,
      });
    }
  }

  return steps;
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
      const query =
        `origin=${encodeURIComponent(originStr)}` +
        `&destination=${encodeURIComponent(destStr)}` +
        (mode ? `&mode=${encodeURIComponent(mode)}` : '');

      const data = await fetchMap4d({
        backendPath: `/api/map4d/route?${query}`,
        directPath: `/sdk/route?${query}`,
      });

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
          steps: extractSteps(route),
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
