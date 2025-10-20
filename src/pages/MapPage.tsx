import React from 'react';
import OpenStreetMap from '../components/OpenStreetMap';
import L from 'leaflet';

interface MapPageProps {
  onMapLoad?: (map: L.Map) => void;
}

const MapPage: React.FC<MapPageProps> = ({ onMapLoad }) => {
  return (
    <div className="h-full w-full">
      <OpenStreetMap onMapLoad={onMapLoad} />
    </div>
  );
};

export default MapPage;
