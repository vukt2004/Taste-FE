import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthCallbackPage from './pages/AuthCallbackPage';
import Sidebar from './components/Sidebar';
import MapPage from './pages/MapPage';
import AdminPage from './pages/AdminPage';
import AdminContributionsPage from './pages/AdminContributionsPage';
import './App.css';
import L from 'leaflet';
import { type User } from './services/userService';
import { type RestaurantFilter } from './services/restaurant';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [restaurantFilter, setRestaurantFilter] = useState<RestaurantFilter>({});
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showCenterMarker, setShowCenterMarker] = useState(false);

  const handleMapLoad = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
    
    // Lấy center ban đầu
    const center = mapInstance.getCenter();
    setMapCenter({ lat: center.lat, lng: center.lng });
  }, []);

  // Setup event listener cho map moveend
  useEffect(() => {
    if (!map) return;
    
    const handleMoveEnd = () => {
      const newCenter = map.getCenter();
      setMapCenter({ lat: newCenter.lat, lng: newCenter.lng });
    };
    
    map.on('moveend', handleMoveEnd);
    
    // Cleanup khi component unmount hoặc map thay đổi
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map]);

  const handleFilterChange = (filter: RestaurantFilter) => {
    setRestaurantFilter(filter);
    // TODO: Truyền filter xuống MapPage để load restaurants
  };

  const handleNavigateToRestaurant = (_restaurantId: string, lat: number, lng: number) => {
    if (map) {
      map.flyTo([lat, lng], 15, {
        duration: 1.5
      });
    }
  };

  // TODO: Sử dụng restaurantFilter để load restaurants trên map
  void restaurantFilter;

  return (
    <Router>
      {/* Map - luôn chiếm 100% màn hình */}
      <div className="fixed inset-0 z-0">
        <MapPage onMapLoad={handleMapLoad} showCenterMarker={showCenterMarker} />
      </div>
      
      {/* Sidebar - overlay lên Map */}
      <Sidebar 
        user={user} 
        isOpen={sidebarOpen} 
        onToggle={() => setSidebarOpen((v) => !v)}
        onFilterChange={handleFilterChange}
        mapCenter={mapCenter}
        onUserChange={setUser}
        onNavigateToRestaurant={handleNavigateToRestaurant}
        onShowCenterMarkerChange={setShowCenterMarker}
      />
      
      {/* Content overlay */}
      <div className="fixed top-0 right-0 z-20 p-4">
        <Routes>
          <Route path="/" element={<div />} />
          <Route path="/auth/callback" element={<AuthCallbackPage />} />
          <Route 
            path="/login" 
            element={
              <div className="pointer-events-auto w-full max-w-md bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4 text-red-600">Đăng nhập thất bại</h2>
                <p className="text-gray-700 mb-4">
                  Có lỗi xảy ra khi đăng nhập với Google. Vui lòng thử lại.
                </p>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Quay về trang chủ
                </button>
              </div>
            } 
          />
          <Route 
            path="/admin" 
            element={
              <div className="pointer-events-auto w-full max-w-3xl h-full overflow-y-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                <AdminContributionsPage />
              </div>
            } 
          />
          <Route 
            path="/admin/tools" 
            element={
              <div className="pointer-events-auto w-full max-w-3xl h-full overflow-y-auto bg-white/95 backdrop-blur-sm rounded-lg shadow-lg">
                <AdminPage />
              </div>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App
