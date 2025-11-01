import React, { useState, useEffect } from 'react';
import { getAllUsersForAdmin } from '../../../services/user';
import AlertModal from '../../../components/Sidebar/contribution/AlertModal';

interface User {
  id: string;
  username: string;
  email: string;
  fullName?: string;
  userType: string;
  isVerified: boolean;
  points: number;
  createdAt: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'admin' | 'customer'>('all');
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
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsersForAdmin();
      
      if (response.isSuccess && response.data) {
        // Map từ UserDto sang User format
        const usersData = (response.data as Array<{
          id?: string;
          email?: string;
          username?: string;
          fullName?: string;
          userType?: string;
          authProvider?: string;
          points?: number;
          isVerified?: boolean;
          status?: string;
          createdAt?: string;
        }>).map((u) => ({
          id: u.id || '',
          username: u.username || '',
          email: u.email || '',
          fullName: u.fullName,
          userType: u.userType || 'user',
          isVerified: u.isVerified ?? false,
          points: u.points || 0,
          createdAt: u.createdAt || new Date().toISOString(),
        }));
        setUsers(usersData);
      }
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải danh sách người dùng',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || u.userType === filterType;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">Đang tải danh sách người dùng...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-hide p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Quản lý người dùng</h2>
        <button
          onClick={loadUsers}
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
              placeholder="Tìm kiếm người dùng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'admin' | 'customer')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả loại</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600">Tổng số người dùng</div>
          <div className="text-2xl font-bold text-blue-900">{users.length}</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600">Admin</div>
          <div className="text-2xl font-bold text-green-900">
            {users.filter(u => u.userType === 'admin').length}
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600">User</div>
          <div className="text-2xl font-bold text-purple-900">
            {users.filter(u => u.userType === 'user').length}
          </div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-600">Kết quả tìm kiếm</div>
          <div className="text-2xl font-bold text-gray-900">{filteredUsers.length}</div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tên đăng nhập
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xác thực
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày tạo
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {users.length === 0
                      ? 'API quản lý người dùng chưa được implement'
                      : 'Không tìm thấy người dùng nào'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.fullName || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.userType === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.userType === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.points || 0}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          user.isVerified
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {user.isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

export default UserManagement;

