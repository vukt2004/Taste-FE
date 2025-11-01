import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserService } from '../../services/userService';
import RestaurantManagement from './components/RestaurantManagement';
import UserManagement from './components/UserManagement';
import OwnershipRequests from './components/OwnershipRequests';
import ContributionsManagement from './components/ContributionsManagement';
import DishManagement from './components/DishManagement';
import AmenityManagement from './components/AmenityManagement';
import AlertModal from '../../components/Sidebar/contribution/AlertModal';

type TabType = 'dashboard' | 'restaurants' | 'users' | 'ownership' | 'contributions' | 'dishes' | 'amenities';

interface AdminDashboardProps {
  initialTab?: TabType;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'dashboard' }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    activeRestaurants: 0,
    verifiedRestaurants: 0,
    totalUsers: 0,
    pendingOwnershipRequests: 0,
    pendingContributions: 0,
  });
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
    checkAdmin();
  }, []);

  useEffect(() => {
    if (activeTab === 'dashboard') {
      loadStats();
    }
  }, [activeTab]);

  const checkAdmin = async () => {
    try {
      const user = await UserService.getCurrentUser();
      if (!user || user.userType !== 'admin') {
        navigate('/');
        return;
      }
      setLoading(false);
    } catch {
      navigate('/');
    }
  };

  const loadStats = async () => {
    try {
      // Load stats - sẽ được implement sau
      // Tạm thời set default values
      setStats({
        totalRestaurants: 0,
        activeRestaurants: 0,
        verifiedRestaurants: 0,
        totalUsers: 0,
        pendingOwnershipRequests: 0,
        pendingContributions: 0,
      });
    } catch {
      setAlertModal({
        isOpen: true,
        title: 'Lỗi',
        message: 'Không thể tải thống kê',
        type: 'error',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 flex flex-col overflow-hidden w-full">
        {/* Navigation Tabs */}
        <div className="mb-6 flex-shrink-0">
          <nav className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tổng quan
            </button>
            <button
              onClick={() => setActiveTab('restaurants')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'restaurants'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Quản lý quán ăn
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'users'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Quản lý người dùng
            </button>
            <button
              onClick={() => setActiveTab('ownership')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'ownership'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Yêu cầu claim
            </button>
            <button
              onClick={() => setActiveTab('contributions')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'contributions'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Đóng góp
            </button>
            <button
              onClick={() => setActiveTab('dishes')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'dishes'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Món ăn
            </button>
            <button
              onClick={() => setActiveTab('amenities')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'amenities'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Tiện ích
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex-1 flex flex-col overflow-hidden">
          {activeTab === 'dashboard' && (
            <div className="p-6 overflow-y-auto scrollbar-hide flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Tổng quan hệ thống</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stat Card - Restaurants */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Tổng số quán ăn</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalRestaurants}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        {stats.activeRestaurants} đang hoạt động • {stats.verifiedRestaurants} đã xác thực
                      </p>
                    </div>
                    <div className="bg-blue-500 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stat Card - Users */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600">Tổng số người dùng</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">{stats.totalUsers}</p>
                    </div>
                    <div className="bg-green-500 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stat Card - Pending Requests */}
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-6 border border-yellow-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-600">Yêu cầu chờ xử lý</p>
                      <p className="text-3xl font-bold text-yellow-900 mt-2">{stats.pendingOwnershipRequests}</p>
                      <p className="text-xs text-yellow-600 mt-1">
                        {stats.pendingContributions} đóng góp chờ duyệt
                      </p>
                    </div>
                    <div className="bg-yellow-500 rounded-full p-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-gray-900">Quản lý quán ăn</div>
                    <div className="text-xs text-gray-500 mt-1">Xem và quản lý tất cả quán ăn</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-gray-900">Quản lý người dùng</div>
                    <div className="text-xs text-gray-500 mt-1">Xem và quản lý người dùng</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('ownership')}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-gray-900">Yêu cầu claim</div>
                    <div className="text-xs text-gray-500 mt-1">Xét duyệt yêu cầu làm chủ quán</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('contributions')}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-gray-900">Đóng góp</div>
                    <div className="text-xs text-gray-500 mt-1">Duyệt đóng góp món ăn/quán ăn</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('dishes')}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-gray-900">Quản lý món ăn</div>
                    <div className="text-xs text-gray-500 mt-1">Xem và quản lý tất cả món ăn</div>
                  </button>
                  <button
                    onClick={() => setActiveTab('amenities')}
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="text-sm font-medium text-gray-900">Quản lý tiện ích</div>
                    <div className="text-xs text-gray-500 mt-1">Xem và quản lý tất cả tiện ích</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            {activeTab === 'restaurants' && <RestaurantManagement />}
            {activeTab === 'users' && <UserManagement />}
            {activeTab === 'ownership' && <OwnershipRequests />}
            {activeTab === 'contributions' && <ContributionsManagement />}
            {activeTab === 'dishes' && <DishManagement />}
            {activeTab === 'amenities' && <AmenityManagement />}
          </div>
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

export default AdminDashboard;
