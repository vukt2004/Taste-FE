import React, { useState } from 'react';
import { type User } from '../services/user';
import { type RestaurantFilter } from '../services/restaurant';
import SidebarHeader from './Sidebar/SidebarHeader';
import ExploreTab from './Sidebar/ExploreTab';
import RestaurantTab from './Sidebar/RestaurantTab';
import ContributionsTab from './Sidebar/ContributionsTab';
import UserTab from './Sidebar/UserTab';

interface Restaurant {
  id: string;
  restaurantName: string;
  description?: string;
  latitude?: number;
  longitude?: number;
}

interface RestaurantForMarker {
  id: string;
  restaurantName: string;
  latitude?: number;
  longitude?: number;
}

interface CacheData {
  amenities: Array<{ id: string; name: string; isActive: boolean }>;
  dishes: Array<{ id: string; name: string }>;
  dishTypes: Array<{ id: string; typeName: string }>;
}

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onFilterChange?: (filter: RestaurantFilter) => void;
  mapCenter?: { lat: number; lng: number };
  onUserChange?: (user: User | null) => void;
  onNavigateToRestaurant?: (restaurantId: string, lat: number, lng: number) => void;
  onShowCenterMarkerChange?: (show: boolean) => void;
  selectedRestaurant?: Restaurant | null;
  lastFilterKeywords?: {
    dishIds?: string[];
    amenityIds?: string[];
  };
  selectedRestaurantForClaim?: { id: string; name: string } | null;
  onRestaurantSelectedForClaim?: (restaurant: { id: string; name: string } | null) => void;
  onFavouriteRestaurantsChange?: (restaurants: RestaurantForMarker[]) => void;
  onBlacklistedRestaurantsChange?: (restaurants: RestaurantForMarker[]) => void;
  onShowFavouritesChange?: (show: boolean) => void;
  onShowBlacklistChange?: (show: boolean) => void;
  cacheData?: CacheData;
  onClaimModeChange?: (isClaimMode: boolean) => void;
  onRestaurantRefresh?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onToggle, onFilterChange, mapCenter, onUserChange, onNavigateToRestaurant, onShowCenterMarkerChange, selectedRestaurant, lastFilterKeywords, selectedRestaurantForClaim, onRestaurantSelectedForClaim, onFavouriteRestaurantsChange, onBlacklistedRestaurantsChange, onShowFavouritesChange, onShowBlacklistChange, cacheData, onClaimModeChange, onRestaurantRefresh }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'comments' | 'contributions' | 'user'>('user');

  const handleFilterChange = (filter: RestaurantFilter) => {
    if (onFilterChange) onFilterChange(filter);
  };

  // Track claim mode state
  const [isClaimMode, setIsClaimMode] = useState(false);
  
  // Handle claim mode change from ContributionsTab
  const handleClaimModeChange = (isClaimMode: boolean) => {
    setIsClaimMode(isClaimMode);
    onClaimModeChange?.(isClaimMode);
  };
  
  // Auto switch to comments tab when restaurant is selected (unless in claim mode)
  React.useEffect(() => {
    if (selectedRestaurant && !isClaimMode) {
      setActiveTab('comments');
    }
  }, [selectedRestaurant, isClaimMode]);

  // Hide center marker when switching away from contributions tab
  React.useEffect(() => {
    if (activeTab !== 'contributions') {
      onShowCenterMarkerChange?.(false);
    }
  }, [activeTab, onShowCenterMarkerChange]);

  return (
    <div
      className={`h-full flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out
      backdrop-blur-md border-r
      ${isOpen ? 'w-[90vw] sm:w-[80vw] md:w-[50vw] lg:w-[40vw] xl:w-[28vw] border-gray-200 bg-white/90 shadow-lg' : 'w-12 bg-white/40 border-transparent'}`}
    >
      {/* Toggle button */}
        <button
          onClick={onToggle}
        className="absolute left-full top-1/2 -translate-y-1/2 translate-x-1/2 
        w-7 h-7 sm:w-9 sm:h-9 flex items-center justify-center rounded-full 
        border border-gray-300 bg-white text-gray-700 shadow-md 
        hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all z-40 text-sm sm:text-base"
          title={isOpen ? 'Đóng' : 'Mở'}
        >
        {isOpen ? '‹' : '›'}
        </button>

      {/* Header */}
      {isOpen && (
        <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-blue-100/60 shadow-sm">
          <SidebarHeader activeTab={activeTab} onTabChange={setActiveTab} />
        </div>
      )}

      {/* Nội dung */}
      <div
        className={`flex-1 overflow-y-auto p-4 scrollbar-hide
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-opacity duration-300`}
      >
        {activeTab === 'explore' && <ExploreTab onFilterChange={handleFilterChange} mapCenter={mapCenter} cacheData={cacheData} />}
        {activeTab === 'comments' && <RestaurantTab restaurant={selectedRestaurant} lastFilterKeywords={lastFilterKeywords} onRestaurantRefresh={onRestaurantRefresh} user={user} />}
        {activeTab === 'contributions' && <ContributionsTab mapCenter={mapCenter} onShowCenterMarkerChange={onShowCenterMarkerChange} selectedRestaurantForClaim={selectedRestaurantForClaim} onRestaurantSelectedForClaim={onRestaurantSelectedForClaim} onClaimModeChange={handleClaimModeChange} user={user} />}
        {activeTab === 'user' && <UserTab user={user} onUserChange={onUserChange} onNavigateToRestaurant={onNavigateToRestaurant} onFavouriteRestaurantsChange={onFavouriteRestaurantsChange} onBlacklistedRestaurantsChange={onBlacklistedRestaurantsChange} onShowFavouritesChange={onShowFavouritesChange} onShowBlacklistChange={onShowBlacklistChange} />}
      </div>

      {/* Footer */}
      {isOpen && (
        <div className="p-3 border-t border-gray-100 text-center text-xs text-gray-500 bg-gradient-to-r from-gray-50 to-gray-100">
          © 2025 TasteMap
          </div>
        )}
    </div>
  );
};

export default Sidebar;
