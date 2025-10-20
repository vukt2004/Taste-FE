import React, { useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
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
}

const OpenStreetMap: React.FC<OpenStreetMapProps> = ({ onMapLoad, className = '', markers = [] }) => {
  const mapRef = useRef<L.Map | null>(null);

  // Tọa độ Hồ Chí Minh
  const center: [number, number] = [10.8231, 106.6297];
  const zoom = 13;

  const handleMapReady = () => {
    if (mapRef.current) {
      setTimeout(() => {
        if (mapRef.current) {
          mapRef.current.invalidateSize();
        }
      }, 0);
      onMapLoad?.(mapRef.current);
    }
  };

  return (
    <div className={`w-full h-full ${className}`} style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={handleMapReady}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Dynamic markers */}
        {markers.map((m, idx) => (
          <Marker key={`${m.lat}-${m.lng}-${idx}`} position={[m.lat, m.lng] as [number, number]}>
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
    </div>
  );
};

export default OpenStreetMap;
