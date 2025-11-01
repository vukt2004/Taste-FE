import React, { useState, useEffect, useRef } from 'react';

interface Amenity {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
}

interface RestaurantContributionFormProps {
  restaurantName: string;
  onRestaurantNameChange: (value: string) => void;
  restaurantDescription: string;
  onRestaurantDescriptionChange: (value: string) => void;
  story: string;
  onStoryChange: (value: string) => void;
  priceRange: string;
  onPriceRangeChange: (value: string) => void;
  operatingHours: { open: string; close: string };
  onOperatingHoursChange: (hours: { open: string; close: string }) => void;
  selectedLocation: { lat: number; lng: number } | null;
  amenities: Amenity[];
  selectedAmenityIds: string[];
  onSelectedAmenityIdsChange: (ids: string[]) => void;
  amenitySearchTerm: string;
  onAmenitySearchTermChange: (value: string) => void;
  dishes: Dish[];
  selectedDishIds: string[];
  onSelectedDishIdsChange: (ids: string[]) => void;
  dishSearchTerm: string;
  onDishSearchTermChange: (value: string) => void;
  images: File[];
  onImagesChange: (images: File[]) => void;
  isSubmitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  submitError: string | null;
  submitSuccess: string | null;
}

const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
};

const RestaurantContributionForm: React.FC<RestaurantContributionFormProps> = ({
  restaurantName,
  onRestaurantNameChange,
  restaurantDescription,
  onRestaurantDescriptionChange,
  story,
  onStoryChange,
  priceRange,
  onPriceRangeChange,
  operatingHours,
  onOperatingHoursChange,
  selectedLocation,
  amenities,
  selectedAmenityIds,
  onSelectedAmenityIdsChange,
  amenitySearchTerm,
  onAmenitySearchTermChange,
  dishes,
  selectedDishIds,
  onSelectedDishIdsChange,
  dishSearchTerm,
  onDishSearchTermChange,
  images,
  onImagesChange,
  isSubmitting,
  onSubmit,
  onCancel,
  submitError,
  submitSuccess,
}) => {
  const timeSlots = generateTimeSlots();
  const [showAmenitySelector, setShowAmenitySelector] = useState(false);
  const [showDishSelector, setShowDishSelector] = useState(false);
  const amenitySelectorRef = useRef<HTMLDivElement>(null);
  const dishSelectorRef = useRef<HTMLDivElement>(null);

  // Close selectors when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (amenitySelectorRef.current && !amenitySelectorRef.current.contains(event.target as Node)) {
        setShowAmenitySelector(false);
      }
      if (dishSelectorRef.current && !dishSelectorRef.current.contains(event.target as Node)) {
        setShowDishSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRemoveAmenity = (amenityId: string) => {
    onSelectedAmenityIdsChange(selectedAmenityIds.filter(id => id !== amenityId));
  };

  const handleAddAmenity = (amenityId: string) => {
    if (!selectedAmenityIds.includes(amenityId)) {
      onSelectedAmenityIdsChange([...selectedAmenityIds, amenityId]);
      setShowAmenitySelector(false);
      onAmenitySearchTermChange('');
    }
  };

  const handleRemoveDish = (dishId: string) => {
    onSelectedDishIdsChange(selectedDishIds.filter(id => id !== dishId));
  };

  const handleAddDish = (dishId: string) => {
    if (!selectedDishIds.includes(dishId)) {
      onSelectedDishIdsChange([...selectedDishIds, dishId]);
      setShowDishSelector(false);
      onDishSearchTermChange('');
    }
  };

  const filteredAmenities = amenities.filter(amenity => 
    !selectedAmenityIds.includes(amenity.id) &&
    (amenitySearchTerm === '' || amenity.name.toLowerCase().includes(amenitySearchTerm.toLowerCase()))
  );

  const filteredDishes = dishes.filter(dish => 
    !selectedDishIds.includes(dish.id) &&
    (dishSearchTerm === '' || dish.name.toLowerCase().includes(dishSearchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      {(submitError || submitSuccess) && (
        <div className={`mb-4 p-3 border rounded text-sm ${
          submitError 
            ? 'bg-red-100 border-red-400 text-red-700' 
            : 'bg-green-100 border-green-400 text-green-700'
        }`}>
          {submitError || submitSuccess}
        </div>
      )}

      {/* 1. Tên quán ăn */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tên quán ăn <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={restaurantName}
          onChange={(e) => onRestaurantNameChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: quán ăn ABC"
          required
        />
      </div>

      {/* 2. Mô tả */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Mô tả
        </label>
        <textarea
          value={restaurantDescription}
          onChange={(e) => onRestaurantDescriptionChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Mô tả về quán ăn..."
        />
      </div>

      {/* 3. Câu chuyện quán ăn */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Câu chuyện quán ăn
        </label>
        <textarea
          value={story}
          onChange={(e) => onStoryChange(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Câu chuyện về quán ăn..."
        />
      </div>

      {/* 4. Khoảng giá */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Khoảng giá
        </label>
        <input
          type="text"
          value={priceRange}
          onChange={(e) => onPriceRangeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ví dụ: 100000-300000"
        />
      </div>

      {/* 5. Tiện nghi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tiện nghi
        </label>
        
        {/* Selected Amenities */}
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 border border-gray-200 rounded-md">
          {selectedAmenityIds.length === 0 ? (
            <span className="text-sm text-gray-400 italic">Chưa có tiện ích nào</span>
          ) : (
            selectedAmenityIds.map((amenityId) => {
              const amenity = amenities.find(a => a.id === amenityId);
              if (!amenity) return null;
              return (
                <span
                  key={amenityId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {amenity.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(amenityId)}
                    disabled={isSubmitting}
                    className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Add Amenity Button and Selector */}
        <div className="relative amenity-selector-container" ref={amenitySelectorRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAmenitySelector(!showAmenitySelector);
            }}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm tiện ích
          </button>
          
          {showAmenitySelector && (
            <div 
              className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {amenities.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-400 text-center">Đang tải...</div>
              ) : (
                <>
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={amenitySearchTerm}
                      onChange={(e) => onAmenitySearchTermChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Tìm kiếm tiện nghi..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredAmenities.map((amenity) => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddAmenity(amenity.id);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 transition-colors"
                    >
                      {amenity.name}
                    </button>
                  ))}
                  {filteredAmenities.length === 0 && amenities.length > 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400 text-center">
                      {selectedAmenityIds.length === amenities.length ? 'Đã chọn hết tất cả tiện ích' : 'Không tìm thấy'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 6. Chọn món ăn */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Món ăn
        </label>
        
        {/* Selected Dishes */}
        <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 border border-gray-200 rounded-md">
          {selectedDishIds.length === 0 ? (
            <span className="text-sm text-gray-400 italic">Chưa có món ăn nào</span>
          ) : (
            selectedDishIds.map((dishId) => {
              const dish = dishes.find(d => d.id === dishId);
              if (!dish) return null;
              return (
                <span
                  key={dishId}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {dish.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveDish(dishId)}
                    disabled={isSubmitting}
                    className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Xóa"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              );
            })
          )}
        </div>

        {/* Add Dish Button and Selector */}
        <div className="relative dish-selector-container" ref={dishSelectorRef}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDishSelector(!showDishSelector);
            }}
            disabled={isSubmitting}
            className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm text-gray-700 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm món ăn
          </button>
          
          {showDishSelector && (
            <div 
              className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto scrollbar-hide"
              onClick={(e) => e.stopPropagation()}
            >
              {dishes.length === 0 ? (
                <div className="px-4 py-2 text-sm text-gray-400 text-center">Đang tải...</div>
              ) : (
                <>
                  <div className="p-2 border-b border-gray-200">
                    <input
                      type="text"
                      value={dishSearchTerm}
                      onChange={(e) => onDishSearchTermChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Tìm kiếm món ăn..."
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredDishes.map((dish) => (
                    <button
                      key={dish.id}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddDish(dish.id);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-gray-700 transition-colors"
                    >
                      {dish.name}
                    </button>
                  ))}
                  {filteredDishes.length === 0 && dishes.length > 0 && (
                    <div className="px-4 py-2 text-sm text-gray-400 text-center">
                      {selectedDishIds.length === dishes.length ? 'Đã chọn hết tất cả món ăn' : 'Không tìm thấy'}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 7. Giờ hoạt động */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Giờ hoạt động
        </label>
        <div className="flex items-center space-x-2">
          <select
            value={operatingHours.open}
            onChange={(e) => onOperatingHoursChange({ ...operatingHours, open: e.target.value })}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">Chọn giờ mở</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
          <span className="text-gray-500">-</span>
          <select
            value={operatingHours.close}
            onChange={(e) => onOperatingHoursChange({ ...operatingHours, close: e.target.value })}
            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="">Chọn giờ đóng</option>
            {timeSlots.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          Áp dụng cho tất cả các ngày trong tuần
        </div>
      </div>

      {/* 8. Hình ảnh */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Hình ảnh (tùy chọn)
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            if (e.target.files) {
              const newFiles = Array.from(e.target.files);
              onImagesChange([...images, ...newFiles]);
            }
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        {images.length > 0 && (
          <div className="mt-2 grid grid-cols-3 gap-2">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`Preview ${index + 1}`}
                  className="w-auto max-h-[200px] object-contain rounded border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => onImagesChange(images.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Vị trí trên bản đồ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vị trí trên bản đồ
        </label>
        <div className="text-xs text-gray-500 mb-2">
          Di chuyển bản đồ để chọn vị trí quán ăn
        </div>
        {selectedLocation && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            Lat: {selectedLocation.lat.toFixed(6)}, Lng: {selectedLocation.lng.toFixed(6)}
          </div>
        )}
      </div>

      {/* Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-md text-gray-700 text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Hủy
        </button>
        <button
          onClick={onSubmit}
          disabled={!restaurantName.trim() || isSubmitting}
          className="flex-1 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
      </div>
    </div>
  );
};

export default RestaurantContributionForm;

