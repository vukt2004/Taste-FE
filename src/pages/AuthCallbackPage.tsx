import React, { useEffect, useState } from 'react';
import { BACKEND_URL, API_ENDPOINTS } from '../config/backend';

type JwtPayload = Record<string, unknown>;

function decodeJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function extractUserIdFromJwtPayload(payload: JwtPayload | null): string | null {
  if (!payload) return null;
  const candidates = [
    'nameid',
    'sub',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ];
  for (const key of candidates) {
    const value = payload[key];
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }
  }
  return null;
}

const AuthCallbackPage: React.FC = () => {
  const [message, setMessage] = useState<string>('Đang xử lý đăng nhập...');

  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('token');

    (async () => {
      if (!token) {
        setMessage('Thiếu token trong callback.');
        setTimeout(() => {
          window.location.replace('/');
        }, 2000);
        return;
      }

      try {
        localStorage.setItem('auth_token', token);

        const payload = decodeJwtPayload(token);
        const userId = extractUserIdFromJwtPayload(payload);

        if (!userId) {
          setMessage('Không trích xuất được UserId từ token.');
          setTimeout(() => {
            window.location.replace('/');
          }, 2000);
          return;
        }

        localStorage.setItem('user_id', userId);

        await fetch(`${BACKEND_URL}${API_ENDPOINTS.USER.GET_BY_ID}/${userId}`);

        setMessage('Đăng nhập thành công, chuyển hướng...');
        
        // Redirect về trang chủ sau 1 giây
        setTimeout(() => {
          window.location.replace('/');
        }, 1000);
      } catch {
        setMessage('Có lỗi xảy ra khi xử lý callback.');
        setTimeout(() => {
          window.location.replace('/');
        }, 2000);
      }
    })();
  }, []);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-sm text-gray-700">{message}</div>
    </div>
  );
};

export default AuthCallbackPage;


