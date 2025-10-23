import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';
import { UserService } from '../services/userService';

interface DishContribution {
  id: string;
  userId: string;
  name: string;
  description?: string;
  tags?: string;
  category?: string;
  icon?: string;
  status: string;
  adminNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  createdDishId?: string;
}

interface RestaurantContribution {
  id: string;
  userId: string;
  restaurantName: string;
  description?: string;
  story?: string;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  operatingHours?: string;
  amenities?: string;
  dishIds?: string;
  images?: string;
  status: string;
  adminNotes?: string;
  reviewedById?: string;
  reviewedAt?: string;
  createdAt: string;
  createdRestaurantId?: string;
}

const AdminContributionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [dishContributions, setDishContributions] = useState<DishContribution[]>([]);
  const [restaurantContributions, setRestaurantContributions] = useState<RestaurantContribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<DishContribution | RestaurantContribution | null>(null);
  const [contributionType, setContributionType] = useState<'dish' | 'restaurant'>('dish');
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [amenities, setAmenities] = useState<Array<{ id: string; name: string }>>([]);
  const [dishes, setDishes] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      try {
        const user = await UserService.getCurrentUser();
        if (!user || user.userType !== 'admin') {
          navigate('/');
        }
      } catch {
        navigate('/');
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    loadContributions();
    loadAmenities();
    loadDishes();
  }, []);

  const loadAmenities = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.AMENITIES.LIST}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setAmenities(data.data.map((a: { id: string; name: string }) => ({ id: a.id, name: a.name })));
        }
      }
    } catch {
      // Ignore errors
    }
  };

  const loadDishes = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISHES.LIST}`);
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          setDishes(data.data.map((d: { id: string; name: string }) => ({ id: d.id, name: d.name })));
        }
      }
    } catch {
      // Ignore errors
    }
  };

  const loadContributions = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) return;

      // Load dish contributions
      const dishResponse = await fetch(`${BACKEND_URL}${API_ENDPOINTS.DISH_CONTRIBUTION.LIST}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Dish contributions response:', dishResponse.status, dishResponse.statusText);

      if (dishResponse.ok) {
        const dishData = await dishResponse.json();
        console.log('Dish contributions data:', dishData);
        if (dishData.isSuccess || dishData.success) {
          setDishContributions(dishData.data || []);
        }
      } else {
        console.error('Failed to load dish contributions:', await dishResponse.text());
      }

      // Load restaurant contributions
      const restaurantResponse = await fetch(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANT_CONTRIBUTION.LIST}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Restaurant contributions response:', restaurantResponse.status, restaurantResponse.statusText);

      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        console.log('Restaurant contributions data:', restaurantData);
        if (restaurantData.isSuccess || restaurantData.success) {
          setRestaurantContributions(restaurantData.data || []);
        }
      } else {
        console.error('Failed to load restaurant contributions:', await restaurantResponse.text());
      }
    } catch (error) {
      console.error('Error loading contributions:', error);
    }
  };

  const handleApprove = async () => {
    if (!selectedContribution) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = contributionType === 'dish' 
        ? `/api/admin/dish-contribution/${selectedContribution.id}/approve`
        : `/api/admin/restaurant-contribution/${selectedContribution.id}/approve`;
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && (data.isSuccess || data.success)) {
        await loadContributions();
        setSelectedContribution(null);
        setAdminNotes('');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContribution) return;
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const endpoint = contributionType === 'dish' 
        ? `/api/admin/dish-contribution/${selectedContribution.id}/reject`
        : `/api/admin/restaurant-contribution/${selectedContribution.id}/reject`;
      
      const response = await fetch(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && (data.isSuccess || data.success)) {
        await loadContributions();
        setSelectedContribution(null);
        setAdminNotes('');
      } else {
        alert(data.message || 'Có lỗi xảy ra');
      }
    } catch {
      alert('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Chờ duyệt';
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Đã từ chối';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Xét duyệt đóng góp</h1>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Về trang chủ
        </button>
      </div>

      {/* Selected Contribution Details */}
      {selectedContribution && (
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Chi tiết đóng góp</h2>
          
          <div className="space-y-2">
            {contributionType === 'dish' ? (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tên món ăn:</label>
                  <p className="text-gray-900">{(selectedContribution as DishContribution).name}</p>
                </div>
                
                {(selectedContribution as DishContribution).description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                    <p className="text-gray-900">{(selectedContribution as DishContribution).description}</p>
                  </div>
                )}
                
                {(selectedContribution as DishContribution).tags && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tags:</label>
                    <p className="text-gray-900">{(selectedContribution as DishContribution).tags}</p>
                  </div>
                )}
                
                {(selectedContribution as DishContribution).category && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Loại:</label>
                    <p className="text-gray-900">{(selectedContribution as DishContribution).category}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tên quán ăn:</label>
                  <p className="text-gray-900">{(selectedContribution as RestaurantContribution).restaurantName}</p>
                </div>
                
                {(selectedContribution as RestaurantContribution).description && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Mô tả:</label>
                    <p className="text-gray-900">{(selectedContribution as RestaurantContribution).description}</p>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).story && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Câu chuyện:</label>
                    <p className="text-gray-900">{(selectedContribution as RestaurantContribution).story}</p>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).priceRange && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Khoảng giá:</label>
                    <p className="text-gray-900">{(selectedContribution as RestaurantContribution).priceRange}</p>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).operatingHours && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Giờ hoạt động:</label>
                    <p className="text-gray-900">{(selectedContribution as RestaurantContribution).operatingHours}</p>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).latitude && (selectedContribution as RestaurantContribution).longitude && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Vị trí:</label>
                    <p className="text-gray-900">
                      {(selectedContribution as RestaurantContribution).latitude}, {(selectedContribution as RestaurantContribution).longitude}
                    </p>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).amenities && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Tiện nghi:</label>
                    <div className="text-gray-900">
                      {(() => {
                        try {
                          const amenityIds = JSON.parse((selectedContribution as RestaurantContribution).amenities || '[]');
                          if (Array.isArray(amenityIds)) {
                            const amenityNames = amenityIds
                              .map((a: { amenityId?: string } | string) => typeof a === 'object' ? a.amenityId : a)
                              .map((id: string | undefined) => id ? amenities.find(a => a.id === id)?.name || id : '')
                              .filter((name: string) => name);
                            return amenityNames.length > 0 ? amenityNames.join(', ') : 'Không có';
                          }
                          return '';
                        } catch {
                          return (selectedContribution as RestaurantContribution).amenities;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).dishIds && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Món ăn:</label>
                    <div className="text-gray-900">
                      {(() => {
                        try {
                          const dishIds = JSON.parse((selectedContribution as RestaurantContribution).dishIds || '[]');
                          if (Array.isArray(dishIds)) {
                            const dishNames = dishIds
                              .map((id: string) => dishes.find(d => d.id === id)?.name || id)
                              .filter((name: string) => name);
                            return dishNames.length > 0 ? dishNames.join(', ') : 'Không có';
                          }
                          return '';
                        } catch {
                          return (selectedContribution as RestaurantContribution).dishIds;
                        }
                      })()}
                    </div>
                  </div>
                )}
                
                {(selectedContribution as RestaurantContribution).images && (
                  <div>
                    <label className="text-sm font-medium text-gray-700">Hình ảnh:</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {(() => {
                        try {
                          const images = JSON.parse((selectedContribution as RestaurantContribution).images || '[]');
                          return Array.isArray(images) ? images.map((img: string, idx: number) => (
                            <img key={idx} src={img} alt={`Image ${idx + 1}`} className="w-auto max-h-[200px] object-contain rounded" />
                          )) : null;
                        } catch {
                          return null;
                        }
                      })()}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
              <span className={`px-2 py-1 rounded text-sm ${getStatusColor(selectedContribution.status)}`}>
                {getStatusLabel(selectedContribution.status)}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú:</label>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Thêm ghi chú (tùy chọn)"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleApprove}
              disabled={isLoading || selectedContribution.status !== 'Pending'}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang xử lý...' : 'Duyệt'}
            </button>
            <button
              onClick={handleReject}
              disabled={isLoading || selectedContribution.status !== 'Pending'}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang xử lý...' : 'Từ chối'}
            </button>
            <button
              onClick={() => {
                setSelectedContribution(null);
                setAdminNotes('');
              }}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* Contributions List */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Danh sách đóng góp</h2>
        
        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => {
              setContributionType('dish');
              setSelectedContribution(null);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              contributionType === 'dish'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Món ăn ({dishContributions.length})
          </button>
          <button
            onClick={() => {
              setContributionType('restaurant');
              setSelectedContribution(null);
            }}
            className={`px-4 py-2 rounded-lg transition-colors ${
              contributionType === 'restaurant'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Quán ăn ({restaurantContributions.length})
          </button>
        </div>
        
        <div className="space-y-2">
          {contributionType === 'dish' ? (
            dishContributions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có đóng góp món ăn nào</p>
            ) : (
              dishContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  onClick={() => {
                    setSelectedContribution(contribution);
                    setContributionType('dish');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{contribution.name}</h3>
                      <p className="text-sm text-gray-500">ID: {contribution.id}</p>
                      <p className="text-sm text-gray-500">Ngày tạo: {new Date(contribution.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(contribution.status)}`}>
                      {getStatusLabel(contribution.status)}
                    </span>
                  </div>
                </div>
              ))
            )
          ) : (
            restaurantContributions.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Chưa có đóng góp quán ăn nào</p>
            ) : (
              restaurantContributions.map((contribution) => (
                <div
                  key={contribution.id}
                  onClick={() => {
                    setSelectedContribution(contribution);
                    setContributionType('restaurant');
                  }}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{contribution.restaurantName}</h3>
                      <p className="text-sm text-gray-500">ID: {contribution.id}</p>
                      <p className="text-sm text-gray-500">Ngày tạo: {new Date(contribution.createdAt).toLocaleDateString('vi-VN')}</p>
                    </div>
                    <span className={`px-3 py-1 rounded text-sm ${getStatusColor(contribution.status)}`}>
                      {getStatusLabel(contribution.status)}
                    </span>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminContributionsPage;

