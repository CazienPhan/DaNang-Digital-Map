import React, { useEffect, useRef, useState } from 'react';
import { MAP4D_CONFIG } from '../../config/map.config';
import { loadMap4dSDK } from '../../utils/map.helper';

export interface MapCoordinate {
  lat: number;
  lng: number;
}

export interface MapContainerProps {
  center?: MapCoordinate;
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
  onMapReady?: (map: any) => void;
  onMapClick?: (latLng: MapCoordinate) => void;
  onCameraMove?: (camera: any) => void;
  onZoomChanged?: (zoom: number) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center = { lat: 16.0544, lng: 108.2022 }, // Default Da Nang Coordinates
  zoom = 12,
  minZoom = 2,
  maxZoom = 22,
  onMapReady,
  onMapClick,
  onCameraMove,
  onZoomChanged,
  className,
  style,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize SDK
  useEffect(() => {
    loadMap4dSDK(MAP4D_CONFIG.mapApiKey, MAP4D_CONFIG.sdkVersion)
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Map4D Web SDK failed to load with mapApiKey, retrying with apiSecretKey...', err);
        // Fallback retry using verified apiSecretKey
        loadMap4dSDK(MAP4D_CONFIG.apiSecretKey, MAP4D_CONFIG.sdkVersion)
          .then(() => {
            setLoading(false);
          })
          .catch((retryErr) => {
            setError(retryErr.message || 'Failed to load Map4D SDK.');
            setLoading(false);
          });
      });
  }, []);

  // Initialize Map Instance once SDK is loaded and container is ready
  useEffect(() => {
    if (loading || error || !containerRef.current || mapInstance) {
      return;
    }

    try {
      // Map4D Map initialization options
      const mapOptions = {
        center: new window.map4d.LatLng(center.lat, center.lng),
        zoom: zoom,
        minZoom: minZoom,
        maxZoom: maxZoom,
      };

      const map = new window.map4d.Map(containerRef.current, mapOptions);
      setMapInstance(map);

      // Trigger callback with map instance
      if (onMapReady) {
        onMapReady(map);
      }

      // Register Events
      if (onMapClick) {
        map.addListener('click', (args: any) => {
          if (args && args.location) {
            onMapClick({
              lat: args.location.lat,
              lng: args.location.lng,
            });
          }
        });
      }

      // Map4D SDK 2.6 uses cameraChanging event for both panning and zooming updates
      map.addListener('cameraChanging', () => {
        const camera = map.getCamera();
        if (onCameraMove) {
          onCameraMove(camera);
        }
        if (onZoomChanged) {
          onZoomChanged(camera.getZoom());
        }
      });

    } catch (err: any) {
      console.error('Failed to initialize Map4D map:', err);
      setError('Error initializing Map4D instance.');
    }

    // Cleanup listeners or map instances if needed
    return () => {
      // Map4D listeners do not require explicit cleanup if the container DOM is deleted
    };
  }, [loading, error, mapInstance]);

  // Synchronize dynamic center property
  useEffect(() => {
    if (mapInstance && center) {
      const camera = mapInstance.getCamera();
      const currentCenter = camera.getTarget();
      if (
        currentCenter.lat !== center.lat ||
        currentCenter.lng !== center.lng
      ) {
        const newCamera = new window.map4d.CameraPosition(
          new window.map4d.LatLng(center.lat, center.lng),
          camera.getTilt(),
          camera.getBearing(),
          camera.getZoom()
        );
        mapInstance.moveCamera(newCamera);
      }
    }
  }, [center, mapInstance]);

  // Synchronize dynamic zoom property
  useEffect(() => {
    if (mapInstance && zoom !== undefined) {
      const camera = mapInstance.getCamera();
      if (camera.getZoom() !== zoom) {
        const newCamera = new window.map4d.CameraPosition(
          camera.getTarget(),
          camera.getTilt(),
          camera.getBearing(),
          zoom
        );
        mapInstance.moveCamera(newCamera);
      }
    }
  }, [zoom, mapInstance]);

  if (error) {
    return (
      <div 
        className="map-error-fallback" 
        style={{ 
          color: '#d9534f', 
          padding: '1rem', 
          border: '1px solid #d9534f', 
          borderRadius: '4px',
          backgroundColor: '#fdf7f7' 
        }}
      >
        <h4>Map Rendering Error</h4>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className || 'map-canvas-container'}
      style={style || { width: '100%', height: '100%', minHeight: '500px' }}
    >
      {loading && (
        <div 
          className="map-loading-indicator" 
          style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '100%',
            color: '#555'
          }}
        >
          <span>Loading Map4D Web SDK...</span>
        </div>
      )}
    </div>
  );
};
export default MapContainer;
