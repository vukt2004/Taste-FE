import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import RestaurantEditTab from './RestaurantEditTab';
import CommentManagementTab from './CommentManagementTab';

interface Restaurant {
  id: string;
  restaurantName: string;
  latitude?: number;
  longitude?: number;
}

interface RestaurantManagementModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onUpdate: () => void;
}

const RestaurantManagementModal: React.FC<RestaurantManagementModalProps> = ({ 
  restaurant, 
  onClose, 
  onUpdate 
}) => {
  const [activeTab, setActiveTab] = useState<'edit' | 'comments'>('edit');

  // Handle ESC key to close modal
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && restaurant) {
        onClose();
      }
    };
    if (restaurant) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [restaurant, onClose]);

  if (!restaurant) {
    return null;
  }

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-100 bg-opacity-30 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl overflow-hidden flex flex-col
          w-[95vw] h-[90vh]
          sm:w-[90vw] sm:h-[85vh]
          md:w-[85vw] md:h-[80vh]
          lg:w-[85vw] lg:h-[85vh]
          xl:w-[80vw] xl:h-[85vh]
          2xl:w-[75vw] 2xl:h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800">Quản lý quán ăn</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full p-1 transition-colors"
            title="Đóng"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex gap-2 p-3 sm:p-4 border-b border-gray-200 bg-white flex-shrink-0">
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-colors ${
              activeTab === 'edit'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chỉnh sửa quán ăn
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base rounded-lg transition-colors ${
              activeTab === 'comments'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quản lí comment
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {activeTab === 'edit' ? (
            <RestaurantEditTab
              restaurant={restaurant}
              onUpdate={onUpdate}
            />
          ) : (
            <div className="p-6">
              <CommentManagementTab
                restaurant={restaurant}
                onUpdate={onUpdate}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default RestaurantManagementModal;
