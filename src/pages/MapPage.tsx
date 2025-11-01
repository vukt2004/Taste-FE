import React from 'react';
import OpenStreetMap from '../components/OpenStreetMap';
import L from 'leaflet';

interface MapPageProps {
  onMapLoad?: (map: L.Map | undefined) => void;
  showCenterMarker?: boolean;
  markers?: { lat: number; lng: number; title?: string; description?: string; type?: 'normal' | 'favourite' | 'blacklist'; restaurantId?: string }[];
  onMarkerClick?: (lat: number, lng: number, title?: string, restaurantId?: string) => void;
}

const MapPage: React.FC<MapPageProps> = ({ onMapLoad, showCenterMarker, markers = [], onMarkerClick }) => {
  return (
    <div className="h-full w-full">
      <OpenStreetMap onMapLoad={onMapLoad} showCenterMarker={showCenterMarker} markers={markers} onMarkerClick={onMarkerClick} />
    </div>
  );
};

export default MapPage;
