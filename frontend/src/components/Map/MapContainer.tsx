import React, { useEffect, useRef, useState } from 'react';
import { MAP4D_CONFIG } from '../../config/map.config';
import { loadMap4dSDK } from '../../utils/map.helper';
import { type POIData } from '../../services/poi.service';

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
  pois?: POIData[] | null;
  onPoiClick?: (poi: POIData) => void;
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
  pois = null,
  onPoiClick,
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
  const poisMarkersRef = useRef<any[]>([]);
  const onPoiClickRef = useRef(onPoiClick);

  const markerPositionRef = useRef(markerPosition);
  useEffect(() => {
    markerPositionRef.current = markerPosition;
  }, [markerPosition]);

  // Keep callback ref updated to prevent marker recreations
  useEffect(() => {
    onPoiClickRef.current = onPoiClick;
  }, [onPoiClick]);

  // Keep track of current zoom to avoid redundant setIconView calls
  const lastScaleZoomRef = useRef<number | null>(null);

  const updateMarkersScale = (currentZoom: number) => {
    let scaleCategory = 1;
    if (currentZoom < 12) {
      scaleCategory = 0;
    } else if (currentZoom > 15) {
      scaleCategory = 2;
    }

    if (lastScaleZoomRef.current === scaleCategory) return;
    lastScaleZoomRef.current = scaleCategory;

    poisMarkersRef.current.forEach((marker) => {
      if (marker && marker.poiData) {
        marker.setIconView(getPoiMarkerIcon(marker.poiData.poi_type, currentZoom));
      }
    });
  };

  const resolveMarkerCollisions = () => {
    if (!mapInstance || poisMarkersRef.current.length === 0) return;

    try {
      console.log("MapInstance prototype:", Object.getPrototypeOf(mapInstance));
      console.log("MapInstance keys:", Object.keys(mapInstance));
      if (window.map4d) {
        console.log("window.map4d keys:", Object.keys(window.map4d));
      }

      // Check if mapInstance has getProjection or projection or similar
      const projection = typeof mapInstance.getProjection === 'function' 
        ? mapInstance.getProjection() 
        : (mapInstance.projection || null);

      if (!projection) {
        console.warn("Projection not found on mapInstance. Available methods:", Object.getOwnPropertyNames(Object.getPrototypeOf(mapInstance)));
        return;
      }

      const currentMarkerPosition = markerPositionRef.current;

      const markersWithPoints = poisMarkersRef.current.map((marker) => {
        const pos = marker.getPosition();
        const pt = projection.fromLatLngToScreen(pos);
        
        let priority = 1;
        const poiType = marker.poiData?.poi_type;
        if (poiType === 'TOURISM') {
          priority = 3;
        } else if (poiType === 'OCOP_STORE') {
          priority = 2;
        }
        
        const isSelected = currentMarkerPosition && 
          Math.abs(pos.lat - currentMarkerPosition.lat) < 1e-6 && 
          Math.abs(pos.lng - currentMarkerPosition.lng) < 1e-6;
        if (isSelected) {
          priority = 100;
        }

        return {
          marker,
          pt,
          priority,
          visible: true,
        };
      });

      const collisionRadius = 24;
      markersWithPoints.sort((a, b) => b.priority - a.priority);

      const visiblePoints: { x: number; y: number }[] = [];

      markersWithPoints.forEach((item) => {
        if (!item.pt) return;
        
        const collides = visiblePoints.some((vp) => {
          const dx = vp.x - item.pt.x;
          const dy = vp.y - item.pt.y;
          return Math.sqrt(dx * dx + dy * dy) < collisionRadius;
        });

        if (collides && item.priority < 100) {
          item.visible = false;
        } else {
          visiblePoints.push(item.pt);
        }
      });

      markersWithPoints.forEach((item) => {
        item.marker.setVisible(item.visible);
        item.marker.setZIndex(item.priority);
      });
    } catch (e) {
      console.error("Error resolving marker collisions:", e);
    }
  };

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
        const currentZoom = camera.getZoom();
        if (onCameraMove) {
          onCameraMove(camera);
        }
        if (onZoomChanged) {
          onZoomChanged(currentZoom);
        }
        updateMarkersScale(currentZoom);
        resolveMarkerCollisions();
      });

      // Register map-level click listener for custom marker selection
      map.addListener('click', (args: any) => {
        if (args && args.marker) {
          const poi = args.marker.poiData;
          if (poi && onPoiClickRef.current) {
            onPoiClickRef.current(poi);
          }
        }
      }, { marker: true });

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

  // Synchronize dynamic database POI markers
  useEffect(() => {
    if (!mapInstance) return;

    // 1. Clear previous database markers
    poisMarkersRef.current.forEach((marker) => {
      marker.setMap(null);
    });
    poisMarkersRef.current = [];

    // 2. Render new database markers if provided
    if (pois && pois.length > 0) {
      const markers: any[] = [];
      const currentZoom = mapInstance.getCamera().getZoom();
      pois.forEach((poi) => {
        try {
          const marker = new window.map4d.Marker({
            position: new window.map4d.LatLng(poi.lat, poi.lng),
            title: poi.name,
            visible: true,
            iconView: getPoiMarkerIcon(poi.poi_type, currentZoom),
            anchor: { x: 0.5, y: 1.0 },
          });
          // Attach custom property to marker for identifying it in the markerClick listener
          marker.poiData = poi;
          marker.setMap(mapInstance);
          markers.push(marker);
        } catch (err) {
          console.error(`Failed to render POI marker for ${poi.name}:`, err);
        }
      });
      poisMarkersRef.current = markers;
      resolveMarkerCollisions();
    }

    return () => {
      // Clean up markers if component unmounts
      poisMarkersRef.current.forEach((marker) => {
        marker.setMap(null);
      });
      poisMarkersRef.current = [];
    };
  }, [pois, mapInstance]);

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

