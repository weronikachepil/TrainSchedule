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
    <header className="sticky top-0 z-40 bg-navbg backdrop-blur-[18px] border-b border-15-bl transition-all duration-300">
      <div className="max-w-[1200px] mx-auto px-[clamp(16px,4vw,24px)] h-[62px] flex items-center justify-between">

        <Link href="/" className="no-underline flex items-center gap-1">
          <span className="font-headline text-[1.15rem] font-bold text-tl tracking-[0.01em] transition-colors duration-300">
            TrainSchedule
          </span>
          <span className="text-[0.55rem] text-accent font-bold align-super ml-px">®</span>
        </Link>

        <div className="flex items-center gap-[clamp(4px,2vw,8px)]">

          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Увімкнути світлу тему' : 'Увімкнути темну тему'}
            className="w-9 h-9 rounded-full border-15-bl bg-transparent cursor-pointer text-base flex items-center justify-center transition-all duration-200 shrink-0 hover:bg-[rgba(128,100,80,0.12)]"
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
                className="py-[clamp(6px,1.5vw,8px)] px-[clamp(12px,3vw,20px)] border-15-bl rounded-full bg-transparent text-ml font-medium cursor-pointer text-[clamp(0.78rem,2.5vw,0.85rem)] font-sans transition-all duration-200 hover:text-tl"
              >
                Вийти
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="py-[clamp(6px,1.5vw,8px)] px-[clamp(8px,2.5vw,16px)] text-ml font-medium text-[clamp(0.78rem,2.5vw,0.85rem)] no-underline font-sans transition-colors duration-200 hover:text-tl"
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
