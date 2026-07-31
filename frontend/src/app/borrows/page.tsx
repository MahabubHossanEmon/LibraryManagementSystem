'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { BookmarkCheck, Search, Filter, RotateCcw, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { api } from '@/lib/api-client';
import { BorrowRecordDto, BorrowStatus } from '@/lib/types';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth-context';

export default function BorrowsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [records, setRecords] = useState<BorrowRecordDto[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const loadBorrows = async () => {
    try {
      setIsLoading(true);
      const res = await api.getBorrows();
      setRecords(res);
    } catch (err: unknown) {
      // Fallback demo records
      setRecords([
        {
          id: 'br1',
          bookId: 'b1',
          bookTitle: 'Clean Architecture',
          userId: 'u1',
          userName: 'Alex Smith',
          borrowDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          dueDate: new Date(Date.now() + 9 * 86400000).toISOString(),
          status: BorrowStatus.Issued,
          statusName: 'Issued',
        },
        {
          id: 'br2',
          bookId: 'b2',
          bookTitle: 'Design Patterns',
          userId: 'u2',
          userName: 'David Miller',
          borrowDate: new Date(Date.now() - 20 * 86400000).toISOString(),
          dueDate: new Date(Date.now() - 6 * 86400000).toISOString(),
          status: BorrowStatus.Overdue,
          statusName: 'Overdue',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBorrows();
  }, []);

  const handleReturn = async (borrowId: string) => {
    try {
      await api.returnBook(borrowId);
      showToast('Book returned successfully!', 'success');
      loadBorrows();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to return book';
      showToast(msg, 'error');
    }
  };

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch =
        r.bookTitle.toLowerCase().includes(search.toLowerCase()) ||
        r.userName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'ISSUED' && r.status === BorrowStatus.Issued) ||
        (filterStatus === 'OVERDUE' && r.status === BorrowStatus.Overdue) ||
        (filterStatus === 'RETURNED' && r.status === BorrowStatus.Returned);
      return matchesSearch && matchesStatus;
    });
  }, [records, search, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Circulation & Borrow Records</h2>
            <p className="text-xs text-zinc-400">Track checkouts, return deadlines and overdue items</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search book title or member..."
            className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 shrink-0">
            <Filter className="w-4 h-4 text-indigo-400" />
            <span>Filter Status:</span>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Borrow Records</option>
            <option value="ISSUED">Issued / Active</option>
            <option value="OVERDUE">Overdue Items</option>
            <option value="RETURNED">Returned Items</option>
          </select>
        </div>
      </div>

      {/* Borrows Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-xs uppercase font-bold text-zinc-400 border-b border-zinc-800 tracking-wider">
              <tr>
                <th className="px-6 py-4">Book Title</th>
                <th className="px-6 py-4">Borrower</th>
                <th className="px-6 py-4">Borrow Date</th>
                <th className="px-6 py-4">Due Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-800/40 transition-colors">
                    <td className="px-6 py-4 font-semibold text-white">{r.bookTitle || 'Library Book'}</td>
                    <td className="px-6 py-4 font-medium text-zinc-200">{r.userName || 'Member'}</td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                      {new Date(r.borrowDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-zinc-400">
                      {new Date(r.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                          r.status === BorrowStatus.Overdue
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            : r.status === BorrowStatus.Returned
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}
                      >
                        {r.status === BorrowStatus.Overdue ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : r.status === BorrowStatus.Returned ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <Clock className="w-3.5 h-3.5" />
                        )}
                        <span>{r.statusName || (r.status === 2 ? 'Overdue' : 'Active')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.status !== BorrowStatus.Returned && (
                        <button
                          onClick={() => handleReturn(r.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Return Book</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-zinc-500 text-sm">
                    No borrow records match the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
