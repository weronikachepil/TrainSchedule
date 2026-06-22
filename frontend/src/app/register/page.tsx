'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login } = useAuth();
  const router    = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    if (password.length < 6)    { setError('Пароль має бути не менше 6 символів'); return; }
    if (password !== confirm)    { setError('Паролі не збігаються'); return; }
    setLoading(true);
    try {
      const res = await authApi.register(email, password);
      login(res.access_token, res.role, res.id);
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Помилка реєстрації');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[420px] mb-5">
        <Link href="/" className="text-ml text-[0.82rem] no-underline font-sans flex items-center gap-[6px] w-fit">
          ← Назад до розкладу
        </Link>
      </div>

      <div className="bg-cream rounded-[28px] px-[clamp(28px,5vw,44px)] py-[clamp(32px,6vw,48px)] w-full max-w-[420px] shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
        <div className="mb-8">
          <p className="font-headline text-[1.05rem] font-bold text-td m-0">
            TrainSchedule<span className="text-accent text-[0.55rem] align-super ml-px">®</span>
          </p>
        </div>

        <p className="text-[0.7rem] font-semibold text-accent tracking-[0.12em] uppercase m-0 mb-1 font-sans">
          Новий акаунт
        </p>
        <h1 className="font-headline font-extrabold text-[2.4rem] text-td m-0 mb-[6px] tracking-[-0.02em] leading-none">
          Реєстрація
        </h1>
        <p className="text-md text-[0.875rem] m-0 mb-[30px] font-sans">
          Зареєструйся, щоб зберігати улюблені маршрути
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            placeholder="Пароль (мін. 6 символів)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Повторіть пароль"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />

          {error && (
            <div className="bg-[rgba(180,60,60,0.08)] border border-[rgba(180,60,60,0.2)] rounded-[10px] px-[14px] py-[10px] text-[#8B3030] text-[0.875rem] font-sans">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`py-[14px] border-none rounded-[12px] text-cream font-semibold text-[0.95rem] font-sans mt-[6px] transition-colors duration-200 ${loading ? 'bg-[rgba(26,21,17,0.35)] cursor-not-allowed' : 'bg-dark cursor-pointer'}`}
          >
            {loading ? 'Реєстрація...' : 'Створити акаунт'}
          </button>
        </form>

        <p className="text-center mt-6 text-md text-[0.875rem] font-sans m-0">
          Вже є акаунт?{' '}
          <Link href="/login" className="text-accent font-semibold no-underline">
            Увійти →
          </Link>
        </p>
      </div>
    </div>
  );
}
