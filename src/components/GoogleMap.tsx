import React, { useState, useEffect, useRef } from 'react';

interface GoogleMapProps {
  onMapLoad?: (mapInstance?: unknown) => void;
  className?: string;
  markers?: { lat: number; lng: number; title?: string; description?: string; type?: 'normal' | 'favourite' | 'blacklist'; restaurantId?: string }[];
  showCenterMarker?: boolean;
  onMarkerClick?: (lat: number, lng: number, title?: string, restaurantId?: string) => void;
  center?: [number, number]; // Tùy chọn: center từ bên ngoài
  zoom?: number; // Tùy chọn: zoom từ bên ngoài
}

interface MapState {
  center: [number, number];
  zoom: number;
}

// Component để tạo Google Maps Static URL với markers
const createGoogleMapsUrl = (center: [number, number], zoom: number, markers: { lat: number; lng: number; type?: string }[], size: string = '800x600'): string => {
  const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
  const params = new URLSearchParams({
    center: `${center[0]},${center[1]}`,
    zoom: zoom.toString(),
    size,
    maptype: 'roadmap',
    format: 'png',
    style: 'feature:all|element:labels|visibility:simplified', // Minimal style
    key: (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || 'YOUR_GOOGLE_MAPS_API_KEY'
  });

  // Thêm markers vào URL
  markers.forEach(marker => {
    let markerColor = 'red';
    if (marker.type === 'favourite') markerColor = 'yellow';
    if (marker.type === 'blacklist') markerColor = 'black';
    
    params.append('markers', `color:${markerColor}|${marker.lat},${marker.lng}`);
  });

  return `${baseUrl}?${params.toString()}`;
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
        {/* Location pin - inverted water drop */}
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

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  onMapLoad, 
  className = '', 
  markers = [], 
  showCenterMarker = false, 
  onMarkerClick,
  center: externalCenter,
  zoom: externalZoom
}) => {
  const [mapState, setMapState] = useState<MapState>({
    center: [10.8231, 106.6297], // Ho Chi Minh City coordinates
    zoom: 13
  });
  const [mapError, setMapError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);
  
  // Load saved map position from localStorage (chỉ khi không có props từ bên ngoài)
  useEffect(() => {
    if (externalCenter && externalZoom) {
      // Nếu có props từ bên ngoài, ưu tiên dùng props
      // Validate coordinates
      if (!isFinite(externalCenter[0]) || !isFinite(externalCenter[1]) || !isFinite(externalZoom)) {
        console.warn('🗺️ [GoogleMap] Props không hợp lệ, sử dụng mặc định');
        isInitialLoad.current = false;
        return;
      }
      
      setMapState({
        center: externalCenter,
        zoom: externalZoom
      });
      isInitialLoad.current = false;
      return;
    }
    
    const savedCenter = localStorage.getItem('map_center');
    const savedZoom = localStorage.getItem('map_zoom');
    
    if (savedCenter) {
      try {
        const [lat, lng] = JSON.parse(savedCenter);
        const zoom = savedZoom ? parseInt(savedZoom) : 13;
        
        // Validate coordinates
        if (!isFinite(lat) || !isFinite(lng) || !isFinite(zoom)) {
          console.warn('🗺️ [GoogleMap] Vị trí đã lưu không hợp lệ:', { lat, lng, zoom });
          isInitialLoad.current = false;
          return;
        }
        
        setMapState({
          center: [lat, lng],
          zoom: zoom
        });
        console.log('🗺️ [GoogleMap] Đã tải vị trí map đã lưu:', { lat, lng, zoom });
        isInitialLoad.current = false;
      } catch (e) {
        console.error('🗺️ [GoogleMap] Lỗi khi tải vị trí map đã lưu:', e);
        console.error('🗺️ [GoogleMap] savedCenter:', savedCenter);
        console.error('🗺️ [GoogleMap] savedZoom:', savedZoom);
        isInitialLoad.current = false;
      }
    } else {
      console.log('🗺️ [GoogleMap] Không có vị trí map đã lưu, sử dụng mặc định');
      isInitialLoad.current = false;
    }
  }, [externalCenter, externalZoom]);

  // Cập nhật mapState khi props thay đổi
  useEffect(() => {
    if (externalCenter && externalZoom) {
      // Validate coordinates
      if (!isFinite(externalCenter[0]) || !isFinite(externalCenter[1]) || !isFinite(externalZoom)) {
        console.warn('🗺️ [GoogleMap] Props không hợp lệ khi cập nhật');
        return;
      }
      
      setMapState({
        center: externalCenter,
        zoom: externalZoom
      });
    }
  }, [externalCenter, externalZoom]);

  // Lưu vị trí map khi mapState thay đổi (sau lần load đầu tiên)
  useEffect(() => {
    if (isInitialLoad.current) return; // Bỏ qua lần đầu load từ localStorage
    
    const [lat, lng] = mapState.center;
    const zoom = mapState.zoom;
    
    // Validate trước khi lưu
    if (!isFinite(lat) || !isFinite(lng) || !isFinite(zoom)) {
      console.warn('🗺️ [GoogleMap] Vị trí không hợp lệ, không lưu:', { lat, lng, zoom });
      return;
    }
    
    localStorage.setItem('map_center', JSON.stringify([lat, lng]));
    localStorage.setItem('map_zoom', zoom.toString());
    console.log('🗺️ [GoogleMap] Đã lưu vị trí map:', { lat, lng, zoom });
  }, [mapState]);

  // Call onMapLoad when component mounts
  useEffect(() => {
    if (onMapLoad) {
      onMapLoad(undefined); // Pass undefined since this component uses Google Maps Static API
    }
  }, [onMapLoad]);

  // Create Google Maps Static URL
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  
  // Validate API key
  useEffect(() => {
    console.log('Google Maps API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : 'Not found');
    if (!apiKey || apiKey === 'YOUR_GOOGLE_MAPS_API_KEY') {
      setMapError('Google Maps API key is not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file.');
    } else if (!apiKey.startsWith('AIza')) {
      setMapError('Invalid Google Maps API key format. API keys should start with "AIza".');
    } else {
      setMapError(null);
    }
  }, [apiKey]);
  
  const mapUrl = createGoogleMapsUrl(
    mapState.center, 
    showCenterMarker ? 18 : mapState.zoom, 
    markers,
    '1920x1080'
  );

  // Handle click on map to get coordinates (only when showCenterMarker = true)
  // Hoặc click vào marker overlay
  const handleMapClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Kiểm tra xem có click vào marker nào không
    const clickedMarker = markers.find(marker => {
      // Tính toán vị trí marker trên màn hình (simplified)
      const scale = Math.pow(2, mapState.zoom);
      const markerX = (marker.lng - mapState.center[1]) * scale * 256 + rect.width / 2;
      const markerY = (mapState.center[0] - marker.lat) * scale * 256 + rect.height / 2;
      
      // Kiểm tra xem click có trong vùng marker không (khoảng 20px radius)
      const distance = Math.sqrt(Math.pow(x - markerX, 2) + Math.pow(y - markerY, 2));
      return distance < 20;
    });
    
    if (clickedMarker && onMarkerClick && !showCenterMarker) {
      // Click vào marker
      onMarkerClick(clickedMarker.lat, clickedMarker.lng, clickedMarker.title, clickedMarker.restaurantId);
      return;
    }
    
    // Click vào map (chỉ khi showCenterMarker = true)
    if (showCenterMarker && onMarkerClick) {
      // Calculate coordinates from click position (simplified)
      const lat = mapState.center[0] + (y - rect.height / 2) * 0.0001;
      const lng = mapState.center[1] + (x - rect.width / 2) * 0.0001;
      
      onMarkerClick(lat, lng);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full ${className}`} 
      style={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}
      onClick={handleMapClick}
    >
      <img
        src={mapUrl}
        alt="Google Map"
        style={{ 
          width: '100%', 
          height: '100%', 
          objectFit: 'cover',
          cursor: showCenterMarker ? 'crosshair' : 'default'
        }}
        onError={(e) => {
          console.error('Failed to load Google Maps image:', e);
          setMapError('Failed to load map. Please check your Google Maps API key.');
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Show error message if map fails to load */}
      {mapError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-600"
        >
          <div className="text-center">
            <p className="text-lg font-semibold mb-2">Unable to load map</p>
            <p className="text-sm">{mapError}</p>
            <p className="text-xs mt-2 text-gray-500">
              Make sure to set VITE_GOOGLE_MAPS_API_KEY in your .env file
            </p>
          </div>
        </div>
      )}
      
      {showCenterMarker && <CenterMarker />}
    </div>
  );
};

export default GoogleMap;
