'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from './sidebar';
import { Navbar } from './navbar';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/components/toast';
import { Library } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const { showToast } = useToast();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isAuthPage) {
      router.replace('/login');
    } else if (!isLoading && isAuthenticated && user?.role === 'Member') {
      if (pathname === '/members' || pathname === '/reports') {
        showToast('Access Denied: Admin or Librarian permissions required.', 'error');
        router.replace('/');
      }
    }
  }, [isLoading, isAuthenticated, isAuthPage, user, pathname, router, showToast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-3 text-zinc-400">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 animate-pulse">
          <Library className="w-6 h-6" />
        </div>
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Verifying Session...</p>
      </div>
    );
  }

  if (isAuthPage) {
    return <main className="min-h-screen bg-black flex items-center justify-center p-4">{children}</main>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-black">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
