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
  markerPosition?: MapCoordinate | null;
  clickMarker?: MapCoordinate | null;
  routePath?: MapCoordinate[] | null;
  originMarker?: MapCoordinate | null;
  destinationMarker?: MapCoordinate | null;
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
  markerPosition = null,
  clickMarker = null,
  routePath = null,
  originMarker = null,
  destinationMarker = null,
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
  const markerRef = useRef<any>(null);
  const clickMarkerRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const originMarkerRef = useRef<any>(null);
  const destinationMarkerRef = useRef<any>(null);

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

  // Synchronize dynamic center and zoom properties together with smooth camera transition
  useEffect(() => {
    if (!mapInstance) return;

    const camera = mapInstance.getCamera();
    const currentCenter = camera.getTarget();
    const currentZoom = camera.getZoom();

    const centerChanged = center && (currentCenter.lat !== center.lat || currentCenter.lng !== center.lng);
    const zoomChanged = zoom !== undefined && currentZoom !== zoom;

    if (centerChanged || zoomChanged) {
      const targetLatLng = center
        ? new window.map4d.LatLng(center.lat, center.lng)
        : camera.getTarget();

      const targetZoom = zoom !== undefined ? zoom : currentZoom;

      const newCamera = new window.map4d.CameraPosition(
        targetLatLng,
        camera.getTilt(),
        camera.getBearing(),
        targetZoom
      );

      mapInstance.moveCamera(newCamera, { animate: true });
    }
  }, [center, zoom, mapInstance]);

  // Synchronize dynamic marker position
  useEffect(() => {
    if (!mapInstance) return;

    // Clear previous marker reference
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }

    if (markerPosition) {
      try {
        const marker = new window.map4d.Marker({
          position: new window.map4d.LatLng(markerPosition.lat, markerPosition.lng),
          title: 'Search Result',
          visible: true,
        });
        marker.setMap(mapInstance);
        markerRef.current = marker;
      } catch (err) {
        console.error('Failed to create Map4D Marker:', err);
      }
    }
  }, [markerPosition, mapInstance]);

  // Synchronize click marker position
  useEffect(() => {
    if (!mapInstance) return;

    // Clear previous click marker reference
    if (clickMarkerRef.current) {
      clickMarkerRef.current.setMap(null);
      clickMarkerRef.current = null;
    }

    if (clickMarker) {
      try {
        const marker = new window.map4d.Marker({
          position: new window.map4d.LatLng(clickMarker.lat, clickMarker.lng),
          title: 'Clicked Location',
          visible: true,
          iconView: `
            <div style="display: flex; flex-direction: column; align-items: center; width: 28px; height: 36px;">
              <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 0C6.27 0 0 6.27 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.27 21.73 0 14 0ZM14 19C11.24 19 9 16.76 9 14C9 11.24 11.24 9 14 9C16.76 9 19 11.24 19 14C19 16.76 16.76 19 14 19Z" fill="#6B7280" stroke="#FFFFFF" stroke-width="2"/>
              </svg>
            </div>
          `,
          anchor: { x: 0.5, y: 1.0 }
        });
        marker.setMap(mapInstance);
        clickMarkerRef.current = marker;
      } catch (err) {
        console.error('Failed to create Map4D Click Marker:', err);
      }
    }
  }, [clickMarker, mapInstance]);

  // Synchronize routing path (polyline) and bounds fitting
  useEffect(() => {
    if (!mapInstance) return;

    // 1. Clear previous polyline
    if (routePolylineRef.current) {
      routePolylineRef.current.setMap(null);
      routePolylineRef.current = null;
    }

    // 2. Clear previous origin/destination markers
    if (originMarkerRef.current) {
      originMarkerRef.current.setMap(null);
      originMarkerRef.current = null;
    }
    if (destinationMarkerRef.current) {
      destinationMarkerRef.current.setMap(null);
      destinationMarkerRef.current = null;
    }

    // 3. Draw new route if provided
    if (routePath && routePath.length > 0) {
      try {
        // Draw route polyline
        const pathLatLngs = routePath.map(
          (coord) => new window.map4d.LatLng(coord.lat, coord.lng)
        );

        const polyline = new window.map4d.Polyline({
          path: pathLatLngs,
          strokeColor: '#3b82f6', // Premium blue color
          strokeWidth: 6,
          strokeOpacity: 0.85,
        });

        polyline.setMap(mapInstance);
        routePolylineRef.current = polyline;

        // Draw origin marker
        if (originMarker) {
          const startMarker = new window.map4d.Marker({
            position: new window.map4d.LatLng(originMarker.lat, originMarker.lng),
            title: 'Origin',
            visible: true,
            iconView: `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 24px; height: 24px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#3b82f6" stroke-width="3" style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25));"/>
                  <circle cx="12" cy="12" r="5" fill="#3b82f6"/>
                </svg>
              </div>
            `,
            anchor: { x: 0.5, y: 0.5 }
          });
          startMarker.setMap(mapInstance);
          originMarkerRef.current = startMarker;
        }

        // Draw destination marker
        if (destinationMarker) {
          const endMarker = new window.map4d.Marker({
            position: new window.map4d.LatLng(destinationMarker.lat, destinationMarker.lng),
            title: 'Destination',
            visible: true,
            iconView: `
              <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 24px; height: 24px;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" fill="#FFFFFF" stroke="#ef4444" stroke-width="3" style="filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25));"/>
                  <circle cx="12" cy="12" r="5" fill="#ef4444"/>
                </svg>
              </div>
            `,
            anchor: { x: 0.5, y: 0.5 }
          });
          endMarker.setMap(mapInstance);
          destinationMarkerRef.current = endMarker;
        }

        // Fit Bounds to cover the complete route path
        const bounds = new window.map4d.LatLngBounds();
        routePath.forEach((coord) => {
          bounds.extend(new window.map4d.LatLng(coord.lat, coord.lng));
        });

        mapInstance.fitBounds(bounds);

      } catch (err) {
        console.error('Failed to draw Route Polyline and fit camera bounds:', err);
      }
    }
  }, [routePath, originMarker, destinationMarker, mapInstance]);

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
