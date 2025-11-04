import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { BACKEND_URL } from '../config/backend';
import { UserService, type User } from '../services/userService';

interface AuthFormProps {
  onLoginSuccess?: (user: User) => void;
  onLogout?: () => void;
}

type AuthMode = 'login' | 'register' | 'verify';

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess, onLogout }) => {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');

  // Get or create device key
  const getDeviceKey = (): string => {
    let deviceKey = localStorage.getItem('device_key');
    if (!deviceKey) {
      deviceKey = crypto.randomUUID();
      localStorage.setItem('device_key', deviceKey);
    }
    return deviceKey;
  };

  const getDeviceName = (): string => {
    return navigator.userAgent;
  };

  const checkAuthStatus = useCallback(async () => {
    try {
      // Try to load user from localStorage first
      const savedUserData = localStorage.getItem('user_data');
      if (savedUserData) {
        const savedUser = JSON.parse(savedUserData);
        setUser(savedUser);
        onLoginSuccess?.(savedUser);
        
        // Navigate to admin page if userType is admin
        if (savedUser.userType === 'admin') {
          navigate('/admin');
        }
      }
      
      // Then verify with backend
      const userData = await UserService.getCurrentUser();
      if (userData) {
        setUser(userData);
        onLoginSuccess?.(userData);
        localStorage.setItem('user_data', JSON.stringify(userData));
        
        // Navigate to admin page if userType is admin
        if (userData.userType === 'admin') {
          navigate('/admin');
        }
      }
    } catch {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      localStorage.removeItem('user_data');
    }
  }, [onLoginSuccess, navigate]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Generate username from email (part before @)
      const generatedUsername = email.split('@')[0];
      
      const response = await fetch(`${BACKEND_URL}/api/Auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          username: generatedUsername,
          fullName,
          userType: 'customer',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản. Nếu không thấy email, vui lòng kiểm tra thư mục spam/quảng cáo.');
        setRegisterEmail(email);
        setAuthMode('verify');
        // Clear form
        setEmail('');
        setPassword('');
        setFullName('');
      } else {
        setError(data.message || 'Đăng ký thất bại');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const deviceKey = getDeviceKey();
      const deviceName = getDeviceName();

      const response = await fetch(`${BACKEND_URL}/api/Auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          deviceKey,
          deviceName,
        }),
      });

      const data = await response.json();
      if (response.ok && data.success && data.data) {
        // Save auth data with persistent login
        localStorage.setItem('auth_token', data.data.accessToken);
        localStorage.setItem('refresh_token', data.data.refreshToken);
        localStorage.setItem('token_expires_at', data.data.expiresAt);
        localStorage.setItem('user_id', data.data.user.id);
        localStorage.setItem('user_data', JSON.stringify(data.data.user));

        // Save user data
        setUser(data.data.user);
        onLoginSuccess?.(data.data.user);
        
        // Navigate to admin page if userType is admin
        if (data.data.user.userType === 'admin') {
          navigate('/admin');
        }
        
        // Clear form
        setEmail('');
        setPassword('');
      } else {
        setError(data.message || 'Email hoặc mật khẩu không đúng');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/EmailVerification/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
          otpCode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Xác thực email thành công! Vui lòng đăng nhập.');
        setOtpCode('');
        setAuthMode('login');
      } else {
        setError(data.message || 'Mã OTP không đúng');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/EmailVerification/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage('Đã gửi lại mã OTP. Vui lòng kiểm tra email (bao gồm cả thư mục spam/quảng cáo).');
      } else {
        setError(data.message || 'Không thể gửi lại mã OTP');
      }
    } catch {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_id');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('token_expires_at');
      setUser(null);
      onLogout?.();
    } catch {
      // Silently handle logout error
    }
  };

  // If user is logged in, show user info
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
    <div className="flex flex-col items-center">
      <div className="w-80 bg-white rounded-lg shadow-lg p-6">
        {/* Tabs */}
        <div className="flex border-b mb-4">
          <button
            onClick={() => {
              setAuthMode('login');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              authMode === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng nhập
          </button>
          <button
            onClick={() => {
              setAuthMode('register');
              setError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-2 text-center font-medium transition-colors ${
              authMode === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Đăng ký
          </button>
        </div>

        {/* Messages - Only show one at a time */}
        {(error || successMessage) && (
          <div className={`mb-4 p-3 border rounded text-sm ${
            error 
              ? 'bg-red-100 border-red-400 text-red-700' 
              : 'bg-green-100 border-green-400 text-green-700'
          }`}>
            {error || successMessage}
          </div>
        )}

        {/* Login Form */}
        {authMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập mật khẩu"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>
        )}

        {/* Register Form */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ và tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>
        )}

        {/* Verify Email Form */}
        {authMode === 'verify' && (
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Nhập mã OTP đã được gửi đến email <strong>{registerEmail}</strong>
              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                💡 Nếu không thấy email, vui lòng kiểm tra thư mục <strong>Spam</strong> hoặc <strong>Quảng cáo</strong>
              </div>
            </div>
            <form onSubmit={handleVerifyEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mã OTP
                </label>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                  placeholder="000000"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Đang xác thực...' : 'Xác thực'}
              </button>
            </form>
            <button
              onClick={handleResendOtp}
              disabled={isLoading}
              className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Gửi lại mã OTP
            </button>
            <button
              onClick={() => {
                setAuthMode('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className="w-full py-2 px-4 text-blue-600 hover:text-blue-700 text-sm transition-colors"
            >
              Quay lại đăng nhập
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;

