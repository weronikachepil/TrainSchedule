'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const router    = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.login(email, password);
      login(res.access_token, res.role, res.id);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Невірний email або пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--page-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    }}>
      {/* Back link */}
      <div style={{ width: '100%', maxWidth: 420, marginBottom: 20 }}>
        <Link href="/" style={{
          color: 'var(--muted-l)',
          fontSize: '0.82rem',
          textDecoration: 'none',
          fontFamily: 'var(--font-sans)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          width: 'fit-content',
        }}>
          ← Назад до розкладу
        </Link>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--cream)',
        borderRadius: 28,
        padding: 'clamp(32px, 6vw, 48px) clamp(28px, 5vw, 44px)',
        width: '100%',
        maxWidth: 420,
        boxShadow: '0 40px 100px rgba(0,0,0,0.4)',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: 32 }}>
          <p style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--text-d)',
            margin: 0,
            letterSpacing: '0.01em',
          }}>
            TrainSchedule<span style={{ color: 'var(--accent)', fontSize: '0.55rem', verticalAlign: 'super', marginLeft: 1 }}>®</span>
          </p>
        </div>

        {/* Heading */}
        <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: 'var(--font-sans)' }}>
          Вхід до акаунту
        </p>
        <h1 style={{ fontFamily: 'var(--font-syne)', fontWeight: 800, fontSize: '2.4rem', color: 'var(--text-d)', margin: '0 0 6px', letterSpacing: '-0.02em', lineHeight: 1 }}>
          З поверненням
        </h1>
        <p style={{ color: 'var(--muted-d)', fontSize: '0.875rem', margin: '0 0 30px', fontFamily: 'var(--font-sans)' }}>
          Увійди, щоб зберігати улюблені маршрути
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          {error && (
            <div style={{ background: 'rgba(180,60,60,0.08)', border: '1px solid rgba(180,60,60,0.2)', borderRadius: 10, padding: '10px 14px', color: '#8B3030', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '14px',
              background: loading ? 'rgba(26,21,17,0.35)' : 'var(--dark)',
              color: 'var(--cream)',
              border: 'none', borderRadius: 12,
              fontWeight: 600, fontSize: '0.95rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 6, fontFamily: 'var(--font-sans)',
              transition: 'background 0.18s',
            }}
          >
            {loading ? 'Вхід...' : 'Увійти'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, color: 'var(--muted-d)', fontSize: '0.875rem', fontFamily: 'var(--font-sans)' }}>
          Немає акаунту?{' '}
          <Link href="/register" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            Зареєструватись →
          </Link>
        </p>
      </div>
    </div>
  );
}
