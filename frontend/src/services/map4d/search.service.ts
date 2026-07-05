import { MAP4D_CONFIG } from '@/config/map.config';

export interface PlaceSuggestion {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
}

export class SearchService {
  /**
   * Contacts the Express backend proxy autosuggest API.
   * Returns parsed Suggestions list for dropdown autocomplete suggestions.
   * Supports AbortSignal for request cancellation during typing.
   */
  static async searchPlaces(query: string, location?: string, signal?: AbortSignal): Promise<PlaceSuggestion[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      let url = `${MAP4D_CONFIG.backendUrl}/api/map4d/autosuggest?text=${encodeURIComponent(query)}`;
      if (location) {
        url += `&location=${encodeURIComponent(location)}`;
      }
      const response = await fetch(url, { signal });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data && data.result && Array.isArray(data.result)) {
        const mapped = data.result.map((item: any) => ({
          id: item.id || Math.random().toString(),
          name: item.name || 'Unknown Place',
          address: item.address || item.oldAddress || '',
          location: {
            lat: item.location?.lat || 0,
            lng: item.location?.lng || 0,
          },
        }));

        // Sort suggestions by relevance: Place Name starts/contains query first, then Address contains, then others.
        const cleanQuery = query.trim().toLowerCase();
        const getRelevanceScore = (name: string, address: string): number => {
          const cleanName = name.toLowerCase();
          const cleanAddr = address.toLowerCase();

          // 1. Place Name starts with search query (highest priority)
          if (cleanName.startsWith(cleanQuery)) {
            return 100 - (cleanName.length - cleanQuery.length); // Tie breaker: shorter name has higher priority
          }
          // 2. Place Name contains search query
          if (cleanName.includes(cleanQuery)) {
            return 80;
          }
          // 3. Address contains search query
          if (cleanAddr.includes(cleanQuery)) {
            return 60;
          }
          // 4. Default / related results
          return 0;
        };

        return mapped.sort((a: PlaceSuggestion, b: PlaceSuggestion) => getRelevanceScore(b.name, b.address) - getRelevanceScore(a.name, a.address));
      }

      return [];
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was aborted intentionally, suppress logging
        return [];
      }
      console.error('Failed to search places via proxy service:', error);
      throw error;
    }
  }

  /**
   * Performs reverse geocoding to resolve coordinates to human-readable address.
   */
  static async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const response = await fetch(
        `${MAP4D_CONFIG.backendUrl}/api/map4d/geocode?location=${lat},${lng}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data && Array.isArray(data.result) && data.result.length > 0) {
        return data.result[0].address || data.result[0].name || '';
      }
      return '';
    } catch (error) {
      console.error('Failed to perform reverse geocoding:', error);
      throw error;
    }
  }
}
