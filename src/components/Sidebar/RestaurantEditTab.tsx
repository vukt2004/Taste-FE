import React, { useState, useRef, useEffect } from 'react';
import { updateRestaurant, getRestaurantById } from '../../services/restaurant';
import { listAmenities } from '../../services/amenity';
import { listDishes } from '../../services/dish';
import AlertModal from './contribution/AlertModal';

interface Restaurant {
  id: string;
  restaurantName: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  operatingHours?: string;
  story?: string;
}

interface Amenity {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
}

interface RestaurantEditTabProps {
  restaurant: Restaurant | null;
  onUpdate: () => void;
  onClose?: () => void;
}

const RestaurantEditTab: React.FC<RestaurantEditTabProps> = ({ restaurant, onUpdate, onClose }) => {
  const [restaurantName, setRestaurantName] = useState('');
  const [description, setDescription] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [operatingHours, setOperatingHours] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [availableAmenities, setAvailableAmenities] = useState<Amenity[]>([]);
  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  const [showAmenitySelector, setShowAmenitySelector] = useState(false);
  const [showDishSelector, setShowDishSelector] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
  });

  useEffect(() => {
    const loadData = async () => {
      if (!restaurant) return;
      
      setIsLoading(true);
      try {
        // Load restaurant details
        const details = await getRestaurantById(restaurant.id);
        
        if (!details) {
          throw new Error('Không tìm thấy thông tin quán ăn');
        }
        
        setRestaurantName(details.restaurantName || '');
        setDescription(details.description || '');
        // Tọa độ không được chỉnh sửa - không load vào state
        setPriceRange(details.priceRange || '');
        setOperatingHours(details.operatingHours || '');
        setStory(details.story || '');
        
        // Load existing images
        if (details.images) {
          try {
            // Images có thể là JSON string hoặc array
            const imageUrls = typeof details.images === 'string' 
              ? JSON.parse(details.images) 
              : details.images;
            setExistingImages(Array.isArray(imageUrls) ? imageUrls : []);
          } catch {
            // Nếu không phải JSON, thử split theo comma
            if (typeof details.images === 'string') {
              const imageUrls = details.images.split(',').map((img: string) => img.trim()).filter((img: string) => img);
              setExistingImages(imageUrls);
            } else {
              setExistingImages([]);
            }
          }
        } else {
          setExistingImages([]);
        }
        
        // Load existing amenities and dishes
        if (details.restaurantAmenities && Array.isArray(details.restaurantAmenities)) {
          setSelectedAmenityIds(details.restaurantAmenities.map((a: { id: string }) => a.id));
        } else {
          setSelectedAmenityIds([]);
        }
        
        if (details.dishes && Array.isArray(details.dishes)) {
          setSelectedDishIds(details.dishes.map((d: { id?: string; dishId?: string }) => d.dishId || d.id));
        } else {
          setSelectedDishIds([]);
        }
        
        // Load available amenities and dishes
        const [amenitiesRes, dishesRes] = await Promise.all([
          listAmenities(),
          listDishes()
        ]);
        
        setAvailableAmenities(amenitiesRes);
        setAvailableDishes(dishesRes);
      } catch (error) {
        console.error('Error loading restaurant data:', error);
        setAlertModal({
          isOpen: true,
          title: 'Lỗi',
          message: error instanceof Error ? error.message : 'Không thể tải dữ liệu quán ăn',
          type: 'error',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [restaurant]);

  // Close selectors when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.amenity-selector-container') && !target.closest('.dish-selector-container')) {
        setShowAmenitySelector(false);
        setShowDishSelector(false);
      }
    };
    if (showAmenitySelector || showDishSelector) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showAmenitySelector, showDishSelector]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setImages(fileArray);
      
      const previews = fileArray.map(file => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAmenity = (amenityId: string) => {
    setSelectedAmenityIds(prev => prev.filter(id => id !== amenityId));
  };

  const handleRemoveDish = (dishId: string) => {
    setSelectedDishIds(prev => prev.filter(id => id !== dishId));
  };

  const handleAddAmenity = (amenityId: string) => {
    if (!selectedAmenityIds.includes(amenityId)) {
      setSelectedAmenityIds(prev => [...prev, amenityId]);
    }
    setShowAmenitySelector(false);
  };

  const handleAddDish = (dishId: string) => {
    if (!selectedDishIds.includes(dishId)) {
      setSelectedDishIds(prev => [...prev, dishId]);
    }
    setShowDishSelector(false);
  };

  const handleSubmit = async () => {
    if (!restaurant || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('restaurantName', restaurantName);
      if (description) formData.append('description', description);
      // Không cho phép cập nhật tọa độ - không gửi latitude/longitude
      if (priceRange) formData.append('priceRange', priceRange);
      if (operatingHours) formData.append('operatingHours', operatingHours);
      if (story) formData.append('story', story);
      
      // Add amenities
      if (selectedAmenityIds.length > 0) {
        formData.append('restaurantAmenities', JSON.stringify(selectedAmenityIds.map(id => ({ amenityId: id }))));
      }
      
      // Add dishes
      if (selectedDishIds.length > 0) {
        formData.append('dishIds', JSON.stringify(selectedDishIds));
      }
      
      // Add existing images that are still kept (so backend knows which to delete from Cloudinary)
      // Gửi riêng trong field existingImagesJson để tránh conflict với FormFileCollection
      if (existingImages.length > 0) {
        formData.append('existingImagesJson', JSON.stringify(existingImages));
      }
      
      // Add new images to upload
      images.forEach((image) => {
        formData.append('images', image);
      });

      await updateRestaurant(restaurant.id, formData);
      
      setAlertModal({
        isOpen: true,
        title: 'Thành công',
        message: 'Cập nhật thông tin quán ăn thành công!',
        type: 'success',
      });
      onUpdate();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant) {
    return (
      <div className="p-4 text-center text-gray-500">
        Vui lòng chọn quán ăn để chỉnh sửa
      </div>
    );
  }

  return (
    <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Restaurant Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên quán ăn <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khoảng giá
              </label>
              <input
                type="text"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                placeholder="VD: 50000-100000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Operating Hours */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ mở cửa
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="VD: 8:00-22:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Story */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Câu chuyện
              </label>
              <textarea
                value={story}
                onChange={(e) => setStory(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            {/* Existing Images */}
            {existingImages.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh hiện tại
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {existingImages.map((imageUrl, index) => (
                    <div key={index} className="relative">
                      <img
                        src={imageUrl}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => handleRemoveExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* New Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thêm hình ảnh mới
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
              >
                Chọn ảnh mới
              </button>
              
              {imagePreviews.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        onClick={() => handleRemoveImage(index)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiện ích
              </label>
              
              {/* Selected Amenities */}
              <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 border border-gray-200 rounded-lg">
                {selectedAmenityIds.length === 0 ? (
                  <span className="text-sm text-gray-400 italic">Chưa có tiện ích nào</span>
                ) : (
                  selectedAmenityIds.map((amenityId) => {
                    const amenity = availableAmenities.find(a => a.id === amenityId);
                    if (!amenity) return null;
                    return (
                      <span
                        key={amenityId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {amenity.name}
                        <button
                          onClick={() => handleRemoveAmenity(amenityId)}
                          className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
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
              <div className="relative amenity-selector-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAmenitySelector(!showAmenitySelector);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm tiện ích
                </button>
                
                {showAmenitySelector && (
                  <div 
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-hide"
                    onClick={(e) => e.stopPropagation()}
                  >
                      {availableAmenities
                      .filter(a => !selectedAmenityIds.includes(a.id))
                      .map((amenity) => (
                        <button
                          key={amenity.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddAmenity(amenity.id);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700 transition-colors"
                        >
                          {amenity.name}
                        </button>
                      ))}
                    {availableAmenities.filter(a => !selectedAmenityIds.includes(a.id)).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400 text-center">
                        Đã chọn hết tất cả tiện ích
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Dishes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Món ăn
              </label>
              
              {/* Selected Dishes */}
              <div className="flex flex-wrap gap-2 mb-2 min-h-[2.5rem] p-2 border border-gray-200 rounded-lg">
                {selectedDishIds.length === 0 ? (
                  <span className="text-sm text-gray-400 italic">Chưa có món ăn nào</span>
                ) : (
                  selectedDishIds.map((dishId) => {
                    const dish = availableDishes.find(d => d.id === dishId);
                    if (!dish) return null;
                    return (
                      <span
                        key={dishId}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                      >
                        {dish.name}
                        <button
                          onClick={() => handleRemoveDish(dishId)}
                          className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
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
              <div className="relative dish-selector-container">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDishSelector(!showDishSelector);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm text-gray-700 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Thêm món ăn
                </button>
                
                {showDishSelector && (
                  <div 
                    className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto scrollbar-hide"
                    onClick={(e) => e.stopPropagation()}
                  >
                      {availableDishes
                      .filter(d => !selectedDishIds.includes(d.id))
                      .map((dish) => (
                        <button
                          key={dish.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddDish(dish.id);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-green-50 text-sm text-gray-700 transition-colors"
                        >
                          {dish.name}
                        </button>
                      ))}
                    {availableDishes.filter(d => !selectedDishIds.includes(d.id)).length === 0 && (
                      <div className="px-4 py-2 text-sm text-gray-400 text-center">
                        Đã chọn hết tất cả món ăn
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              {onClose && (
                <button
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Hủy
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !restaurantName.trim()}
                className={`flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                  isSubmitting || !restaurantName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        )}
      
      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

export default RestaurantEditTab;

