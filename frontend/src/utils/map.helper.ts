// Type declarations for global map4d object
declare global {
  interface Window {
    map4d: any;
  }
}

let loadPromise: Promise<void> | null = null;

/**
 * Dynamically loads the Map4D Web SDK script.
 * Utilizes a promise cache to ensure the script is injected and loaded only once.
 */
export const loadMap4dSDK = (apiKey: string, version: string = '2.6'): Promise<void> => {
  if (loadPromise) {
    return loadPromise;
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    // If the window namespace is already populated, resolve instantly.
    if (window.map4d) {
      resolve();
      return;
    }

    const callbackName = '__map4d_init_callback__';
    
    // Register temporary callback function on window for the SDK load hook.
    (window as any)[callbackName] = () => {
      resolve();
      try {
        delete (window as any)[callbackName];
      } catch (e) {
        // Fallback for cases where delete is restricted.
        (window as any)[callbackName] = undefined;
      }
    };

    const script = document.createElement('script');
    script.src = `https://api.map4d.vn/sdk/map/js?version=${version}&key=${apiKey}&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    script.onerror = () => {
      // Clear cached promise on failure to allow future retries
      loadPromise = null;
      reject(new Error('Map4D Web SDK script failed to load.'));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};
