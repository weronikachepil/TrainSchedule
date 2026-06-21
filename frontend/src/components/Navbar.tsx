'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

export default function Navbar() {
  const { isAuthenticated, role, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 40,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: '1px solid var(--border-l)',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        height: 62,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{
            fontFamily: 'var(--font-syne)',
            fontSize: '1.15rem',
            fontWeight: 700,
            color: 'var(--text-l)',
            letterSpacing: '0.01em',
            transition: 'color 0.3s ease',
          }}>
            TrainSchedule
          </span>
          <span style={{
            fontSize: '0.55rem',
            color: 'var(--rose)',
            fontWeight: 700,
            verticalAlign: 'super',
            marginLeft: 1,
          }}>®</span>
        </Link>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '1.5px solid var(--border-l)',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.18s, background 0.18s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(128,100,80,0.12)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {isAuthenticated ? (
            <>
              {role === 'admin' && (
                <span className="badge badge-rose">Admin</span>
              )}
              <button
                onClick={handleLogout}
                style={{
                  padding: '8px 20px',
                  border: '1.5px solid var(--border-l)',
                  borderRadius: 100,
                  background: 'transparent',
                  color: 'var(--muted-l)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontFamily: 'var(--font-sans)',
                  transition: 'color 0.18s, border-color 0.18s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-l)';
                  e.currentTarget.style.borderColor = 'var(--muted-l)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--muted-l)';
                  e.currentTarget.style.borderColor = 'var(--border-l)';
                }}
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                style={{
                  padding: '8px 16px',
                  color: 'var(--muted-l)',
                  fontWeight: 500,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-sans)',
                  transition: 'color 0.18s',
                }}
              >
                Увійти
              </Link>
              <Link href="/register" className="btn-cta">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
