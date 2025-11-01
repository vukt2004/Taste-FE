import React, { useState, useEffect } from 'react';
import { BACKEND_URL, API_ENDPOINTS } from '../../../config/backend';
import { UserService } from '../../../services/userService';
import AlertModal from '../../../components/Sidebar/contribution/AlertModal';

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

const ContributionsManagement: React.FC = () => {
  const [dishContributions, setDishContributions] = useState<DishContribution[]>([]);
  const [restaurantContributions, setRestaurantContributions] = useState<RestaurantContribution[]>([]);
  const [selectedContribution, setSelectedContribution] = useState<DishContribution | RestaurantContribution | null>(null);
  const [contributionType, setContributionType] = useState<'dish' | 'restaurant'>('dish');
  const [adminNotes, setAdminNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
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
    if (!hasLoaded) {
      loadContributions();
      setHasLoaded(true);
    }
  }, [hasLoaded]);


  const loadContributions = async () => {
    try {
      // Load dish contributions
      const dishResponse = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.DISH_CONTRIBUTION.LIST}`, {
        method: 'GET',
        headers: UserService.getAuthHeaders(),
      });

      if (dishResponse.ok) {
        const dishData = await dishResponse.json();
        if (dishData.isSuccess || dishData.success) {
          setDishContributions(dishData.data || []);
        }
      }

      // Load restaurant contributions
      const restaurantResponse = await UserService.fetchWithAuth(`${BACKEND_URL}${API_ENDPOINTS.RESTAURANT_CONTRIBUTION.LIST}`, {
        method: 'GET',
        headers: UserService.getAuthHeaders(),
      });

      if (restaurantResponse.ok) {
        const restaurantData = await restaurantResponse.json();
        if (restaurantData.isSuccess || restaurantData.success) {
          setRestaurantContributions(restaurantData.data || []);
        }
      }
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải danh sách đóng góp',
        type: 'error',
      });
    }
  };

  const handleApprove = async () => {
    if (!selectedContribution) return;
    
    setIsLoading(true);
    try {
      const endpoint = contributionType === 'dish' 
        ? `/api/admin/dish-contribution/${selectedContribution.id}/approve`
        : `/api/admin/restaurant-contribution/${selectedContribution.id}/approve`;
      
      const response = await UserService.fetchWithAuth(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...UserService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && (data.isSuccess || data.success)) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã duyệt đóng góp thành công',
          type: 'success',
        });
        await loadContributions();
        setSelectedContribution(null);
        setAdminNotes('');
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Lỗi',
          message: data.message || 'Có lỗi xảy ra',
          type: 'error',
        });
      }
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Lỗi kết nối. Vui lòng thử lại.',
        type: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedContribution) return;
    
    setIsLoading(true);
    try {
      const endpoint = contributionType === 'dish' 
        ? `/api/admin/dish-contribution/${selectedContribution.id}/reject`
        : `/api/admin/restaurant-contribution/${selectedContribution.id}/reject`;
      
      const response = await UserService.fetchWithAuth(`${BACKEND_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          ...UserService.getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          adminNotes: adminNotes || undefined,
        }),
      });

      const data = await response.json();
      if (response.ok && (data.isSuccess || data.success)) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã từ chối đóng góp',
          type: 'success',
        });
        await loadContributions();
        setSelectedContribution(null);
        setAdminNotes('');
      } else {
        setAlertModal({
          isOpen: true,
          title: 'Lỗi',
          message: data.message || 'Có lỗi xảy ra',
          type: 'error',
        });
      }
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Lỗi kết nối. Vui lòng thử lại.',
        type: 'error',
      });
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

  const pendingContributions = [
    ...dishContributions.filter(c => c.status.toLowerCase() === 'pending'),
    ...restaurantContributions.filter(c => c.status.toLowerCase() === 'pending'),
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quản lý đóng góp</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setContributionType('dish')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              contributionType === 'dish'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Món ăn ({dishContributions.filter(c => c.status.toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={() => setContributionType('restaurant')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              contributionType === 'restaurant'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Quán ăn ({restaurantContributions.filter(c => c.status.toLowerCase() === 'pending').length})
          </button>
          <button
            onClick={loadContributions}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Làm mới
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-sm text-yellow-600">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-900">{pendingContributions.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Đã duyệt</div>
          <div className="text-2xl font-bold text-green-900">
            {dishContributions.filter(c => c.status.toLowerCase() === 'approved').length +
             restaurantContributions.filter(c => c.status.toLowerCase() === 'approved').length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Đã từ chối</div>
          <div className="text-2xl font-bold text-red-900">
            {dishContributions.filter(c => c.status.toLowerCase() === 'rejected').length +
             restaurantContributions.filter(c => c.status.toLowerCase() === 'rejected').length}
          </div>
        </div>
      </div>

      {/* Contributions List */}
      <div className="space-y-4">
        {(contributionType === 'dish' ? dishContributions : restaurantContributions)
          .filter(c => c.status.toLowerCase() === 'pending')
          .map((contribution) => (
            <div
              key={contribution.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedContribution(contribution);
                setAdminNotes(contribution.adminNotes || '');
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {contributionType === 'dish' 
                      ? (contribution as DishContribution).name 
                      : (contribution as RestaurantContribution).restaurantName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Ngày tạo: {new Date(contribution.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contribution.status)}`}>
                  {getStatusLabel(contribution.status)}
                </span>
              </div>
            </div>
          ))}
        
        {(contributionType === 'dish' ? dishContributions : restaurantContributions)
          .filter(c => c.status.toLowerCase() === 'pending').length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg">Không có đóng góp nào đang chờ duyệt</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedContribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Chi tiết đóng góp</h2>
                <button
                  onClick={() => {
                    setSelectedContribution(null);
                    setAdminNotes('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {contributionType === 'dish' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên món ăn:</label>
                      <p className="text-gray-900">{(selectedContribution as DishContribution).name}</p>
                    </div>
                    {(selectedContribution as DishContribution).description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả:</label>
                        <p className="text-gray-900">{(selectedContribution as DishContribution).description}</p>
                      </div>
                    )}
                    {(selectedContribution as DishContribution).tags && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tags:</label>
                        <p className="text-gray-900">{(selectedContribution as DishContribution).tags}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên quán ăn:</label>
                      <p className="text-gray-900">{(selectedContribution as RestaurantContribution).restaurantName}</p>
                    </div>
                    {(selectedContribution as RestaurantContribution).description && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả:</label>
                        <p className="text-gray-900">{(selectedContribution as RestaurantContribution).description}</p>
                      </div>
                    )}
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú admin</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Nhập ghi chú..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleApprove}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Duyệt'}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={isLoading}
                    className={`flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? 'Đang xử lý...' : 'Từ chối'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
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

export default ContributionsManagement;
