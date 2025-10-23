import React, { useEffect, useState, useCallback } from 'react';
import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';
import { UserService, type User } from '../services/userService';

interface GoogleLoginProps {
  onLoginSuccess?: (user: User) => void;
  onLogout?: () => void;
}

const GoogleLogin: React.FC<GoogleLoginProps> = ({ onLoginSuccess, onLogout }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      const userData = await UserService.getCurrentUser();
      if (userData) {
        setUser(userData);
        console.log('userData', userData);
        onLoginSuccess?.(userData);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra trạng thái đăng nhập:', err);
      // Nếu token hết hạn, xóa khỏi localStorage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
    }
  }, [onLoginSuccess]);

  useEffect(() => {
    checkAuthStatus();
    
    // Xử lý callback từ Google OAuth
    const handleAuthCallback = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const refreshToken = urlParams.get('refreshToken');
      const expiresAt = urlParams.get('expiresAt');
      const userData = urlParams.get('user');
      
      if (token && userData) {
        try {
          // Lưu token và thông tin user
          localStorage.setItem('auth_token', token);
          if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
          if (expiresAt) localStorage.setItem('token_expires_at', expiresAt);
          
          const user = JSON.parse(decodeURIComponent(userData));
          localStorage.setItem('user_id', user.id);
          
          setUser(user);
          onLoginSuccess?.(user);
          
          // Xóa các tham số khỏi URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error('Lỗi xử lý callback đăng nhập:', err);
          setError('Lỗi xử lý đăng nhập');
        }
      }
    };
    
    handleAuthCallback();
  }, [checkAuthStatus, onLoginSuccess]);

  const handleGoogleLogin = () => {
    setIsLoading(true);
    setError(null);
    
    console.log('[FRONTEND] ==================== BEFORE GOOGLE LOGIN ====================');
    console.log('[FRONTEND] Backend URL:', BACKEND_URL);
    console.log('[FRONTEND] Current cookies:', document.cookie);
    console.log('[FRONTEND] Current URL:', window.location.href);
    
    // Redirect directly to Google OAuth
    // Backend will initialize session automatically
    const googleLoginUrl = `${BACKEND_URL}${API_ENDPOINTS.AUTH.GOOGLE_LOGIN}`;
    console.log('[FRONTEND] Redirecting to Google OAuth:', googleLoginUrl);
    console.log('[FRONTEND] ==================== REDIRECTING NOW ====================');
    
    window.location.href = googleLoginUrl;
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Backend không có logout endpoint, chỉ cần xóa token ở frontend
        console.log('Đăng xuất thành công');
      }
    } catch (err) {
      console.error('Lỗi đăng xuất:', err);
    } finally {
      // Xóa tất cả token và thông tin user
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      setUser(null);
      onLogout?.();
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.fullName?.charAt(0) || user.username?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{user.fullName || user.username}</p>
          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end">
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span className="text-sm font-medium text-gray-700">
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
        </span>
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 text-right">{error}</p>
      )}
    </div>
  );
};

export default GoogleLogin;