function getPoiMarkerIcon(poiType: string, zoom: number): string {
  let scale = 1.0;
  if (zoom < 12) {
    scale = 0.8;
  } else if (zoom > 15) {
    scale = 1.1;
  }

  // Base dimensions optimized by 25% to reduce overlap and improve clutter handling
  const baseWidth = 24;
  const baseHeight = 33;

  const w = Math.round(baseWidth * scale);
  const h = Math.round(baseHeight * scale);

  let color = '#3b82f6'; // Default
  let innerIcon = ''; // SVG path definition
  
  if (poiType === 'TOURISM') {
    color = '#f97316'; // Orange / Tourism
    innerIcon = `
      <path d="M12 10.5L11.2 12H9C7.9 12 7 12.9 7 14V20C7 21.1 7.9 22 9 22H23C24.1 22 25 21.1 25 20V14C25 12.9 24.1 12 23 12H20.8L20 10.5H12ZM16 20C13.8 20 12 18.2 12 16C12 13.8 13.8 12 16 12C18.2 12 20 13.8 20 16C20 18.2 18.2 20 16 20ZM16 14C14.9 14 14 14.9 14 16C14 17.1 14.9 18 16 18C17.1 18 18 17.1 18 16C18 14.9 17.1 14 16 14Z" fill="#FFFFFF"/>
    `;
  } else if (poiType === 'OCOP_STORE') {
    color = '#10b981'; // Green / Emerald
    innerIcon = `
      <path d="M20 6H17C17 3.24 14.76 1 12 1C9.24 1 7 3.24 7 6H4C2.9 6 2 6.9 2 8V20C2 21.1 2.9 22 4 22H20C21.1 22 22 21.1 22 20V8C22 6.9 21.1 6H20ZM12 3C13.66 3 15 4.34 15 6H9C9 4.34 10.34 3 12 3ZM20 20H4V8H20V20ZM12 10C9.79 10 8 11.79 8 14C8 16.21 9.79 18 12 18C14.21 18 16 16.21 16 14C16 11.79 14.21 10 12 10ZM12 16C10.9 16 10 15.1 10 14C10 12.9 10.9 12 12 12C13.1 12 14 12.9 14 14C14 15.1 13.1 16 12 16Z" fill="#FFFFFF"/>
    `;
  } else if (poiType === 'MARKET') {
    color = '#8b5cf6'; // Purple
    innerIcon = `
      <path d="M18.14 11H19.78C20.67 11 21.34 11.83 21.16 12.7L19.46 20.35C19.3 21.05 18.68 21.55 17.96 21.55H6.04C5.32 21.55 4.7 21.05 4.54 20.35L2.84 12.7C2.66 11.83 3.33 11 4.22 11H5.86L10.59 2.5C10.96 1.83 11.96 1.83 12.33 2.5L17.06 11ZM12 4.4L8.3 11H15.7L12 4.4ZM11 15H13V19H11V15ZM7 15H9V19H7V15ZM15 15H17V19H15V15Z" fill="#FFFFFF"/>
    `;
  } else {
    color = '#6b7280'; // Gray fallback
    innerIcon = `
      <circle cx="12" cy="12" r="5" fill="#FFFFFF"/>
    `;
  }

  // Div dimensions must match scaled width/height exactly for precise Map4D bottom-center anchor positioning
  return `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${w}px; height: ${h}px; filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.35)); margin: 0; padding: 0; overflow: visible;">
      <svg width="${w}" height="${h}" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block;">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 28 16 42 16 42C16 42 32 28 32 16C32 7.16 24.84 0 16 0Z" fill="${color}" stroke="#FFFFFF" stroke-width="2"/>
        <g transform="translate(4, 4)">
          ${innerIcon}
        </g>
      </svg>
    </div>
  `;
}

export default MapContainer;
