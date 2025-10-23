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
import { type RestaurantFilter, filterRestaurants, getRestaurantById } from './services/restaurant';

interface Restaurant {
  id: string;
  restaurantName: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  operatingHours?: string;
  amenities?: string;
  verificationStatus?: string;
  isActive?: boolean;
  isVerified?: boolean;
  canEdit?: boolean;
  ownerId?: string;
  ownerName?: string;
  isClaimed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showCenterMarker, setShowCenterMarker] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

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
    // Load restaurants based on filter
    const loadRestaurants = async () => {
      try {
        const response = await filterRestaurants(filter);
        if (response.isSuccess || response.success) {
          const restaurantData = response.data || [];
          setRestaurants(restaurantData);
        }
      } catch (error) {
        console.error('Error loading restaurants:', error);
      }
    };
    
    loadRestaurants();
  };

  const handleNavigateToRestaurant = (_restaurantId: string, lat: number, lng: number) => {
    if (map) {
      map.flyTo([lat, lng], 15, {
        duration: 1.5
      });
    }
  };

  const handleMarkerClick = async (lat: number, lng: number, title?: string) => {
    // Find restaurant by coordinates and title
    const restaurant = restaurants.find(r => 
      r.latitude === lat && 
      r.longitude === lng && 
      r.restaurantName === title
    );
    
    if (restaurant) {
      try {
        // Fetch full restaurant details
        const response = await getRestaurantById(restaurant.id);
        if (response.isSuccess && response.data) {
          setSelectedRestaurant(response.data);
        }
      } catch (error) {
        console.error('Error fetching restaurant details:', error);
        // Fallback to basic info if API fails
        setSelectedRestaurant(restaurant);
      }
    }
  };

  // Convert restaurants to markers format
  const markers = restaurants
    .filter(r => r.latitude && r.longitude)
    .map(r => ({
      lat: r.latitude!,
      lng: r.longitude!,
      title: r.restaurantName,
    }));

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <>
            {/* Map - luôn chiếm 100% màn hình */}
            <div className="fixed inset-0 z-0">
              <MapPage onMapLoad={handleMapLoad} showCenterMarker={showCenterMarker} markers={markers} onMarkerClick={handleMarkerClick} />
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
              selectedRestaurant={selectedRestaurant}
            />
          </>
        } />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route 
          path="/login" 
          element={
            <div className="min-h-screen flex items-center justify-center p-4">
              <div className="w-full max-w-md bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-6">
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
            </div>
          } 
        />
        <Route 
          path="/admin" 
          element={<AdminContributionsPage />} 
        />
        <Route 
          path="/admin/tools" 
          element={<AdminPage />} 
        />
      </Routes>
    </Router>
  );
}

export default App
