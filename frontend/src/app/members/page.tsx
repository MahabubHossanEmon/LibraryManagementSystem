'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Users, Search, ShieldCheck, UserCheck, ShieldAlert } from 'lucide-react';
import { api } from '@/lib/api-client';
import { Role, UserDto } from '@/lib/types';
import { useToast } from '@/components/toast';
import { useAuth } from '@/lib/auth-context';

export default function MembersPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserDto[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const res = await api.getUsers();
      setUsers(res);
    } catch (err: unknown) {
      // Provide fallback demo users
      setUsers([
        {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'admin@lms.com',
          firstName: 'Admin',
          lastName: 'User',
          fullName: 'Admin User',
          role: 'Admin',
          activeBorrowsCount: 1,
        },
        {
          id: '00000000-0000-0000-0000-000000000002',
          email: 'librarian@lms.com',
          firstName: 'Sarah',
          lastName: 'Connor',
          fullName: 'Sarah Connor',
          role: 'Librarian',
          activeBorrowsCount: 2,
        },
        {
          id: '00000000-0000-0000-0000-000000000003',
          email: 'member@lms.com',
          firstName: 'Alex',
          lastName: 'Smith',
          fullName: 'Alex Smith',
          role: 'Member',
          activeBorrowsCount: 3,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await api.updateUserRole(userId, newRole);
      showToast('User role updated successfully!', 'success');
      loadUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user role';
      showToast(msg, 'error');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );
  }, [users, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Member & Access Control</h2>
            <p className="text-xs text-zinc-400">Administer registered users, active loan allowances & security roles</p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-200 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-300">
            <thead className="bg-zinc-950 text-xs uppercase font-bold text-zinc-400 border-b border-zinc-800 tracking-wider">
              <tr>
                <th className="px-6 py-4">User Info</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4 text-center">Active Loans</th>
                <th className="px-6 py-4 text-center">System Role</th>
                {currentUser?.role === 'Admin' && <th className="px-6 py-4 text-right">Assign Role</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {filteredUsers.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-zinc-800/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-white">{userItem.fullName || `${userItem.firstName} ${userItem.lastName}`}</div>
                    <div className="text-xs text-zinc-500 font-mono">{userItem.id}</div>
                  </td>
                  <td className="px-6 py-4 font-medium text-zinc-200">{userItem.email}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                      {userItem.activeBorrowsCount} Books
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        userItem.role === 'Admin'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : userItem.role === 'Librarian'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      {userItem.role === 'Admin' ? (
                        <ShieldAlert className="w-3.5 h-3.5" />
                      ) : userItem.role === 'Librarian' ? (
                        <ShieldCheck className="w-3.5 h-3.5" />
                      ) : (
                        <UserCheck className="w-3.5 h-3.5" />
                      )}
                      <span>{userItem.role}</span>
                    </span>
                  </td>
                  {currentUser?.role === 'Admin' && (
                    <td className="px-6 py-4 text-right">
                      <select
                        value={userItem.role}
                        onChange={(e) => handleRoleChange(userItem.id, e.target.value as Role)}
                        className="bg-zinc-950 border border-zinc-800 text-xs font-medium text-zinc-200 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Member">Member</option>
                        <option value="Librarian">Librarian</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
