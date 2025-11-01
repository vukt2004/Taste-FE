import React, { useState, useEffect } from 'react';
import { listAmenities } from '../../../services/amenity';
import { UserService } from '../../../services/userService';
import { BACKEND_URL } from '../../../config/backend';
import AlertModal from '../../../components/Sidebar/contribution/AlertModal';

interface Amenity {
  id: string;
  name: string;
  isActive: boolean;
}

const AmenityManagement: React.FC = () => {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMultipleModal, setShowMultipleModal] = useState(false);
  const [newAmenityName, setNewAmenityName] = useState('');
  const [multipleAmenityNames, setMultipleAmenityNames] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    loadAmenities();
  }, []);

  const loadAmenities = async () => {
    try {
      setLoading(true);
      // Load all amenities including inactive
      const response = await UserService.fetchWithAuth(
        `${BACKEND_URL}/api/admin/amenity`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.isSuccess && data.data) {
          setAmenities(data.data);
        } else if (Array.isArray(data)) {
          setAmenities(data);
        }
      } else {
        // Fallback to public endpoint
        const data = await listAmenities({ activeOnly: false });
        setAmenities(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải danh sách tiện ích',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAmenity = async () => {
    if (!newAmenityName.trim()) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Vui lòng nhập tên tiện ích',
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await UserService.fetchWithAuth(
        `${BACKEND_URL}/api/admin/amenity`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newAmenityName.trim() }),
        }
      );

      const data = await response.json();
      if (response.ok && (data.isSuccess || data.success)) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã tạo tiện ích thành công',
          type: 'success',
        });
        setShowCreateModal(false);
        setNewAmenityName('');
        loadAmenities();
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể tạo tiện ích',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateMultipleAmenities = async () => {
    const names = multipleAmenityNames
      .split('\n')
      .map(n => n.trim())
      .filter(n => n.length > 0);

    if (names.length === 0) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Vui lòng nhập ít nhất một tên tiện ích',
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await UserService.fetchWithAuth(
        `${BACKEND_URL}/api/admin/amenity/multiple`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ names }),
        }
      );

      const data = await response.json();
      if (response.ok && (data.isSuccess || data.success)) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: `Đã tạo ${data.data?.length || names.length} tiện ích thành công`,
          type: 'success',
        });
        setShowMultipleModal(false);
        setMultipleAmenityNames('');
        loadAmenities();
      } else {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể tạo tiện ích',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredAmenities = amenities.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesActive =
      filterActive === 'all' ||
      (filterActive === 'active' && a.isActive) ||
      (filterActive === 'inactive' && !a.isActive);
    return matchesSearch && matchesActive;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Đang tải danh sách tiện ích...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quản lý tiện ích</h2>
        <div className="flex gap-2">
          <button
            onClick={loadAmenities}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Làm mới
          </button>
          <button
            onClick={() => setShowMultipleModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Thêm nhiều
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thêm tiện ích
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Tìm kiếm tiện ích..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterActive}
          onChange={(e) => setFilterActive(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Không hoạt động</option>
        </select>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Tổng số tiện ích</div>
          <div className="text-2xl font-bold text-blue-900">{amenities.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Đang hoạt động</div>
          <div className="text-2xl font-bold text-green-900">
            {amenities.filter(a => a.isActive).length}
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600">Không hoạt động</div>
          <div className="text-2xl font-bold text-red-900">
            {amenities.filter(a => !a.isActive).length}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
          <div className="text-2xl font-bold text-gray-900">{filteredAmenities.length}</div>
        </div>
      </div>

      {/* Amenity List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên tiện ích
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAmenities.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-12 text-center text-gray-500">
                    {amenities.length === 0 ? 'Chưa có tiện ích nào' : 'Không tìm thấy tiện ích nào'}
                  </td>
                </tr>
              ) : (
                filteredAmenities.map((amenity) => (
                  <tr key={amenity.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{amenity.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          amenity.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {amenity.isActive ? 'Đang hoạt động' : 'Không hoạt động'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Single Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Thêm tiện ích mới</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAmenityName('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên tiện ích <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newAmenityName}
                  onChange={(e) => setNewAmenityName(e.target.value)}
                  placeholder="Nhập tên tiện ích"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewAmenityName('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateAmenity}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tiện ích'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Multiple Modal */}
      {showMultipleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Thêm nhiều tiện ích</h3>
                <button
                  onClick={() => {
                    setShowMultipleModal(false);
                    setMultipleAmenityNames('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Danh sách tên tiện ích (mỗi dòng một tên) <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={multipleAmenityNames}
                  onChange={(e) => setMultipleAmenityNames(e.target.value)}
                  placeholder="WiFi Miễn phí&#10;Karaoke Room&#10;Valet Parking"
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-2 text-xs text-gray-500">Nhập mỗi tên tiện ích trên một dòng</p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowMultipleModal(false);
                    setMultipleAmenityNames('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateMultipleAmenities}
                  disabled={isSubmitting}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo tất cả'}
                </button>
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

export default AmenityManagement;

