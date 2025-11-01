import React, { useState, useEffect } from 'react';
import { getAllRestaurantsForAdmin, updateRestaurant } from '../../../services/restaurant';
import AlertModal from '../../../components/Sidebar/contribution/AlertModal';
import RestaurantEditModal from '../../../components/RestaurantEditModal';

interface Restaurant {
  id: string;
  restaurantName: string;
  description?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
  isVerified: boolean;
  canEdit: boolean;
  verificationStatus: string;
  ownerId?: string;
  ownerName?: string;
  images?: string;
}

const RestaurantManagement: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterVerified, setFilterVerified] = useState<'all' | 'verified' | 'unverified'>('all');
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
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
    loadRestaurants();
  }, []);

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      const response = await getAllRestaurantsForAdmin(true, true);
      
      if (response.isSuccess && response.data) {
        // Map từ RestaurantDetailDto sang Restaurant format
        const restaurantsData = (response.data as Array<{
          id?: string;
          restaurantName?: string;
          description?: string;
          latitude?: number;
          longitude?: number;
          isActive?: boolean;
          isVerified?: boolean;
          canEdit?: boolean;
          verificationStatus?: string;
          ownerId?: string;
          ownerName?: string;
          images?: string;
        }>).map((r) => ({
          id: r.id || '',
          restaurantName: r.restaurantName || 'N/A',
          description: r.description,
          latitude: r.latitude,
          longitude: r.longitude,
          isActive: r.isActive ?? true,
          isVerified: r.isVerified ?? false,
          canEdit: r.canEdit ?? true,
          verificationStatus: r.verificationStatus || 'pending',
          ownerId: r.ownerId,
          ownerName: r.ownerName,
          images: r.images,
        }));
        setRestaurants(restaurantsData);
      }
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải danh sách quán ăn',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (restaurantId: string, currentActive: boolean) => {
    try {
      // Cập nhật IsActive thông qua UpdateRestaurant
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (!restaurant) return;

      const formData = new FormData();
      formData.append('IsActive', (!currentActive).toString());
      formData.append('IsVerified', restaurant.isVerified.toString());
      formData.append('VerificationStatus', restaurant.verificationStatus);

      const response = await updateRestaurant(restaurantId, formData);
      if (response.isSuccess || response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: `Đã ${!currentActive ? 'kích hoạt' : 'vô hiệu hóa'} quán ăn thành công`,
          type: 'success',
        });
        loadRestaurants();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái',
        type: 'error',
      });
    }
  };

  const handleToggleVerified = async (restaurantId: string, currentVerified: boolean) => {
    try {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (!restaurant) return;

      const formData = new FormData();
      formData.append('IsActive', restaurant.isActive.toString());
      formData.append('IsVerified', (!currentVerified).toString());
      formData.append('VerificationStatus', !currentVerified ? 'verified' : 'pending');

      const response = await updateRestaurant(restaurantId, formData);
      if (response.isSuccess || response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: `Đã ${!currentVerified ? 'xác thực' : 'hủy xác thực'} quán ăn thành công`,
          type: 'success',
        });
        loadRestaurants();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể cập nhật trạng thái',
        type: 'error',
      });
    }
  };

  const handleEdit = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedRestaurant(null);
    loadRestaurants();
  };

  const filteredRestaurants = restaurants.filter(r => {
    const matchesSearch = r.restaurantName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive = filterActive === 'all' || 
      (filterActive === 'active' && r.isActive) || 
      (filterActive === 'inactive' && !r.isActive);
    const matchesVerified = filterVerified === 'all' || 
      (filterVerified === 'verified' && r.isVerified) || 
      (filterVerified === 'unverified' && !r.isVerified);
    return matchesSearch && matchesActive && matchesVerified;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Đang tải danh sách quán ăn...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quản lý quán ăn</h2>
        <button
          onClick={loadRestaurants}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Làm mới
        </button>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Tìm kiếm quán ăn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Không hoạt động</option>
          </select>
          <select
            value={filterVerified}
            onChange={(e) => setFilterVerified(e.target.value as 'all' | 'verified' | 'unverified')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả xác thực</option>
            <option value="verified">Đã xác thực</option>
            <option value="unverified">Chưa xác thực</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Tổng số quán</div>
          <div className="text-2xl font-bold text-blue-900">{restaurants.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-900">
            {restaurants.filter(r => r.isActive).length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600">Đã xác thực</div>
          <div className="text-2xl font-bold text-purple-900">
            {restaurants.filter(r => r.isVerified).length}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
          <div className="text-2xl font-bold text-gray-900">{filteredRestaurants.length}</div>
        </div>
      </div>

      {/* Restaurant List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên quán ăn
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chủ quán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xác thực
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRestaurants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy quán ăn nào
                  </td>
                </tr>
              ) : (
                filteredRestaurants.map((restaurant) => (
                  <tr key={restaurant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{restaurant.restaurantName}</div>
                      {restaurant.description && (
                        <div className="text-xs text-gray-500 line-clamp-1">{restaurant.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{restaurant.ownerName || 'N/A'}</div>
                      {restaurant.ownerId && (
                        <div className="text-xs text-gray-500">{restaurant.ownerId.slice(0, 8)}...</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          restaurant.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {restaurant.isActive ? 'Hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          restaurant.isVerified
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {restaurant.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(restaurant)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleActive(restaurant.id, restaurant.isActive)}
                        className={`${
                          restaurant.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                        }`}
                      >
                        {restaurant.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => handleToggleVerified(restaurant.id, restaurant.isVerified)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        {restaurant.isVerified ? 'Hủy xác thực' : 'Xác thực'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showEditModal && selectedRestaurant && (
        <RestaurantEditModal
          restaurant={selectedRestaurant}
          onClose={() => {
            setShowEditModal(false);
            setSelectedRestaurant(null);
          }}
          onUpdate={handleEditSuccess}
        />
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        title={alertModal.title}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
      />
    </div>
  );
};

export default RestaurantManagement;

