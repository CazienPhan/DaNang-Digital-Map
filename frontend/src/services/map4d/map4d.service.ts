import { MAP4D_CONFIG } from '../../config/map.config';

export interface GeocodeResult {
  status: string;
  result?: any;
  message?: string;
}

export interface PlaceSearchResult {
  status: string;
  results?: any[];
  message?: string;
}

export class Map4dService {
  /**
   * Proxies geocoding requests to the Node.js backend.
   * Converts a physical address to lat/lng coordinates.
   */
  static async geocode(address: string): Promise<GeocodeResult> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/map4d/geocode?address=${encodeURIComponent(address)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error('Error during geocoding service call:', error);
      return {
        status: 'ERROR',
        message: error.message || 'Geocoding request failed'
      };
    }
  }

  /**
   * Proxies text-search requests to the Node.js backend.
   * Retrieves points of interest matching a specific query string.
   */
  static async textSearch(query: string): Promise<PlaceSearchResult> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/map4d/search?text=${encodeURIComponent(query)}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error: any) {
      console.error('Error during text search service call:', error);
      return {
        status: 'ERROR',
        results: [],
        message: error.message || 'Text search request failed'
      };
    }
  }
}
