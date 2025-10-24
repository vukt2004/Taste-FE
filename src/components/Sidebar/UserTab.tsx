import React, { useState, useEffect, useCallback } from 'react';
import { type User, type UserProfile, getMyProfile } from '../../services/user';
import AuthForm from '../AuthForm';
import RestaurantEditModal from '../RestaurantEditModal';

interface UserTabProps {
  user: User | null;
  onUserChange?: (user: User | null) => void;
  onNavigateToRestaurant?: (restaurantId: string, lat: number, lng: number) => void;
  onFavouriteRestaurantsChange?: (restaurants: Restaurant[]) => void;
  onBlacklistedRestaurantsChange?: (restaurants: Restaurant[]) => void;
  onShowFavouritesChange?: (show: boolean) => void;
  onShowBlacklistChange?: (show: boolean) => void;
}

interface Restaurant {
  id: string;
  restaurantName: string;
  latitude?: number;
  longitude?: number;
}

const UserTab: React.FC<UserTabProps> = ({ user, onUserChange, onNavigateToRestaurant, onFavouriteRestaurantsChange, onBlacklistedRestaurantsChange, onShowFavouritesChange, onShowBlacklistChange }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurantForEdit, setSelectedRestaurantForEdit] = useState<Restaurant | null>(null);
  const [expandedSections, setExpandedSections] = useState<{
    favourites: boolean;
    blacklist: boolean;
    owned: boolean;
  }>({
    favourites: false,
    blacklist: false,
    owned: false,
  });
  
  const [showMarkers, setShowMarkers] = useState<{
    favourites: boolean;
    blacklist: boolean;
  }>({
    favourites: true,
    blacklist: true,
  });

  const toggleSection = (section: 'favourites' | 'blacklist' | 'owned') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const loadProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const userProfile = await getMyProfile();
      setProfile(userProfile);
      
      // Notify parent about favourite and blacklisted restaurants
      if (userProfile) {
        onFavouriteRestaurantsChange?.(userProfile.favouriteRestaurants || []);
        onBlacklistedRestaurantsChange?.(userProfile.blacklistedRestaurants || []);
      }
    } catch {
      // Silently handle profile loading error
    } finally {
      setIsLoading(false);
    }
  }, [onFavouriteRestaurantsChange, onBlacklistedRestaurantsChange]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleLoginSuccess = (loggedInUser: User) => {
    onUserChange?.(loggedInUser);
  };

  const handleLogout = () => {
    onUserChange?.(null);
    setProfile(null);
  };

  return (
    <div className="space-y-4">
      {user ? (
        <>
        <div className="bg-white rounded-lg border border-gray-200 p-3">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <div className="font-medium text-gray-800">{user.fullName || user.username}</div>
              <div className="text-xs text-gray-600">{user.email}</div>
            </div>
          </div>
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Điểm: {profile?.points ?? user.points}</span>
            <span>Loại: {user.userType}</span>
          </div>
        </div>

          {isLoading ? (
            <div className="text-center text-gray-500 text-sm">Đang tải...</div>
          ) : profile ? (
            <div className="space-y-3">
              {/* quán ăn yêu thích */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleSection('favourites')}
                    className="flex items-center justify-between text-left flex-1"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      Yêu thích ({profile.favouriteRestaurants?.length || 0})
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {expandedSections.favourites ? '▼' : '▶'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const newValue = !showMarkers.favourites;
                      setShowMarkers(prev => ({ ...prev, favourites: newValue }));
                      onShowFavouritesChange?.(newValue);
                    }}
                    className="ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200"
                    title="Ẩn/hiện markers yêu thích"
                  >
                    {showMarkers.favourites ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {expandedSections.favourites && (
                  <div className="space-y-1 max-h-40 overflow-y-auto mt-2">
                    {profile.favouriteRestaurants && profile.favouriteRestaurants.length > 0 ? (
                      profile.favouriteRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                          <span className="text-xs text-gray-600 flex-1">{restaurant.restaurantName}</span>
                          {restaurant.latitude && restaurant.longitude && (
                            <button
                              onClick={() => onNavigateToRestaurant?.(restaurant.id, restaurant.latitude!, restaurant.longitude!)}
                              className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="Định vị trên bản đồ"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 py-2">Chưa có quán ăn yêu thích</div>
                    )}
                  </div>
                )}
              </div>

              {/* quán ăn blacklist */}
              <div className="bg-white rounded-lg border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={() => toggleSection('blacklist')}
                    className="flex items-center justify-between text-left flex-1"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      Đã chặn ({profile.blacklistedRestaurants?.length || 0})
                    </h4>
                    <span className="text-xs text-gray-500 ml-2">
                      {expandedSections.blacklist ? '▼' : '▶'}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      const newValue = !showMarkers.blacklist;
                      setShowMarkers(prev => ({ ...prev, blacklist: newValue }));
                      onShowBlacklistChange?.(newValue);
                    }}
                    className="ml-2 px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    title="Ẩn/hiện markers blacklist"
                  >
                    {showMarkers.blacklist ? 'Ẩn' : 'Hiện'}
                  </button>
                </div>
                {expandedSections.blacklist && (
                  <div className="space-y-1 max-h-40 overflow-y-auto mt-2">
                    {profile.blacklistedRestaurants && profile.blacklistedRestaurants.length > 0 ? (
                      profile.blacklistedRestaurants.map((restaurant) => (
                        <div key={restaurant.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                          <span className="text-xs text-gray-600 flex-1">{restaurant.restaurantName}</span>
                          {restaurant.latitude && restaurant.longitude && (
                            <button
                              onClick={() => onNavigateToRestaurant?.(restaurant.id, restaurant.latitude!, restaurant.longitude!)}
                              className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                              title="Định vị trên bản đồ"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-gray-400 py-2">Chưa có quán ăn trong danh sách chặn</div>
                    )}
                  </div>
                )}
              </div>

              {/* quán ăn sở hữu */}
              {profile.isRestaurantOwner && (
                <div className="bg-white rounded-lg border border-gray-200 p-3">
                  <button
                    onClick={() => toggleSection('owned')}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <h4 className="text-sm font-semibold text-gray-700">
                      Đang sở hữu ({profile.ownedRestaurants?.length || 0})
                    </h4>
                    <span className="text-xs text-gray-500">
                      {expandedSections.owned ? '▼' : '▶'}
                    </span>
                  </button>
                  {expandedSections.owned && (
                    <div className="space-y-1 max-h-40 overflow-y-auto mt-2">
                      {profile.ownedRestaurants && profile.ownedRestaurants.length > 0 ? (
                        profile.ownedRestaurants.map((restaurant) => (
                          <div key={restaurant.id} className="flex items-center justify-between py-1 border-b border-gray-100 last:border-0">
                            <span className="text-xs text-gray-600 flex-1">{restaurant.restaurantName}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => setSelectedRestaurantForEdit(restaurant)}
                                className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                                title="Chỉnh sửa"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              {restaurant.latitude && restaurant.longitude && (
                                <button
                                  onClick={() => onNavigateToRestaurant?.(restaurant.id, restaurant.latitude!, restaurant.longitude!)}
                                  className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                                  title="Định vị trên bản đồ"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-xs text-gray-400 py-2">Chưa có quán ăn đang sở hữu</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </>
      ) : (
        <div className="flex justify-center">
          <AuthForm onLoginSuccess={handleLoginSuccess} onLogout={handleLogout} />
        </div>
      )}
      
      {/* Restaurant Edit Modal */}
      {selectedRestaurantForEdit && (
        <RestaurantEditModal
          restaurant={selectedRestaurantForEdit}
          onClose={() => setSelectedRestaurantForEdit(null)}
          onUpdate={() => {
            loadProfile();
            setSelectedRestaurantForEdit(null);
          }}
        />
      )}
    </div>
  );
};

export default UserTab;

