'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AuthResponseDto, Role } from './types';
import { api } from './api-client';

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, passwordHash: string) => Promise<void>;
  loginDemo: (role: Role) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_USERS: Record<Role, AuthUser> = {
  Admin: {
    userId: '00000000-0000-0000-0000-000000000001',
    email: 'admin@lms.com',
    role: 'Admin',
  },
  Librarian: {
    userId: '00000000-0000-0000-0000-000000000002',
    email: 'librarian@lms.com',
    role: 'Librarian',
  },
  Member: {
    userId: '00000000-0000-0000-0000-000000000003',
    email: 'member@lms.com',
    role: 'Member',
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('lms_token');
      const storedUser = localStorage.getItem('lms_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } else {
        setUser(null);
        setToken(null);
      }
    } catch {
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponseDto = await api.login({ email, password });
      const authUser: AuthUser = {
        userId: res.userId,
        email: res.email,
        role: res.role,
      };
      setToken(res.token);
      setUser(authUser);
      localStorage.setItem('lms_token', res.token);
      localStorage.setItem('lms_user', JSON.stringify(authUser));
    } catch (err: unknown) {
      // Check if credentials match known demo accounts for offline/demo resilience
      const matchedDemo = Object.values(DEMO_USERS).find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase()
      );
      if (matchedDemo && (password === 'admin123' || password === 'demo123' || password === 'password')) {
        const demoToken = `demo-token-${matchedDemo.role.toLowerCase()}`;
        setToken(demoToken);
        setUser(matchedDemo);
        localStorage.setItem('lms_token', demoToken);
        localStorage.setItem('lms_user', JSON.stringify(matchedDemo));
        return;
      }

      // Otherwise, clear state and throw the error to be displayed on the login page
      setUser(null);
      setToken(null);
      localStorage.removeItem('lms_token');
      localStorage.removeItem('lms_user');
      const errorMsg = err instanceof Error ? err.message : 'Invalid email or password';
      throw new Error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginDemo = useCallback((role: Role) => {
    const demoUser = DEMO_USERS[role];
    const demoToken = `demo-token-${role.toLowerCase()}`;
    setUser(demoUser);
    setToken(demoToken);
    localStorage.setItem('lms_token', demoToken);
    localStorage.setItem('lms_user', JSON.stringify(demoUser));
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      loginDemo,
      logout,
    }),
    [user, token, isLoading, login, loginDemo, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
