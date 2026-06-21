'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: number | null;
  isAuthenticated: boolean;
  login: (token: string, role: string, userId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token,  setToken]  = useState<string | null>(null);
  const [role,   setRole]   = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const t = localStorage.getItem('token');
    const r = localStorage.getItem('role');
    const u = localStorage.getItem('userId');
    if (t) {
      setToken(t);
      setRole(r);
      setUserId(u ? Number(u) : null);
    }
  }, []);

  const login = (t: string, r: string, u: number) => {
    localStorage.setItem('token', t);
    localStorage.setItem('role', r);
    localStorage.setItem('userId', String(u));
    setToken(t);
    setRole(r);
    setUserId(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
