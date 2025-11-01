import React, { useState, useEffect } from 'react';
import { listDishes, createDish } from '../../../services/dish';
import AlertModal from '../../../components/Sidebar/contribution/AlertModal';

interface Dish {
  id: string;
  name: string;
  description?: string;
  tags?: string;
  isAvailable?: boolean;
}

const DishManagement: React.FC = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDishName, setNewDishName] = useState('');
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
    loadDishes();
  }, []);

  const loadDishes = async () => {
    try {
      setLoading(true);
      const data = await listDishes();
      setDishes(Array.isArray(data) ? data : []);
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải danh sách món ăn',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDish = async () => {
    if (!newDishName.trim()) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Vui lòng nhập tên món ăn',
        type: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await createDish({
        name: newDishName.trim(),
      });

      if (response.isSuccess || response.success) {
        setAlertModal({
          isOpen: true,
          title: 'Thành công',
          message: 'Đã tạo món ăn thành công',
          type: 'success',
        });
        setShowCreateModal(false);
        setNewDishName('');
        loadDishes();
      } else {
        throw new Error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: error instanceof Error ? error.message : 'Không thể tạo món ăn',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDishes = dishes.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Đang tải danh sách món ăn...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quản lý món ăn</h2>
        <div className="flex gap-2">
          <button
            onClick={loadDishes}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Làm mới
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Thêm món ăn
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Tìm kiếm món ăn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Tổng số món ăn</div>
          <div className="text-2xl font-bold text-blue-900">{dishes.length}</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
          <div className="text-2xl font-bold text-gray-900">{filteredDishes.length}</div>
        </div>
      </div>

      {/* Dish List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên món ăn
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDishes.length === 0 ? (
                <tr>
                  <td className="px-6 py-12 text-center text-gray-500">
                    {dishes.length === 0 ? 'Chưa có món ăn nào' : 'Không tìm thấy món ăn nào'}
                  </td>
                </tr>
              ) : (
                filteredDishes.map((dish) => (
                  <tr key={dish.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Thêm món ăn mới</h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDishName('');
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tên món ăn <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  placeholder="Nhập tên món ăn"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newDishName.trim()) {
                      handleCreateDish();
                    }
                  }}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewDishName('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateDish}
                  disabled={isSubmitting || !newDishName.trim()}
                  className={`flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors ${
                    isSubmitting || !newDishName.trim() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo món ăn'}
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

export default DishManagement;

