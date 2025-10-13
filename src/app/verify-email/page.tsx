'use client';

import { FormEvent, useEffect, useState } from 'react';
import { resendOtp, verifyEmail, getApiErrorMessage } from '@/lib/api';

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const e = localStorage.getItem('pending_email');
      if (e) setEmail(e);
    }
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await verifyEmail({ email, otp });
      setInfo('Xác thực email thành công. Bạn có thể đăng nhập.');
      if (typeof window !== 'undefined') {
        localStorage.removeItem('pending_email');
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function onResend() {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      await resendOtp(email);
      setInfo('Đã gửi lại mã OTP vào email của bạn.');
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2ff' }}>
      <form onSubmit={onSubmit} style={{ width: 420, background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: 24 }}>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, textAlign: 'center' }}>Xác thực email</h1>
        <p style={{ marginTop: 8, marginBottom: 16, textAlign: 'center', color: '#64748b' }}>Nhập mã OTP được gửi đến email của bạn</p>

        <label style={{ fontSize: 12, color: '#0f172a' }}>Email</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Nhập email" type="email" required style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4, marginBottom: 10 }} />

        <label style={{ fontSize: 12, color: '#0f172a' }}>Mã OTP</label>
        <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="Nhập mã OTP" required maxLength={6} style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid #cbd5e1', marginTop: 4 }} />

        {error && <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 12, padding: '8px 10px', borderRadius: 8, marginTop: 10 }}>{error}</div>}
        {info && <div style={{ background: '#ecfdf5', border: '1px solid #bbf7d0', color: '#065f46', fontSize: 12, padding: '8px 10px', borderRadius: 8, marginTop: 10 }}>{info}</div>}

        <button type="submit" disabled={loading} style={{ width: '100%', marginTop: 12, padding: '12px 14px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', fontWeight: 600 }}>{loading ? 'Đang xác thực...' : 'Xác thực'}</button>
        <button type="button" onClick={onResend} disabled={loading} style={{ width: '100%', marginTop: 8, padding: '10px 14px', borderRadius: 8, border: '1px solid #cbd5e1', background: '#fff' }}>Gửi lại OTP</button>
      </form>
    </div>
  );
}


