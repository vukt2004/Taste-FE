import React, { useState, useEffect } from 'react';
import { BACKEND_URL, API_ENDPOINTS } from '../../config/backend';

type ContributionType = 'dish' | 'restaurant';

interface Amenity {
  id: string;
  name: string;
}

interface Dish {
  id: string;
  name: string;
}

interface ContributionsTabProps {
  mapCenter?: { lat: number; lng: number };
  onShowCenterMarkerChange?: (show: boolean) => void;
}

const ContributionsTab: React.FC<ContributionsTabProps> = ({ mapCenter, onShowCenterMarkerChange }) => {
  const [showModal, setShowModal] = useState(false);
  const [contributionType, setContributionType] = useState<ContributionType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  
  // Dish form states
  const [dishSearchTerm, setDishSearchTerm] = useState('');
  
  // Restaurant form states
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantDescription, setRestaurantDescription] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [priceRange, setPriceRange] = useState('');
  const [operatingHours, setOperatingHours] = useState<{ open: string; close: string }>({ open: '', close: '' });
  const [story, setStory] = useState('');
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenityIds, setSelectedAmenityIds] = useState<string[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [selectedDishIds, setSelectedDishIds] = useState<string[]>([]);
  const [amenitySearchTerm, setAmenitySearchTerm] = useState('');

  const openModal = (type: ContributionType) => {
    setContributionType(type);
    setShowModal(true);
    // Set default location from map center
    if (mapCenter && type === 'restaurant') {
      setSelectedLocation(mapCenter);
    }
    // Show center marker for restaurant contribution
    if (type === 'restaurant') {
      onShowCenterMarkerChange?.(true);
    }
  };

  // Update location when map center changes (for restaurant contribution)
  useEffect(() => {
    if (showModal && contributionType === 'restaurant' && mapCenter) {
      setSelectedLocation(mapCenter);
    }
  }, [mapCenter, showModal, contributionType]);

  const closeModal = () => {
    setShowModal(false);
    setContributionType(null);
    // Hide center marker
    onShowCenterMarkerChange?.(false);
    // Reset form states
    setDishSearchTerm('');
    setRestaurantName('');
    setRestaurantDescription('');
    setSelectedLocation(null);
    setPriceRange('');
    setOperatingHours({ open: '', close: '' });
    setStory('');
    setSelectedAmenityIds([]);
    setAmenitySearchTerm('');
    setImages([]);
    setSelectedDishIds([]);
    setSubmitError(null);
    setSubmitSuccess(null);
  };

  // Fetch amenities on component mount
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.AMENITIES.LIST}`);
        const data = await response.json();
        if (response.ok && data.success && data.data) {
          setAmenities(data.data);
        }
      } catch {
        // Silently handle error
      }
    };
    fetchAmenities();
  }, []);

  // Fetch dishes on component mount
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISHES.LIST}`);
        const data = await response.json();
        if (response.ok && data.success && data.data) {
          setDishes(data.data);
        }
      } catch {
        // Silently handle error
      }
    };
    fetchDishes();
  }, []);

  const handleSubmitDish = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_CONTRIBUTION.CREATE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          dishIds: selectedDishIds
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess('Đã gửi yêu cầu đóng góp món ăn thành công!');
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setSubmitError(data.message || 'Gửi yêu cầu thất bại');
      }
    } catch {
      setSubmitError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitRestaurant = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      // Format operating hours - string đơn giản
      let formattedHours = '';
      if (operatingHours.open && operatingHours.close) {
        formattedHours = `${operatingHours.open}-${operatingHours.close}`;
      }

      // Format amenities
      const formattedAmenities = selectedAmenityIds.map(id => ({ amenityId: id }));

      const token = localStorage.getItem('auth_token');
      
      // Prepare JSON data for restaurant contribution
      const contributionData = {
        restaurantName,
        description: restaurantDescription || undefined,
        latitude: selectedLocation?.lat || undefined,
        longitude: selectedLocation?.lng || undefined,
        priceRange: priceRange || undefined,
        operatingHours: formattedHours || undefined,
        story: story || undefined,
        amenities: formattedAmenities.length > 0 ? JSON.stringify(formattedAmenities) : undefined,
        dishIds: selectedDishIds.length > 0 ? JSON.stringify(selectedDishIds) : undefined,
        images: images.length > 0 ? JSON.stringify(images.map(img => URL.createObjectURL(img))) : undefined
      };

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      };

      const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANT_CONTRIBUTION.CREATE}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(contributionData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSubmitSuccess('Đã gửi yêu cầu đóng góp nhà hàng thành công!');
        setTimeout(() => {
          closeModal();
        }, 2000);
      } else {
        setSubmitError(data.message || 'Gửi yêu cầu thất bại');
      }
    } catch {
      setSubmitError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate time slots (7:00, 7:30, 8:00, etc.)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Đóng góp</h3>
      <div className="space-y-2">
        <button
          onClick={() => openModal('dish')}
          className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">🍜</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">Đóng góp món ăn</div>
              <div className="text-xs text-gray-500">Gửi đề xuất món ăn mới</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => openModal('restaurant')}
          className="w-full p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-left"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-lg">🏪</span>
            </div>
            <div>
              <div className="font-medium text-gray-800">Đóng góp nhà hàng</div>
              <div className="text-xs text-gray-500">Thêm nhà hàng mới vào hệ thống</div>
            </div>
          </div>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ zIndex: 9999 }}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto m-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800">
                {contributionType === 'dish' ? 'Đóng góp món ăn' : 'Đóng góp nhà hàng'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {(submitError || submitSuccess) && (
                <div className={`mb-4 p-3 border rounded text-sm ${
                  submitError 
                    ? 'bg-red-100 border-red-400 text-red-700' 
                    : 'bg-green-100 border-green-400 text-green-700'
                }`}>
                  {submitError || submitSuccess}
                </div>
              )}

              {contributionType === 'dish' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn món ăn có sẵn <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={dishSearchTerm}
                      onChange={(e) => setDishSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tìm kiếm món ăn..."
                    />
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 mt-2">
                      {dishes.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-2">Đang tải...</div>
                      ) : (
                        dishes
                          .filter(dish => dish.name.toLowerCase().includes(dishSearchTerm.toLowerCase()))
                          .map((dish) => (
                            <label key={dish.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedDishIds.includes(dish.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDishIds([...selectedDishIds, dish.id]);
                                  } else {
                                    setSelectedDishIds(selectedDishIds.filter(id => id !== dish.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{dish.name}</span>
                            </label>
                          ))
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitDish}
                      disabled={selectedDishIds.length === 0 || isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* 1. Tên nhà hàng */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên nhà hàng <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={restaurantName}
                      onChange={(e) => setRestaurantName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ: Nhà hàng ABC"
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
                      onChange={(e) => setRestaurantDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mô tả về nhà hàng..."
                    />
                  </div>

                  {/* 3. Câu chuyện nhà hàng */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Câu chuyện nhà hàng
                    </label>
                    <textarea
                      value={story}
                      onChange={(e) => setStory(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Câu chuyện về nhà hàng..."
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
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Ví dụ: 100000-300000"
                    />
                  </div>

                  {/* 5. Tiện nghi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiện nghi
                    </label>
                    <input
                      type="text"
                      value={amenitySearchTerm}
                      onChange={(e) => setAmenitySearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                      placeholder="Tìm kiếm tiện nghi..."
                    />
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2">
                      {amenities.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-2">Đang tải...</div>
                      ) : (
                        amenities
                          .filter(amenity => amenity.name.toLowerCase().includes(amenitySearchTerm.toLowerCase()))
                          .map((amenity) => (
                            <label key={amenity.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedAmenityIds.includes(amenity.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAmenityIds([...selectedAmenityIds, amenity.id]);
                                  } else {
                                    setSelectedAmenityIds(selectedAmenityIds.filter(id => id !== amenity.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{amenity.name}</span>
                            </label>
                          ))
                      )}
                    </div>
                  </div>

                  {/* 6. Chọn món ăn */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Chọn món ăn
                    </label>
                    <input
                      type="text"
                      value={dishSearchTerm}
                      onChange={(e) => setDishSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Tìm kiếm món ăn..."
                    />
                    <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2 space-y-2 mt-2">
                      {dishes.length === 0 ? (
                        <div className="text-xs text-gray-400 text-center py-2">Đang tải...</div>
                      ) : (
                        dishes
                          .filter(dish => dish.name.toLowerCase().includes(dishSearchTerm.toLowerCase()))
                          .map((dish) => (
                            <label key={dish.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedDishIds.includes(dish.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedDishIds([...selectedDishIds, dish.id]);
                                  } else {
                                    setSelectedDishIds(selectedDishIds.filter(id => id !== dish.id));
                                  }
                                }}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <span className="text-sm text-gray-700">{dish.name}</span>
                            </label>
                          ))
                      )}
                    </div>
                    {selectedDishIds.length > 0 && (
                      <div className="mt-2 text-xs text-gray-600">
                        Đã chọn {selectedDishIds.length} món ăn
                      </div>
                    )}
                  </div>

                  {/* 7. Giờ hoạt động */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giờ hoạt động
                    </label>
                    <div className="flex items-center space-x-2">
                      <select
                        value={operatingHours.open}
                        onChange={(e) => setOperatingHours({ ...operatingHours, open: e.target.value })}
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
                        onChange={(e) => setOperatingHours({ ...operatingHours, close: e.target.value })}
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
                          setImages([...images, ...newFiles]);
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
                              className="w-full h-24 object-cover rounded border border-gray-300"
                            />
                            <button
                              type="button"
                              onClick={() => setImages(images.filter((_, i) => i !== index))}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Vị trí trên bản đồ - giữ nguyên ở cuối */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vị trí trên bản đồ
                    </label>
                    <div className="text-xs text-gray-500 mb-2">
                      Di chuyển bản đồ để chọn vị trí nhà hàng
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
                      onClick={closeModal}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleSubmitRestaurant}
                      disabled={!restaurantName.trim() || isSubmitting}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContributionsTab;

