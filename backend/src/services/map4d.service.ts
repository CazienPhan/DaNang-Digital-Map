import axios from 'axios';

export class Map4dBackendService {
  /**
   * Helper to retrieve the protected Map4D API key from environment variables.
   * Throws an error if the key is not defined, protecting sensitive integration settings.
   */
  private static getApiKey(): string {
    const key = process.env.MAP4D_API_KEY;
    if (!key) {
      throw new Error('MAP4D_API_KEY environment variable is missing.');
    }
    return key;
  }

  /**
   * Proxies geocoding requests to the Map4D Web API.
   * @param address Physical address query string.
   */
  static async geocode(address?: string, location?: string): Promise<any> {
    try {
      const key = this.getApiKey();
      const params: any = { key };
      if (address) params.address = address;
      if (location) params.location = location;

      const response = await axios.get('https://api.map4d.vn/sdk/v2/geocode', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Map4D Geocoding/Reverse API Error:', error.message);
      throw new Error(`Failed to contact Map4D Geocoding/Reverse endpoint: ${error.message}`);
    }
  }

  /**
   * Proxies text searches for POIs to the Map4D Places API.
   * @param text Query text (e.g. "Dragon Bridge", "cửa hàng").
   * @param location Optional location bias formatted as latitude,longitude.
   */
  static async textSearch(text: string, location?: string): Promise<any> {
    try {
      const key = this.getApiKey();
      const params: any = { key, text };
      if (location) params.location = location;

      const response = await axios.get('https://api.map4d.vn/sdk/place/text-search', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Map4D Text Search API Error:', error.message);
      throw new Error(`Failed to contact Map4D Text Search endpoint: ${error.message}`);
    }
  }

  /**
   * Proxies autocomplete suggestions queries to Map4D Autosuggest API.
   * @param text Autocomplete query string.
   * @param location Optional location bias formatted as latitude,longitude.
   */
  static async autosuggest(text: string, location?: string): Promise<any> {
    try {
      const key = this.getApiKey();
      const params: any = { key, text };
      if (location) params.location = location;

      const response = await axios.get('https://api.map4d.vn/sdk/autosuggest', {
        params,
      });
      return response.data;
    } catch (error: any) {
      console.error('Map4D Autosuggest API Error:', error.message);
      throw new Error(`Failed to contact Map4D Autosuggest endpoint: ${error.message}`);
    }
  }

  /**
   * Proxies route queries to Map4D Route API.
   * @param origin Starting coordinate pair (lat,lng).
   * @param destination Ending coordinate pair (lat,lng).
   */
  static async route(origin: string, destination: string): Promise<any> {
    try {
      const key = this.getApiKey();
      const response = await axios.get('https://api.map4d.vn/sdk/route', {
        params: {
          key,
          origin,
          destination,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Map4D Route API Error:', error.message);
      throw new Error(`Failed to contact Map4D Route endpoint: ${error.message}`);
    }
  }
}
