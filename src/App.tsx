import { useState, useCallback, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthCallbackPage from './pages/AuthCallbackPage';
import Sidebar from './components/Sidebar';
import MapPage from './pages/MapPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminContributionsPage from './pages/admin/ContributionsPage';
import AdminOwnershipRequestsPage from './pages/admin/OwnershipRequestsPage';
import AdminNavbar from './components/AdminNavbar';
import './App.css';
import L from 'leaflet';
import { type User } from './services/userService';
import { type RestaurantFilter, filterRestaurants, getRestaurantById } from './services/restaurant';
import { listAmenities } from './services/amenity';
import { listDishes } from './services/dish';
import { listDishTypes } from './services/dishType';

interface RestaurantDish {
  id: string;
  dishId: string;
  dishName: string;
}

interface Amenity {
  id: string;
  name: string;
  isActive: boolean;
}

interface Review {
  id: string;
  restaurantId: string;
  reviewerUserId: string;
  reviewerUsername: string;
  rating: number;
  title?: string;
  content?: string;
  images?: string;
  visitDate?: string;
  likeCount: number;
  dislikeCount: number;
  reviewScore: number;
  isVisible: boolean;
  isApproved: boolean;
}

interface Restaurant {
  id: string;
  restaurantName: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  operatingHours?: string;
  amenities?: string;
  story?: string;
  images?: string;
  verificationStatus?: string;
  isActive?: boolean;
  isVerified?: boolean;
  canEdit?: boolean;
  ownerId?: string;
  ownerName?: string;
  isClaimed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  dishes?: RestaurantDish[];
  restaurantAmenities?: Amenity[];
  isFavourite?: boolean;
  isBlacklisted?: boolean;
  myReview?: Review;
  reviews?: Review[];
  totalReviews?: number;
  averageRating?: number;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [map, setMap] = useState<L.Map | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [showCenterMarker, setShowCenterMarker] = useState(false);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [selectedRestaurantForClaim, setSelectedRestaurantForClaim] = useState<{ id: string; name: string } | null>(null);
  const [isClaimMode, setIsClaimMode] = useState(false);
  const [lastFilterKeywords, setLastFilterKeywords] = useState<{
    dishIds?: string[];
    amenityIds?: string[];
  }>({});
  const [favouriteRestaurants, setFavouriteRestaurants] = useState<Array<{ id: string; restaurantName: string; latitude?: number; longitude?: number }>>([]);
  const [blacklistedRestaurants, setBlacklistedRestaurants] = useState<Array<{ id: string; restaurantName: string; latitude?: number; longitude?: number }>>([]);
  const [showFavourites, setShowFavourites] = useState(true);
  const [showBlacklist, setShowBlacklist] = useState(true);
  
  // Cache data for Explore and User tabs
  const [amenities, setAmenities] = useState<Array<{ id: string; name: string; isActive: boolean }>>([]);
  const [dishes, setDishes] = useState<Array<{ id: string; name: string }>>([]);
  const [dishTypes, setDishTypes] = useState<Array<{ id: string; typeName: string }>>([]);

  const handleMapLoad = useCallback((mapInstance: L.Map) => {
    setMap(mapInstance);
    
    // Lấy center ban đầu
    const center = mapInstance.getCenter();
    setMapCenter({ lat: center.lat, lng: center.lng });
  }, []);

  // Load global data on mount
  useEffect(() => {
    const loadGlobalData = async () => {
      try {
        // Load amenities
        const amenitiesRes = await listAmenities();
        if (amenitiesRes.data) {
          setAmenities(amenitiesRes.data);
        }
        
        // Load dishes
        const dishesRes = await listDishes();
        if (dishesRes.data) {
          setDishes(dishesRes.data);
        }
        
        // Load dish types
        const dishTypesRes = await listDishTypes();
        if (dishTypesRes.data) {
          setDishTypes(dishTypesRes.data);
        }
      } catch (error) {
        console.error('Error loading global data:', error);
      }
    };
    
    loadGlobalData();
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
          
          // Lưu keywords filter để highlight
          setLastFilterKeywords({
            dishIds: filter.dishIds,
            amenityIds: filter.amenityIds
          });
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

  const refreshRestaurantDetails = async () => {
    if (selectedRestaurant) {
      try {
        const response = await getRestaurantById(selectedRestaurant.id);
        if (response.isSuccess && response.data) {
          setSelectedRestaurant(response.data);
        }
      } catch (error) {
        console.error('Error refreshing restaurant:', error);
      }
    }
  };

  const handleClaimModeChange = (isClaimMode: boolean) => {
    setIsClaimMode(isClaimMode);
  };

  const handleMarkerClick = async (lat: number, lng: number, title?: string) => {
    // Mở sidebar nếu đang đóng
    if (!sidebarOpen) {
      setSidebarOpen(true);
    }
    
    // If in claim mode, set the selected restaurant for claim
    if (isClaimMode) {
      // Find restaurant by coordinates and title
      const restaurant = restaurants.find(r => 
        r.latitude === lat && 
        r.longitude === lng && 
        r.restaurantName === title
      );
      
      if (restaurant) {
        setSelectedRestaurantForClaim({ id: restaurant.id, name: restaurant.restaurantName });
      }
      return;
    }
    
    // Find restaurant by coordinates and title in all lists
    let restaurant = restaurants.find(r => 
      r.latitude === lat && 
      r.longitude === lng && 
      r.restaurantName === title
    );
    
    // If not found in restaurants, check favourite and blacklisted
    if (!restaurant) {
      const favRestaurant = favouriteRestaurants.find(r => 
        r.latitude === lat && 
        r.longitude === lng && 
        r.restaurantName === title
      );
      if (favRestaurant) {
        restaurant = {
          id: favRestaurant.id,
          restaurantName: favRestaurant.restaurantName,
          latitude: favRestaurant.latitude,
          longitude: favRestaurant.longitude,
        } as Restaurant;
      }
    }
    
    if (!restaurant) {
      const blackRestaurant = blacklistedRestaurants.find(r => 
        r.latitude === lat && 
        r.longitude === lng && 
        r.restaurantName === title
      );
      if (blackRestaurant) {
        restaurant = {
          id: blackRestaurant.id,
          restaurantName: blackRestaurant.restaurantName,
          latitude: blackRestaurant.latitude,
          longitude: blackRestaurant.longitude,
        } as Restaurant;
      }
    }
    
    if (restaurant) {
      try {
        // Fetch full restaurant details
        const response = await getRestaurantById(restaurant.id);
        console.log('API Response:', response);
        
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
  const normalMarkers = restaurants
    .filter(r => r.latitude && r.longitude)
    .map(r => ({
      lat: r.latitude!,
      lng: r.longitude!,
      title: r.restaurantName,
      type: 'normal' as const,
    }));

  const favouriteMarkers = showFavourites 
    ? favouriteRestaurants
        .filter(r => r.latitude && r.longitude)
        .map(r => ({
          lat: r.latitude!,
          lng: r.longitude!,
          title: r.restaurantName,
          type: 'favourite' as const,
        }))
    : [];

  const blacklistMarkers = showBlacklist
    ? blacklistedRestaurants
        .filter(r => r.latitude && r.longitude)
        .map(r => ({
          lat: r.latitude!,
          lng: r.longitude!,
          title: r.restaurantName,
          type: 'blacklist' as const,
        }))
    : [];

  const markers = [...normalMarkers, ...favouriteMarkers, ...blacklistMarkers];

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
              lastFilterKeywords={lastFilterKeywords}
              selectedRestaurantForClaim={selectedRestaurantForClaim}
              onRestaurantSelectedForClaim={setSelectedRestaurantForClaim}
              onFavouriteRestaurantsChange={setFavouriteRestaurants}
              onBlacklistedRestaurantsChange={setBlacklistedRestaurants}
              onShowFavouritesChange={setShowFavourites}
              onShowBlacklistChange={setShowBlacklist}
              cacheData={{ amenities, dishes, dishTypes }}
              onRestaurantRefresh={refreshRestaurantDetails}
              onClaimModeChange={handleClaimModeChange}
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
          element={
            <>
              <AdminNavbar />
              <AdminContributionsPage />
            </>
          } 
        />
        <Route 
          path="/admin/contributions" 
          element={
            <>
              <AdminNavbar />
              <AdminContributionsPage />
            </>
          } 
        />
        <Route 
          path="/admin/ownership-requests" 
          element={
            <>
              <AdminNavbar />
              <AdminOwnershipRequestsPage />
            </>
          } 
        />
        <Route 
          path="/admin/tools" 
          element={<AdminDashboardPage />} 
        />
      </Routes>
    </Router>
  );
}

export default App
