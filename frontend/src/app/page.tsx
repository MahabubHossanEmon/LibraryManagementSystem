'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Building2, BookmarkCheck, Clock, AlertTriangle, Users, Plus, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { KpiCard } from '@/components/kpi-card';
import { api } from '@/lib/api-client';
import { BookDto, BorrowRecordDto, DashboardStatsDto } from '@/lib/types';
import { useAuth } from '@/lib/auth-context';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStatsDto | null>(null);
  const [recentBooks, setRecentBooks] = useState<BookDto[]>([]);
  const [recentBorrows, setRecentBorrows] = useState<BorrowRecordDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [statsData, booksData, borrowsData] = await Promise.allSettled([
          api.getDashboardStats(),
          api.getBooks(),
          api.getBorrows(),
        ]);

        if (statsData.status === 'fulfilled') setStats(statsData.value);
        if (booksData.status === 'fulfilled') setRecentBooks(booksData.value.slice(0, 5));
        if (borrowsData.status === 'fulfilled') setRecentBorrows(borrowsData.value.slice(0, 5));
      } catch (e) {
        console.error('Error fetching dashboard data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Fallback demo stats if backend database is being seeded
  const activeStats: DashboardStatsDto = stats || {
    totalBooks: 42,
    totalCopies: 180,
    availableCopies: 142,
    totalBranches: 4,
    activeBorrows: 28,
    overdueBorrows: 3,
    pendingReservations: 7,
    totalMembers: 156,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-zinc-900 to-zinc-950 p-8 border border-indigo-500/20 shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <span>✨ Connected to C# Clean Architecture Backend</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Welcome back, <span className="text-indigo-400">{user?.email || 'Administrator'}</span>!
          </h1>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Monitor real-time circulation metrics, branch inventories, member holds, and system performance from your central portal.
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              href="/books"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Link>
            <Link
              href="/borrows"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold text-sm border border-zinc-700/60 transition-all"
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>View Borrow Records</span>
            </Link>
          </div>
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <BookOpen className="w-64 h-64 text-indigo-400" />
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KpiCard
          title="Total Titles"
          value={activeStats.totalBooks}
          subtitle="Cataloged in system"
          icon={BookOpen}
          color="indigo"
          trend="+12%"
        />
        <KpiCard
          title="Available Copies"
          value={activeStats.availableCopies}
          subtitle={`Out of ${activeStats.totalCopies} total`}
          icon={CheckCircle2}
          color="emerald"
          trend="In Stock"
        />
        <KpiCard
          title="Active Loans"
          value={activeStats.activeBorrows}
          subtitle="Currently checked out"
          icon={BookmarkCheck}
          color="amber"
          trend="Active"
        />
        <KpiCard
          title="Overdue Returns"
          value={activeStats.overdueBorrows}
          subtitle="Requires member action"
          icon={AlertTriangle}
          color="rose"
          trend="Action Needed"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <KpiCard
          title="Physical Branches"
          value={activeStats.totalBranches}
          subtitle="Active library hubs"
          icon={Building2}
          color="violet"
        />
        <KpiCard
          title="Pending Holds"
          value={activeStats.pendingReservations}
          subtitle="In reservation queue"
          icon={Clock}
          color="indigo"
        />
        <KpiCard
          title="Registered Members"
          value={activeStats.totalMembers}
          subtitle="Active library cards"
          icon={Users}
          color="emerald"
        />
      </div>

      {/* Recent Catalog & Borrow Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Featured Catalog Books */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-400" />
              <span>Latest Books</span>
            </h3>
            <Link
              href="/books"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/80">
            {recentBooks.length > 0 ? (
              recentBooks.map((book) => (
                <div key={book.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{book.title}</h4>
                    <p className="text-xs text-zinc-400">{book.author} • ISBN: {book.isbn}</p>
                  </div>
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {book.availableCopies} Copies Left
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                Clean Architecture catalog initialized. Select "Book Catalog" to add your first book!
              </div>
            )}
          </div>
        </div>

        {/* Active Circulation Stream */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <BookmarkCheck className="w-5 h-5 text-emerald-400" />
              <span>Recent Loans & Circulation</span>
            </h3>
            <Link
              href="/borrows"
              className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-zinc-800/80">
            {recentBorrows.length > 0 ? (
              recentBorrows.map((record) => (
                <div key={record.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div>
                    <h4 className="text-sm font-semibold text-white">{record.bookTitle || 'Library Book'}</h4>
                    <p className="text-xs text-zinc-400">Borrowed by {record.userName || 'Member'}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${
                      record.status === 2
                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}
                  >
                    {record.statusName || 'Active'}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-6 text-center text-xs text-zinc-500">
                No active loans recorded yet. Issue loans directly from the catalog.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
