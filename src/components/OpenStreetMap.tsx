import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix cho default marker icons trong Leaflet
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface OpenStreetMapProps {
  onMapLoad?: (map: L.Map | undefined) => void;
  className?: string;
  markers?: { lat: number; lng: number; title?: string; description?: string; type?: 'normal' | 'favourite' | 'blacklist'; restaurantId?: string }[];
  showCenterMarker?: boolean;
  onMarkerClick?: (lat: number, lng: number, title?: string, restaurantId?: string) => void;
}

interface MapState {
  center: [number, number];
  zoom: number;
}

// Component để cập nhật vị trí map khi có vị trí đã lưu
const MapPositionUpdater: React.FC<{ center?: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  const hasUpdated = useRef(false);
  
  useEffect(() => {
    if (center && zoom && !hasUpdated.current) {
      // Kiểm tra xem vị trí hiện tại có khác với vị trí đã lưu không
      const currentCenter = map.getCenter();
      const currentZoom = map.getZoom();
      const distance = map.distance(currentCenter, L.latLng(center[0], center[1]));
      
      // Nếu vị trí khác đáng kể (hơn 100m) hoặc zoom khác, cập nhật
      if (distance > 100 || Math.abs(currentZoom - zoom) > 0) {
        map.setView(center, zoom, { animate: false });
        hasUpdated.current = true;
      }
    }
  }, [map, center, zoom]);
  
  return null;
};

// Component để theo dõi map center changes
const MapCenterTracker: React.FC<{ onMapLoad?: (map: L.Map) => void; onInitialPositionLoaded?: () => void }> = ({ onMapLoad, onInitialPositionLoaded }) => {
  const map = useMap();
  const shouldSavePosition = useRef(false);
  
  useEffect(() => {
    if (onMapLoad) {
      onMapLoad(map);
    }
    
    // Đợi một chút để đảm bảo vị trí đã lưu được tải trước
    const setupTimer = setTimeout(() => {
      shouldSavePosition.current = true;
      if (onInitialPositionLoaded) {
        onInitialPositionLoaded();
      }
    }, 500);
    
    // Save map position to localStorage when map moves or zooms
    const saveMapPosition = () => {
      if (!shouldSavePosition.current) {
        return;
      }
      
      const center = map.getCenter();
      const zoom = map.getZoom();
      
      // Kiểm tra xem vị trí có hợp lệ không
      if (!center || !isFinite(center.lat) || !isFinite(center.lng)) {
        return;
      }
      
      localStorage.setItem('map_center', JSON.stringify([center.lat, center.lng]));
      localStorage.setItem('map_zoom', zoom.toString());
    };
    
    const handleMoveEnd = () => {
      saveMapPosition();
    };
    
    const handleZoomEnd = () => {
      saveMapPosition();
    };
    
    map.on('moveend', handleMoveEnd);
    map.on('zoomend', handleZoomEnd);
    
    return () => {
      clearTimeout(setupTimer);
      map.off('moveend', handleMoveEnd);
      map.off('zoomend', handleZoomEnd);
    };
  }, [map, onMapLoad, onInitialPositionLoaded]);
  
  return null;
};

// Component để xử lý click events trên map
const MapClickHandler: React.FC<{ 
  showCenterMarker: boolean; 
  onMarkerClick?: (lat: number, lng: number, title?: string) => void 
}> = ({ showCenterMarker, onMarkerClick }) => {
  useMapEvents({
    click: (e) => {
      if (showCenterMarker && onMarkerClick) {
        onMarkerClick(e.latlng.lat, e.latlng.lng);
      }
    }
  });
  
  return null;
};

// Component để hiển thị marker ở giữa màn hình
const CenterMarker: React.FC = () => {
  const map = useMap();
  const [position, setPosition] = useState<L.LatLng>(map.getCenter());
  
  useEffect(() => {
    const updatePosition = () => {
      setPosition(map.getCenter());
    };
    
    map.on('move', updatePosition);
    map.on('zoom', updatePosition);
    
    return () => {
      map.off('move', updatePosition);
      map.off('zoom', updatePosition);
    };
  }, [map]);
  
  return (
    <Marker 
      position={position} 
      icon={L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [35, 55],
        iconAnchor: [17, 55],
        popupAnchor: [0, -55],
        shadowSize: [41, 41]
      })}
      interactive={false}
    />
  );
};

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ 
  onMapLoad, 
  className = '', 
  markers = [], 
  showCenterMarker = false, 
  onMarkerClick 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapState, setMapState] = useState<MapState>({
    center: [10.8231, 106.6297],
    zoom: 13
  });

  const hasLoadedInitialPosition = useRef(false);
  
  // Load saved map position from localStorage
  useEffect(() => {
    const savedCenter = localStorage.getItem('map_center');
    const savedZoom = localStorage.getItem('map_zoom');
    
    if (savedCenter) {
      try {
        const [lat, lng] = JSON.parse(savedCenter);
        const zoom = savedZoom ? parseInt(savedZoom) : 13;
        
        // Validate coordinates
        if (!isFinite(lat) || !isFinite(lng) || !isFinite(zoom)) {
          hasLoadedInitialPosition.current = true;
          return;
        }
        
        setMapState({
          center: [lat, lng],
          zoom: zoom
        });
        hasLoadedInitialPosition.current = true;
      } catch {
        hasLoadedInitialPosition.current = true;
      }
    } else {
      hasLoadedInitialPosition.current = true;
    }
  }, []);

  // Tính zoom level dựa trên showCenterMarker
  const mapZoom = showCenterMarker ? 18 : mapState.zoom;

  // Tạo custom icon dựa trên type
  const createCustomIcon = (type?: 'normal' | 'favourite' | 'blacklist') => {
    let iconColor = 'red';
    if (type === 'favourite') iconColor = 'gold';
    if (type === 'blacklist') iconColor = 'black';
    
    return L.icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [35, 55],
      iconAnchor: [17, 55],
      popupAnchor: [0, -55],
      shadowSize: [41, 41]
    });
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}
    >
      <MapContainer
        center={mapState.center}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', cursor: showCenterMarker ? 'crosshair' : 'default' }}
        scrollWheelZoom={true}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Component để cập nhật vị trí map khi có vị trí đã lưu */}
        <MapPositionUpdater center={mapState.center} zoom={mapState.zoom} />
        
        <MapCenterTracker onMapLoad={onMapLoad} />
        <MapClickHandler showCenterMarker={showCenterMarker} onMarkerClick={onMarkerClick} />
        
        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={[marker.lat, marker.lng]}
            icon={createCustomIcon(marker.type)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick && !showCenterMarker) {
                  onMarkerClick(marker.lat, marker.lng, marker.title, marker.restaurantId);
                }
              }
            }}
          >
            {(marker.title || marker.description) && (
              <Popup>
                <div>
                  {marker.title && <div className="font-bold text-sm">{marker.title}</div>}
                  {marker.description && <div className="text-xs text-gray-600">{marker.description}</div>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
        
        {/* Show center marker if needed */}
        {showCenterMarker && <CenterMarker />}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap;

