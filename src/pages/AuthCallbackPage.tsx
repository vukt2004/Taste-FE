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

    const notifyAndClose = (type: 'success' | 'error', data?: { token?: string; user?: unknown; error?: string }) => {
      try {
        if (window.opener && !window.opener.closed) {
          window.opener.postMessage(
            type === 'success'
              ? { type: 'GOOGLE_AUTH_SUCCESS', ...data }
              : { type: 'GOOGLE_AUTH_ERROR', error: data?.error || 'Đăng nhập thất bại' },
            window.location.origin
          );
        }
      } finally {
        if (window.opener && !window.opener.closed) {
          setTimeout(() => window.close(), 100);
        } else {
          // Trường hợp cùng tab: điều hướng về trang chủ
          setTimeout(() => { window.location.replace('/'); }, 100);
        }
      }
    };

    (async () => {
      if (!token) {
        setMessage('Thiếu token trong callback.');
        notifyAndClose('error', { error: 'missing_token' });
        return;
      }

      try {
        localStorage.setItem('auth_token', token);

        const payload = decodeJwtPayload(token);
        const userId = extractUserIdFromJwtPayload(payload);

        if (!userId) {
          setMessage('Không trích xuất được UserId từ token.');
          notifyAndClose('error', { error: 'invalid_token_payload' });
          return;
        }

        localStorage.setItem('user_id', userId);

        const response = await fetch(`${BACKEND_URL}${API_ENDPOINTS.USER.GET_BY_ID}/${userId}`);
        const user = await response.json();

        setMessage('Đăng nhập thành công, đang đóng cửa sổ...');
        notifyAndClose('success', { token, user });
      } catch {
        setMessage('Có lỗi xảy ra khi xử lý callback.');
        notifyAndClose('error', { error: 'callback_processing_error' });
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


