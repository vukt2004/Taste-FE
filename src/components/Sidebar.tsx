import React, { useState } from 'react';
import { type User } from '../services/user';
import { type RestaurantFilter } from '../services/restaurant';
import SidebarHeader from './Sidebar/SidebarHeader';
import ExploreTab from './Sidebar/ExploreTab';
import CommentsTab from './Sidebar/CommentsTab';
import ContributionsTab from './Sidebar/ContributionsTab';
import UserTab from './Sidebar/UserTab';

interface SidebarProps {
  user: User | null;
  isOpen: boolean;
  onToggle: () => void;
  onFilterChange?: (filter: RestaurantFilter) => void;
  mapCenter?: { lat: number; lng: number };
  onUserChange?: (user: User | null) => void;
  onNavigateToRestaurant?: (restaurantId: string, lat: number, lng: number) => void;
  onShowCenterMarkerChange?: (show: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, isOpen, onToggle, onFilterChange, mapCenter, onUserChange, onNavigateToRestaurant, onShowCenterMarkerChange }) => {
  const [activeTab, setActiveTab] = useState<'explore' | 'comments' | 'contributions' | 'user'>('explore');

  const handleFilterChange = (filter: RestaurantFilter) => {
    if (onFilterChange) onFilterChange(filter);
  };

  return (
    <div
      className={`h-full flex flex-col fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out
      backdrop-blur-md border-r
      ${isOpen ? 'w-[28vw] border-gray-200 bg-white/90 shadow-lg' : 'w-12 bg-white/40 border-transparent'}`}
    >
      {/* Toggle button */}
        <button
          onClick={onToggle}
        className="absolute left-full top-1/2 -translate-y-1/2 translate-x-1/2 
        w-9 h-9 flex items-center justify-center rounded-full 
        border border-gray-300 bg-white text-gray-700 shadow-md 
        hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 transition-all z-40"
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
        className={`flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent 
        ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'} transition-opacity duration-300`}
      >
        {activeTab === 'explore' && <ExploreTab onFilterChange={handleFilterChange} mapCenter={mapCenter} />}
        {activeTab === 'comments' && <CommentsTab />}
        {activeTab === 'contributions' && <ContributionsTab mapCenter={mapCenter} onShowCenterMarkerChange={onShowCenterMarkerChange} />}
        {activeTab === 'user' && <UserTab user={user} onUserChange={onUserChange} onNavigateToRestaurant={onNavigateToRestaurant} />}
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
