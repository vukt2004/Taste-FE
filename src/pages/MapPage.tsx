import React from 'react';
import OpenStreetMap from '../components/OpenStreetMap';
import L from 'leaflet';

interface MapPageProps {
  onMapLoad?: (map: L.Map) => void;
  showCenterMarker?: boolean;
}

const MapPage: React.FC<MapPageProps> = ({ onMapLoad, showCenterMarker }) => {
  return (
    <div className="h-full w-full">
      <OpenStreetMap onMapLoad={onMapLoad} showCenterMarker={showCenterMarker} />
    </div>
  );
};

export default MapPage;
