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
  static async geocode(address: string): Promise<any> {
    try {
      const key = this.getApiKey();
      const response = await axios.get('https://api.map4d.vn/sdk/v2/geocode', {
        params: {
          key,
          address,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Map4D Geocoding API Error:', error.message);
      throw new Error(`Failed to contact Map4D Geocoding endpoint: ${error.message}`);
    }
  }

  /**
   * Proxies text searches for POIs to the Map4D Places API.
   * @param text Query text (e.g. "Dragon Bridge", "cửa hàng").
   */
  static async textSearch(text: string): Promise<any> {
    try {
      const key = this.getApiKey();
      const response = await axios.get('https://api.map4d.vn/sdk/place/text-search', {
        params: {
          key,
          text,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error('Map4D Text Search API Error:', error.message);
      throw new Error(`Failed to contact Map4D Text Search endpoint: ${error.message}`);
    }
  }
}
