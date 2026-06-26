export const MAP4D_CONFIG = {
  mapApiKey: import.meta.env.VITE_MAP4D_MAP_KEY || '',
  apiSecretKey: import.meta.env.VITE_MAP4D_API_KEY || '',
  sdkVersion: '2.6',
  backendUrl:
    import.meta.env.VITE_BACKEND_URL ||
    'https://danang-digital-map-backend.onrender.com',
};