'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Activity, Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const ROUTE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'System Overview Dashboard', subtitle: 'Live metrics, active loans & inventory summary' },
  '/books': { title: 'Book Catalog & Inventory', subtitle: 'Manage titles, branch stock copies & ISBN records' },
  '/branches': { title: 'Library Branch Locations', subtitle: 'Manage physical branches and contact details' },
  '/borrows': { title: 'Circulation & Borrow Records', subtitle: 'Track active book loans, due dates & returns' },
  '/reservations': { title: 'Book Reservation Queue', subtitle: 'Monitor hold requests and queued members' },
  '/members': { title: 'Member & User Management', subtitle: 'Administer registered members and access roles' },
  '/reports': { title: 'Analytics & System Reports', subtitle: 'Audit circulation trends and overdue statistics' },
  '/login': { title: 'Account Authentication', subtitle: 'Access your library management portal' },
  '/register': { title: 'Member Registration', subtitle: 'Create a new library user account' },
};

export function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const routeInfo = ROUTE_TITLES[pathname] || {
    title: 'Library Portal',
    subtitle: 'Enterprise Clean Architecture System',
  };

  return (
    <header className="h-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/80 px-8 flex items-center justify-between sticky top-0 z-30">
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">{routeInfo.title}</h2>
        <p className="text-xs text-zinc-400 font-normal mt-0.5">{routeInfo.subtitle}</p>
      </div>

      <div className="flex items-center gap-4">
        {/* Backend Connection Indicator */}
        <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-emerald-400">C# API Connected</span>
        </div>

        {/* Search Input Placeholder */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Quick search books, members..."
            className="bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 rounded-xl pl-9 pr-4 py-2 w-64 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Notification Bell */}
        <button
          className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors relative"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        {/* User Profile Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-zinc-800">
          <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      </div>
    </header>
  );
}
