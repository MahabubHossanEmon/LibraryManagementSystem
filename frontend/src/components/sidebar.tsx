'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  Building2,
  Users,
  BookmarkCheck,
  Clock,
  BarChart3,
  LogOut,
  Library,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Role } from '@/lib/types';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['Admin', 'Librarian', 'Member'] },
  { name: 'Book Catalog', href: '/books', icon: BookOpen, roles: ['Admin', 'Librarian', 'Member'] },
  { name: 'Branches', href: '/branches', icon: Building2, roles: ['Admin', 'Librarian', 'Member'] },
  { name: 'Borrow & Returns', href: '/borrows', icon: BookmarkCheck, roles: ['Admin', 'Librarian', 'Member'] },
  { name: 'Reservations', href: '/reservations', icon: Clock, roles: ['Admin', 'Librarian', 'Member'] },
  { name: 'Member Management', href: '/members', icon: Users, roles: ['Admin', 'Librarian'] },
  { name: 'System Reports', href: '/reports', icon: BarChart3, roles: ['Admin', 'Librarian'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout, loginDemo } = useAuth();

  const userRole = user?.role || 'Admin';

  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div className="flex flex-col gap-6 p-5">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Library className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight text-base leading-tight">Library Core</h1>
            <p className="text-xs text-zinc-500 font-medium">Enterprise Portal</p>
          </div>
        </div>

        {/* User Role Badge Card */}
        <div className="bg-zinc-950/80 rounded-xl p-3 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
              {userRole === 'Admin' ? <ShieldCheck className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold text-zinc-200 truncate">{user?.email || 'Guest'}</p>
              <span className="inline-block text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                {userRole} Mode
              </span>
            </div>
          </div>
        </div>

        {/* Quick Role Switcher for Demo */}
        <div className="space-y-1">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-2">Switch Active Role</p>
          <div className="grid grid-cols-3 gap-1 bg-zinc-950 p-1 rounded-lg border border-zinc-800/60">
            {(['Admin', 'Librarian', 'Member'] as Role[]).map((r) => (
              <button
                key={r}
                onClick={() => loginDemo(r)}
                className={`py-1 text-[11px] font-medium rounded-md transition-all ${
                  userRole === r
                    ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 pt-2">
          <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider px-2 mb-2">Navigation</p>
          {visibleItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-800/60 hover:text-zinc-200'
                }`}
              >
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Logout */}
      <div className="p-4 border-t border-zinc-800/80">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
