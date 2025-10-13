import axios, { AxiosError } from 'axios';

// Read base URL from env at build time
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://localhost:7268';

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token from localStorage if available (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('jwt_token');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize error shape
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<unknown>) => {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; errors?: unknown; error?: unknown; detail?: unknown } | undefined;
    const message = data?.message || error.message;
    const details = (data && (data.errors || data.error || data.detail)) ?? undefined;
    return Promise.reject({ status, message, details, raw: error });
  }
);

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  accessToken: string;
  tokenType?: string;
  user?: unknown;
};

// Helper to get device info and public IP (best-effort)
async function getClientNetworkInfo() {
  let ip: string | undefined;
  try {
    const res = await fetch('https://api.ipify.org?format=json');
    if (res.ok) {
      const j = await res.json();
      ip = j.ip;
    }
  } catch {}
  const deviceKey = ((): string => {
    if (typeof window === 'undefined') return '';
    const k = localStorage.getItem('device_key');
    if (k) return k;
    const newKey = crypto.randomUUID();
    localStorage.setItem('device_key', newKey);
    return newKey;
  })();
  const deviceName = typeof navigator !== 'undefined' ? navigator.userAgent : undefined;
  return { ip, deviceKey, deviceName };
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const net = await getClientNetworkInfo();
  const { data } = await api.post<AuthResponse>('/api/auth/login', {
    ...payload,
    deviceKey: net.deviceKey,
    deviceName: net.deviceName
  });
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', data.accessToken);
  }
  return data;
}

export type RegisterPayload = {
  fullName?: string;
  email: string;
  password: string;
  userType: 'customer' | 'restaurant' | 'admin';
  username?: string; // nếu không truyền, client sẽ tự tạo từ email
};

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const username = payload.username || payload.email.split('@')[0];
  const body: Record<string, unknown> = { ...payload, username, authProvider: 'email' };
  const { data } = await api.post<AuthResponse>('/api/auth/register', body);
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt_token', data.accessToken);
  }
  return data;
}

// Map backend error payloads to user-friendly Vietnamese message
export function getApiErrorMessage(err: unknown): string {
  const e = err as { status?: number; message?: string; details?: unknown };
  if (!e) return 'Đã xảy ra lỗi không xác định';
  const raw = (e.message || '').toLowerCase();

  // 409 conflict
  if (e.status === 409) {
    if (raw.includes('email')) return 'Email đã tồn tại';
    if (raw.includes('username') || raw.includes('user name')) return 'Tên đăng nhập đã tồn tại';
    return 'Dữ liệu đã tồn tại';
  }
  // 400 validation
  if (e.status === 400) {
    if (typeof e.details === 'string') return translateValidation(e.details);
    if (Array.isArray(e.details)) return (e.details as string[]).map(translateValidation).join('\n');
    if (e.details && typeof e.details === 'object') {
      try {
        const vals = Object.values(e.details as Record<string, unknown>);
        const flat = ([] as string[]).concat(...vals.map(v => Array.isArray(v) ? (v as string[]) : [String(v)]));
        return flat.map(s => translateValidation(String(s))).join('\n');
      } catch {}
    }
    return translateValidation(e.message || 'Dữ liệu không hợp lệ');
  }
  // 401 unauthorized
  if (e.status === 401) return 'Email hoặc mật khẩu không đúng';
  // Device/IP restriction
  if (raw.includes('thiết bị') && raw.includes('tài khoản')) {
    return 'Thiết bị đang dùng tài khoản khác';
  }
  return translateValidation(e.message || 'Lỗi máy chủ, vui lòng thử lại sau');
}

function translateValidation(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes('email already exists')) return 'Email đã tồn tại';
  if (m.includes('username already exists')) return 'Tên đăng nhập đã tồn tại';
  if (m.includes('invalid email') || m.includes('email is invalid')) return 'Email không hợp lệ';
  if (m.includes('password') && m.includes('at least')) return 'Mật khẩu chưa đủ độ dài yêu cầu';
  if (m.includes('required') || m.includes('is required') || m.includes('cannot be null')) return 'Vui lòng điền đầy đủ thông tin bắt buộc';
  if (m.includes('forbidden')) return 'Bạn không có quyền thực hiện hành động này';
  if (m.includes('not found')) return 'Không tìm thấy dữ liệu';
  if (m.includes('too many') || m.includes('rate limit')) return 'Bạn thao tác quá nhanh, vui lòng thử lại sau';
  return msg;
}

// Email verification APIs
export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export async function verifyEmail(payload: VerifyEmailPayload): Promise<{ message: string }>{
  const { data } = await api.post<{ message: string }>('/api/email-verification/verify', payload);
  return data;
}

export async function resendOtp(email: string): Promise<{ message: string }>{
  const { data } = await api.post<{ message: string }>('/api/email-verification/resend', { email });
  return data;
}


