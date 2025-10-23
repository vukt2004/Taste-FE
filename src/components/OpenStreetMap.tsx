import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix cho default markers của Leaflet
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface OpenStreetMapProps {
  onMapLoad?: (map: L.Map) => void;
  className?: string;
  markers?: { lat: number; lng: number; title?: string; description?: string }[];
  showCenterMarker?: boolean;
  onMarkerClick?: (lat: number, lng: number, title?: string) => void;
}

// Component con để lấy map instance và gọi onMapLoad
const MapInstanceHandler: React.FC<{ onMapLoad?: (map: L.Map) => void; showCenterMarker?: boolean }> = ({ onMapLoad, showCenterMarker }) => {
  const map = useMap();

  React.useEffect(() => {
    if (map && onMapLoad) {
      onMapLoad(map);
    }
  }, [map, onMapLoad]);

  // Load saved map position from localStorage
  React.useEffect(() => {
    if (map) {
      const savedCenter = localStorage.getItem('map_center');
      const savedZoom = localStorage.getItem('map_zoom');
      
      if (savedCenter) {
        try {
          const [lat, lng] = JSON.parse(savedCenter);
          map.setView([lat, lng], savedZoom ? parseInt(savedZoom) : map.getZoom());
        } catch (e) {
          console.error('Failed to load saved map position:', e);
        }
      }
    }
  }, [map]);

  // Save map position when it changes
  React.useEffect(() => {
    if (map) {
      const savePosition = () => {
        const center = map.getCenter();
        const zoom = map.getZoom();
        localStorage.setItem('map_center', JSON.stringify([center.lat, center.lng]));
        localStorage.setItem('map_zoom', zoom.toString());
      };

      map.on('moveend', savePosition);
      map.on('zoomend', savePosition);

      return () => {
        map.off('moveend', savePosition);
        map.off('zoomend', savePosition);
      };
    }
  }, [map]);

  // Zoom to nhất và khóa bản đồ khi showCenterMarker = true
  React.useEffect(() => {
    if (map && showCenterMarker) {
      // Zoom to nhất (level 18)
      map.setZoom(18);
      
      // Disable zoom controls (nhưng vẫn cho phép drag)
      map.touchZoom.disable();
      map.doubleClickZoom.disable();
      map.scrollWheelZoom.disable();
      map.boxZoom.disable();
      map.keyboard.disable();
      
      // Disable zoom buttons
      if (map.zoomControl) {
        map.removeControl(map.zoomControl);
      }
    } else if (map && !showCenterMarker) {
      // Enable lại các controls khi không ở chế độ chọn vị trí
      map.dragging.enable();
      map.touchZoom.enable();
      map.doubleClickZoom.enable();
      map.scrollWheelZoom.enable();
      map.boxZoom.enable();
      map.keyboard.enable();
    }
  }, [map, showCenterMarker]);

  return null;
};

// Component để hiển thị marker ở giữa màn hình
const CenterMarker: React.FC = () => {
  return (
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none">
      <svg 
        width="50" 
        height="50" 
        viewBox="0 0 24 24" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Location pin - giọt nước ngược */}
        <path 
          d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z" 
          fill="#3B82F6" 
          stroke="white" 
          strokeWidth="1.5"
        />
        {/* Inner circle */}
        <circle cx="12" cy="9" r="3" fill="white" />
      </svg>
    </div>
  );
};

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ onMapLoad, className = '', markers = [], showCenterMarker = false, onMarkerClick }) => {
  // Tọa độ Hồ Chí Minh
  const center: [number, number] = [10.8231, 106.6297];
  const zoom = 13;

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100vh', width: '100vw' }}
      >
        <MapInstanceHandler onMapLoad={onMapLoad} showCenterMarker={showCenterMarker} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Dynamic markers */}
        {markers.map((m, idx) => (
          <Marker 
            key={`${m.lat}-${m.lng}-${idx}`} 
            position={[m.lat, m.lng] as [number, number]}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(m.lat, m.lng, m.title);
                }
              }
            }}
          >
            {(m.title || m.description) && (
              <Popup>
                <div className="text-center">
                  {m.title && <h3 className="font-bold text-lg">{m.title}</h3>}
                  {m.description && <p className="text-sm text-gray-600">{m.description}</p>}
                </div>
              </Popup>
            )}
          </Marker>
        ))}
      </MapContainer>
      {showCenterMarker && <CenterMarker />}
    </div>
  );
};

export default OpenStreetMap;
