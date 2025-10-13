'use client';

import { FormEvent, useState } from 'react';
import { register, getApiErrorMessage } from '@/lib/api';
import styles from './styles.module.css';
import Link from 'next/link';

type Role = 'customer' | 'restaurant' | 'admin';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<Role>('customer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!agree) {
      setError('Bạn cần đồng ý điều khoản trước khi đăng ký');
      return;
    }
    setLoading(true);
    try {
      await register({ fullName, email, password, userType: role });
      if (typeof window !== 'undefined') {
        localStorage.setItem('pending_email', email);
      }
      window.location.href = '/verify-email';
    } catch (err: unknown) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.wrapper}>
      {error && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal} role="alertdialog" aria-labelledby="err-title" aria-modal="true">
            <div className={styles.modalHeader}>
              <div id="err-title" className={styles.modalTitle}>Có lỗi xảy ra</div>
              <button type="button" className={styles.modalClose} onClick={() => setError(null)} aria-label="Đóng thông báo">×</button>
            </div>
            <div className={styles.modalBody}>{error}</div>
            <div className={styles.modalFooter}>
              <button type="button" className={styles.primaryBtn} onClick={() => setError(null)}>Đã hiểu</button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.card}>
        <div className={styles.iconCircle}>👤</div>
        <h1 className={styles.title}>Đăng ký tài khoản</h1>
        <p className={styles.subtitle}>Tạo tài khoản mới để bắt đầu sử dụng dịch vụ</p>

        <form onSubmit={onSubmit} className={styles.form}>
          <label className={styles.label}>Họ và tên</label>
          <input className={styles.input} placeholder="Nhập họ và tên của bạn" value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <label className={styles.label}>Email *</label>
          <input className={styles.input} type="email" required placeholder="Nhập địa chỉ email" value={email} onChange={(e) => setEmail(e.target.value)} />

          <label className={styles.label}>Số điện thoại</label>
          <input className={styles.input} placeholder="Nhập số điện thoại" value={phone} onChange={(e) => setPhone(e.target.value)} />

          <label className={styles.label}>Vai trò *</label>
          <div className={styles.radioGroup}>
            <label className={styles.radioItem}>
              <input type="radio" name="role" checked={role === 'customer'} onChange={() => setRole('customer')} />
              <div>
                <div className={styles.radioTitle}>Người dùng</div>
              </div>
            </label>
            <label className={styles.radioItem}>
              <input type="radio" name="role" checked={role === 'restaurant'} onChange={() => setRole('restaurant')} />
              <div>
                <div className={styles.radioTitle}>Quán ăn</div>
              </div>
            </label>
          </div>

          <label className={styles.label}>Mật khẩu *</label>
          <input className={styles.input} type="password" required placeholder="Nhập mật khẩu" value={password} onChange={(e) => setPassword(e.target.value)} />

          <label className={styles.label}>Xác nhận mật khẩu *</label>
          <input className={styles.input} type="password" required placeholder="Nhập lại mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />

          <label className={styles.checkbox}>
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
            Tôi đồng ý với <a className={styles.link} href="#">điều khoản sử dụng</a> và <a className={styles.link} href="#">chính sách bảo mật</a>
          </label>

          <button type="submit" className={styles.primaryBtn} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <p className={styles.footerText}>
          Đã có tài khoản? <Link className={styles.link} href="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
}


