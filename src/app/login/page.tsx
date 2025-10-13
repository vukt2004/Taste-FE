'use client';

import { FormEvent, useState } from 'react';
import { login, getApiErrorMessage } from '@/lib/api';
import styles from './styles.module.css';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function isValidEmail(value: string): boolean {
    // RFC 5322 simplified
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!isValidEmail(email)) {
        throw { message: 'Email không hợp lệ' };
      }
      await login({ email, password });
      if (remember && typeof window !== 'undefined') {
        localStorage.setItem('remember_email', email);
      }
      window.location.href = '/';
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Đăng nhập</h1>
        <p className={styles.subtitle}>Truy cập vào tài khoản của bạn</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>Email</label>
          <input
            className={styles.input}
            type="text"
            inputMode="email"
            autoComplete="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className={styles.label}>Mật khẩu</label>
          <input
            className={styles.input}
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className={styles.rowBetween}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              Ghi nhớ đăng nhập
            </label>
            <a className={styles.link} href="#">Quên mật khẩu?</a>
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <div className={styles.divider} />

        <button
          className={styles.googleBtn}
          onClick={() => {
            const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
            window.location.href = `${base}/api/auth/google`;
          }}
        >
          <span className={styles.googleIcon}>
            {/* Google G icon */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.625 32.676 29.223 36 24 36c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.869 6.053 29.706 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20c10.493 0 19.128-7.637 19.128-20 0-1.341-.147-2.651-.417-3.917z"/>
              <path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.266 16.113 18.762 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.869 6.053 29.706 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.154 0 9.86-1.976 13.4-5.2l-6.2-5.2C29.223 36 25.625 32.676 24 28H12.877l-6.49 5.006C9.7 39.74 16.322 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.083 3.186-3.46 5.657-6.103 7.2l.001-.001 6.2 5.2C37.486 41.19 44 36 44 24c0-1.341-.147-2.651-.389-3.917z"/>
            </svg>
          </span>
          Đăng nhập bằng Google
        </button>

        <p className={styles.footerText}>
          Chưa có tài khoản? <Link className={styles.link} href="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}


