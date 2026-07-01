import { MAP4D_CONFIG } from '../config/map.config';

export interface PlaceDetail {
  name: string;
  address: string;
  lat: number;
  lng: number;
  category?: string;
  id?: string;
  type?: string;
  pixel?: { x: number; y: number };
  placeInfo?: string;
}

export class PlaceDetailService {
  /**
   * Performs reverse geocoding to retrieve detailed place name, address, and category.
   */
  static async getPlaceDetail(lat: number, lng: number): Promise<PlaceDetail> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/map4d/geocode?location=${lat},${lng}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.result) && data.result.length > 0) {
        const item = data.result[0];
        return {
          name: item.name || 'Clicked Location',
          address: item.address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat: lat,
          lng: lng,
          category: item.type || item.category || 'Location',
        };
      }
      return {
        name: 'Clicked Location',
        address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        lat: lat,
        lng: lng,
        category: 'Location',
      };
    } catch (error) {
      console.error('Failed to resolve place detail:', error);
      throw error;
    }
  }
}

export default PlaceDetailService;
