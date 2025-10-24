import React, { useState, useRef, useEffect } from 'react';
import { updateRestaurant, getRestaurantById } from '../services/restaurant';
import { listAmenities } from '../services/amenity';
import { listDishes } from '../services/dish';

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

interface RestaurantEditModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  onUpdate: () => void;
}

const RestaurantEditModal: React.FC<RestaurantEditModalProps> = ({ restaurant, onClose, onUpdate }) => {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!restaurant) return;
      
      setIsLoading(true);
      try {
        // Load restaurant details
        const details = await getRestaurantById(restaurant.id);
        
        setRestaurantName(details.restaurantName || '');
        setDescription(details.description || '');
        setPriceRange(details.priceRange || '');
        setOperatingHours(details.operatingHours || '');
        setStory(details.story || '');
        
        // Load existing images
        if (details.images) {
          try {
            const imageUrls = JSON.parse(details.images);
            setExistingImages(Array.isArray(imageUrls) ? imageUrls : []);
          } catch {
            setExistingImages([]);
          }
        }
        
        // Load existing amenities and dishes
        if (details.restaurantAmenities) {
          setSelectedAmenityIds(details.restaurantAmenities.map((a: { id: string }) => a.id));
        }
        if (details.dishes) {
          setSelectedDishIds(details.dishes.map((d: { id: string }) => d.id));
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
        alert('Không thể tải dữ liệu quán ăn');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [restaurant]);

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

  const handleToggleAmenity = (amenityId: string) => {
    setSelectedAmenityIds(prev => 
      prev.includes(amenityId) 
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleToggleDish = (dishId: string) => {
    setSelectedDishIds(prev => 
      prev.includes(dishId) 
        ? prev.filter(id => id !== dishId)
        : [...prev, dishId]
    );
  };

  const handleSubmit = async () => {
    if (!restaurant || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('restaurantName', restaurantName);
      if (description) formData.append('description', description);
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
      
      // Add images
      images.forEach((image) => {
        formData.append('images', image);
      });

      await updateRestaurant(restaurant.id, formData);
      
      alert('Cập nhật thông tin quán ăn thành công!');
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating restaurant:', error);
      alert('Có lỗi xảy ra khi cập nhật. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!restaurant) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">Chỉnh sửa quán ăn</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-gray-500">Đang tải dữ liệu...</div>
            </div>
          ) : (
            <>
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
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {availableAmenities.map((amenity) => (
                <label key={amenity.id} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedAmenityIds.includes(amenity.id)}
                    onChange={() => handleToggleAmenity(amenity.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dishes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Món ăn
            </label>
            <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg p-2">
              {availableDishes.map((dish) => (
                <label key={dish.id} className="flex items-center gap-2 py-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedDishIds.includes(dish.id)}
                    onChange={() => handleToggleDish(dish.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{dish.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Hủy
            </button>
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
          </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantEditModal;

