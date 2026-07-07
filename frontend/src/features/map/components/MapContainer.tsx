import React, { useEffect, useRef, useState } from 'react';
import { MAP4D_CONFIG } from '@/config/map.config';
import { loadMap4dSDK } from '@/utils/map.helper';
import { type POIData } from '@/services/supabase/poi.service';

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
  onPoiClick?: (poi: POIData) => void;
  onMapReady?: (map: any) => void;
  onMapClick?: (latLng: MapCoordinate) => void;
  onCameraMove?: (camera: any) => void;
  onZoomChanged?: (zoom: number) => void;
  onBuiltInPoiClick?: (poi: any) => void;
  onPlaceClick?: (place: any) => void;
  onMapEvent?: (eventName: string, args: any) => void;
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
  onPoiClick,
  onMapReady,
  onMapClick,
  onCameraMove,
  onZoomChanged,
  onBuiltInPoiClick,
  onPlaceClick,
  onMapEvent,
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
  const poiOverlayRef = useRef<any>(null);
  const customPoiByDbIdRef = useRef<Map<string, { engineId: number; standalonePoi: any; poi: any }>>(new Map());
  const customPoiByEngineIdRef = useRef<Map<number, any>>(new Map());

  const onPoiClickRef = useRef(onPoiClick);
  const onBuiltInPoiClickRef = useRef(onBuiltInPoiClick);
  const onPlaceClickRef = useRef(onPlaceClick);
  const onMapEventRef = useRef(onMapEvent);

  const markerPositionRef = useRef(markerPosition);
  useEffect(() => {
    markerPositionRef.current = markerPosition;
  }, [markerPosition]);

  // Keep callback refs updated to prevent marker/POI recreations
  useEffect(() => {
    onPoiClickRef.current = onPoiClick;
  }, [onPoiClick]);

  useEffect(() => {
    onBuiltInPoiClickRef.current = onBuiltInPoiClick;
  }, [onBuiltInPoiClick]);

  useEffect(() => {
    onPlaceClickRef.current = onPlaceClick;
  }, [onPlaceClick]);

  useEffect(() => {
    onMapEventRef.current = onMapEvent;
  }, [onMapEvent]);

  // Initialize SDK
  useEffect(() => {
    loadMap4dSDK(MAP4D_CONFIG.mapApiKey, MAP4D_CONFIG.sdkVersion)
      .then(() => {
        if (window.map4d && !window.map4d.Size) {
          window.map4d.Size = function (this: any, width: number, height: number) {
            this.width = width;
            this.height = height;
          };
        }
        setLoading(false);
      })
      .catch((err) => {
        console.warn('Map4D Web SDK failed to load with mapApiKey, retrying with apiSecretKey...', err);
        // Fallback retry using verified apiSecretKey
        loadMap4dSDK(MAP4D_CONFIG.apiSecretKey, MAP4D_CONFIG.sdkVersion)
          .then(() => {
            if (window.map4d && !window.map4d.Size) {
              window.map4d.Size = function (this: any, width: number, height: number) {
                this.width = width;
                this.height = height;
              };
            }
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
      (window as any).map = map;
      setMapInstance(map);

      // Enable built-in POIs
      map.setPOIsEnabled(true);
      console.log('Built-in POIs status (isPOIsEnabled):', map.isPOIsEnabled());



      // Trigger callback with map instance
      if (onMapReady) {
        onMapReady(map);
      }

      // Register a single unified map-level click listener for all interactive target types
      map.addListener('click', (args: any) => {
        console.log('[Map Event - Unified Click] Click arguments received:', args);

        // 1. Check if a custom Database POI or built-in POI was clicked
        if (args && args.poi) {
          const clickedPoi = args.poi;
          const customPoiMapping = customPoiByEngineIdRef.current.get(clickedPoi.id);

          if (customPoiMapping) {
            const dbPoi = customPoiMapping.poi;
            console.log('[Map Event] Custom Database POI clicked:', dbPoi.id, dbPoi.name);
            if (onPoiClickRef.current) {
              onPoiClickRef.current({
                id: dbPoi.id,
                name: dbPoi.name || '',
                name_en: dbPoi.name_en || null,
                poi_type: dbPoi.poi_type || 'TOURISM',
                lat: Number(dbPoi.lat),
                lng: Number(dbPoi.lng),
                dia_chi: dbPoi.dia_chi || null
              });
            }
            return;
          } else if (clickedPoi.id && typeof clickedPoi.id === 'string' && clickedPoi.id.startsWith('database-poi-')) {
            // Keep prefix fallback support for legacy components/tests
            const dbId = clickedPoi.id.replace('database-poi-', '');
            
            const poiName = clickedPoi.title || (typeof clickedPoi.getTitle === 'function' ? clickedPoi.getTitle() : '') || clickedPoi.name || '';
            const rawLat = clickedPoi.position?.lat ?? (typeof clickedPoi.getPosition === 'function' ? (typeof clickedPoi.getPosition().lat === 'function' ? clickedPoi.getPosition().lat() : clickedPoi.getPosition().lat) : args.location?.lat);
            const rawLng = clickedPoi.position?.lng ?? (typeof clickedPoi.getPosition === 'function' ? (typeof clickedPoi.getPosition().lng === 'function' ? clickedPoi.getPosition().lng() : clickedPoi.getPosition().lng) : args.location?.lng);
            
            const poiLat = rawLat ?? 0;
            const poiLng = rawLng ?? 0;

            console.log('[Map Event] Database POI clicked (Legacy prefix match):', dbId, poiName);
            if (onPoiClickRef.current) {
              onPoiClickRef.current({
                id: dbId,
                name: poiName,
                name_en: clickedPoi.name_en || null,
                poi_type: clickedPoi.type || clickedPoi.poi_type || 'TOURISM',
                lat: Number(poiLat),
                lng: Number(poiLng),
                dia_chi: clickedPoi.dia_chi || null
              });
            }
            return;
          } else {
            const poiName = clickedPoi.name || clickedPoi.title || (typeof clickedPoi.getTitle === 'function' ? clickedPoi.getTitle() : '') || '';
            const rawLat = clickedPoi.location?.lat ?? clickedPoi.position?.lat ?? (typeof clickedPoi.getPosition === 'function' ? (typeof clickedPoi.getPosition().lat === 'function' ? clickedPoi.getPosition().lat() : clickedPoi.getPosition().lat) : args.location?.lat);
            const rawLng = clickedPoi.location?.lng ?? clickedPoi.position?.lng ?? (typeof clickedPoi.getPosition === 'function' ? (typeof clickedPoi.getPosition().lng === 'function' ? clickedPoi.getPosition().lng() : clickedPoi.getPosition().lng) : args.location?.lng);
            
            const poiLat = rawLat ?? 0;
            const poiLng = rawLng ?? 0;

            console.log('[Map Event] Built-in base POI clicked:', poiName);
            if (onBuiltInPoiClickRef.current) {
              const projection = typeof map.getProjection === 'function' ? map.getProjection() : (map.projection || null);
              let pixel = { x: 0, y: 0 };
              if (projection && args.location) {
                const screenPt = projection.fromLatLngToScreen(args.location);
                if (screenPt) {
                  pixel = { x: screenPt.x, y: screenPt.y };
                }
              } else if (args.pixel) {
                pixel = args.pixel;
              }
              onBuiltInPoiClickRef.current({
                id: clickedPoi.id || '',
                name: poiName,
                type: clickedPoi.type || 'POI',
                lat: Number(poiLat),
                lng: Number(poiLng),
                pixel,
                metadata: clickedPoi
              });
            }
            return;
          }
        }

        // 2. Check if a Place was clicked
        if (args && args.place) {
          const place = args.place;
          console.log('[Map Event] Place clicked:', place.name);

          if (onPlaceClickRef.current) {
            onPlaceClickRef.current({
              id: place.id || '',
              name: place.name || '',
              lat: place.location ? place.location.lat : 0,
              lng: place.location ? place.location.lng : 0,
              metadata: place
            });
          }
          return;
        }

        // 3. Fallback to general blank map canvas click
        if (args && args.location && onMapClick) {
          onMapClick({
            lat: args.location.lat,
            lng: args.location.lng,
          });
        }
      }, { marker: true, mappoi: true, place: true, poi: true });

      // Helper to register general Map events safely
      const bindMapEvent = (eventName: string, sdkEventName: string) => {
        try {
          map.addListener(sdkEventName, (args: any) => {
            console.log(`[Map Event - SDK: ${sdkEventName}] ${eventName} triggered`, args);
            if (onMapEventRef.current) {
              onMapEventRef.current(eventName, args);
            }
          });
        } catch (e) {
          console.warn(`Failed to bind map general event ${sdkEventName}:`, e);
        }
      };

      // Register only supported general map interaction events
      bindMapEvent('click', 'click');
      bindMapEvent('hover', 'hover');
      bindMapEvent('drag', 'drag');

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
      });

    } catch (err: any) {
      console.error('Failed to initialize Map4D map:', err);
      setError('Error initializing Map4D instance.');
    }

    // Cleanup listeners or map instances if needed
    return () => {
      // Map4D listeners do not require explicit cleanup if the container DOM is deleted
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, error, mapInstance]);

  // Synchronize POIOverlay lifecycle with mapInstance
  useEffect(() => {
    if (!mapInstance) return;

    // Create POIOverlay for Database POIs
    const overlay = new window.map4d.POIOverlay({
      getUrl: (x: number, y: number, zoom: number) => {
        return `${MAP4D_CONFIG.backendUrl}/api/pois/tile/${x}/${y}/${zoom}`;
      },
      parserData: (response: any) => {
        let data = response;
        if (typeof response === 'string') {
          try {
            data = JSON.parse(response);
          } catch (e) {
            console.error('Failed to parse tile POI JSON:', e);
          }
        }
        const items = Array.isArray(data) ? data : (data?.pois || []);
        const standardPois: any[] = [];

        items.forEach((poi: any) => {
          // Log required by the verification checklist
          console.log("POI ICON DEBUG:", poi.iconUrl, poi.icon);

          const resolvedIcon = resolvePoiIcon(poi);
          const poiProps = {
            id: poi.id,
            position: {
              lat: Number(poi.lat),
              lng: Number(poi.lng)
            },
            title: poi.name,
            name_en: poi.name_en || null,
            titleColor: poi.poi_type === 'TOURISM' ? '#f97316' : (poi.poi_type === 'OCOP_STORE' ? '#353e45ff' : (poi.poi_type === 'MARKET' ? '#8b5cf6' : '#3b82f6')),
            type: poi.poi_type,
            poi_type: poi.poi_type,
            dia_chi: poi.dia_chi || null,
            icon: resolvedIcon,
            anchor: { x: 0.5, y: 1.0 }
          };

          // If the icon is an external HTTP URL (like from Supabase), Map4D POIOverlay will ignore it
          // We must render it as a standalone map4d.POI object instead to support custom images
          if (resolvedIcon && resolvedIcon.startsWith('http')) {
            if (!customPoiByDbIdRef.current.has(poi.id)) {
              const standalonePoi = new window.map4d.POI({
                ...poiProps,
                visible: true
              });
              standalonePoi.setMap(mapInstance);
              const engineId = standalonePoi.id;
              
              const mapping = { engineId, standalonePoi, poi };
              customPoiByDbIdRef.current.set(poi.id, mapping);
              customPoiByEngineIdRef.current.set(engineId, mapping);
              
              console.log(`[Standalone POI Map] Mapped database POI "${poi.name}" (ID: ${poi.id}) to engine ID: ${engineId}`);
            }
          } else {
            // Otherwise, let POIOverlay handle it using vector style textures
            standardPois.push(poiProps);
          }
        });

        return standardPois;
      },
      prefixId: 'database-poi-',
      visible: true
    });

    overlay.setMap(mapInstance);
    poiOverlayRef.current = overlay;
    
    const customPoiByDbId = customPoiByDbIdRef.current;
    const customPoiByEngineId = customPoiByEngineIdRef.current;

    return () => {
      if (poiOverlayRef.current) {
        poiOverlayRef.current.setMap(null);
        poiOverlayRef.current = null;
      }
      // Also clear custom standalone POIs
      customPoiByDbId.forEach(mapping => {
        mapping.standalonePoi.setMap(null);
      });
      customPoiByDbId.clear();
      customPoiByEngineId.clear();
    };
  }, [mapInstance]);

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

function getPoiMarkerIconDataUri(poiType: string, zoom: number): string {
  const svgHtml = getPoiMarkerIcon(poiType, zoom);
  const svgMatch = svgHtml.match(/<svg[\s\S]*?<\/svg>/);
  if (svgMatch) {
    const svg = svgMatch[0];
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }
  return '';
}

function resolvePoiIcon(poi: any): string {
  if (poi.iconUrl) {
    console.log(`[Icon Resolution] POI "${poi.name || poi.title}" (ID: ${poi.id}) resolved via iconUrl: ${poi.iconUrl}`);
    return poi.iconUrl;
  }

  if (poi.icon) {
    const baseUrl = MAP4D_CONFIG.backendUrl;
    const separator = (baseUrl.endsWith('/') || poi.icon.startsWith('/')) ? '' : '/';
    const relativeUrl = `${baseUrl}${separator}${poi.icon}`;
    console.log(`[Icon Resolution] POI "${poi.name || poi.title}" (ID: ${poi.id}) resolved via icon (relative path): ${relativeUrl}`);
    return relativeUrl;
  }

  const fallback = getPoiMarkerIconDataUri(poi.poi_type || poi.type, 16);
  console.log(`[Icon Resolution] POI "${poi.name || poi.title}" (ID: ${poi.id}) resolved via fallback (poi_type: ${poi.poi_type || poi.type})`);
  return fallback;
}

export default MapContainer;
