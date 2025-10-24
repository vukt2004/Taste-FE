import React from 'react';

interface SidebarHeaderProps {
  activeTab: 'explore' | 'comments' | 'contributions' | 'user';
  onTabChange: (tab: 'explore' | 'comments' | 'contributions' | 'user') => void;
}

const SidebarHeader: React.FC<SidebarHeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-2 mb-1">
        <div className="flex items-center justify-center" style={{ width: '50px', height: '50px' }}>
          <img src="/logo.png" alt="TasteMap Logo" className="w-full h-full object-contain" />
        </div>
        <h2 className="text-lg font-semibold text-gray-800">Taste Map</h2>
      </div>
      
      <div className="flex mt-4 space-x-1">
        <button
          className={`flex-1 p-1.5 sm:p-2 rounded-lg transition-colors ${activeTab === 'explore' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => onTabChange('explore')}
          title="Khám phá"
        >
          <span className="text-sm sm:text-lg">🔍</span>
        </button>
        <button
          className={`flex-1 p-1.5 sm:p-2 rounded-lg transition-colors ${activeTab === 'comments' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => onTabChange('comments')}
          title="Bình luận"
        >
          <span className="text-sm sm:text-lg">💬</span>
        </button>
        <button
          className={`flex-1 p-1.5 sm:p-2 rounded-lg transition-colors ${activeTab === 'contributions' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => onTabChange('contributions')}
          title="Đóng góp"
        >
          <span className="text-sm sm:text-lg">✨</span>
        </button>
        <button
          className={`flex-1 p-1.5 sm:p-2 rounded-lg transition-colors ${activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          onClick={() => onTabChange('user')}
          title="Tài khoản"
        >
          <span className="text-sm sm:text-lg">👤</span>
        </button>
      </div>
    </div>
  );
};

export default SidebarHeader;

