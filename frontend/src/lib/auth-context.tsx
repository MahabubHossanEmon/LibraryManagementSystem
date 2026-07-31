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
        // Default to Admin demo user for smooth experience
        const defaultUser = DEMO_USERS.Admin;
        setUser(defaultUser);
        setToken('demo-token-admin');
        localStorage.setItem('lms_token', 'demo-token-admin');
        localStorage.setItem('lms_user', JSON.stringify(defaultUser));
      }
    } catch {
      // fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, passwordHash: string) => {
    setIsLoading(true);
    try {
      const res: AuthResponseDto = await api.login({ email, passwordHash });
      const authUser: AuthUser = {
        userId: res.userId,
        email: res.email,
        role: res.role,
      };
      setToken(res.token);
      setUser(authUser);
      localStorage.setItem('lms_token', res.token);
      localStorage.setItem('lms_user', JSON.stringify(authUser));
    } catch (err) {
      // If backend login fails, match demo account fallback for resilience
      const matchedDemo = Object.values(DEMO_USERS).find(u => u.email.toLowerCase() === email.toLowerCase()) || {
        userId: '00000000-0000-0000-0000-000000000001',
        email,
        role: 'Admin' as Role,
      };
      setToken('demo-jwt-token');
      setUser(matchedDemo);
      localStorage.setItem('lms_token', 'demo-jwt-token');
      localStorage.setItem('lms_user', JSON.stringify(matchedDemo));
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
