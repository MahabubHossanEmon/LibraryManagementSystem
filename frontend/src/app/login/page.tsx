'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Library, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, KeyRound } from 'lucide-react';
import { useAuth, DEMO_USERS } from '@/lib/auth-context';
import { useToast } from '@/components/toast';
import { Role } from '@/lib/types';

export default function LoginPage() {
  const router = useRouter();
  const { login, loginDemo } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('admin@lms.com');
  const [password, setPassword] = useState('admin123');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please enter both email and password', 'error');
      return;
    }

    try {
      setIsSubmitting(true);
      await login(email, password);
      showToast('Signed in successfully!', 'success');
      router.push('/');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid credentials';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoClick = (role: Role) => {
    loginDemo(role);
    showToast(`Signed in as ${role} (Demo Account)`, 'success');
    router.push('/');
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-500/25">
          <Library className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Sign In to Library Core</h1>
        <p className="text-xs text-zinc-400">Enterprise Clean Architecture Portal</p>
      </div>

      {/* Quick Demo Sign In Buttons */}
      <div className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3">
        <p className="text-xs font-semibold text-zinc-400 text-center uppercase tracking-wider">
          Instant Demo One-Click Sign In
        </p>
        <div className="grid grid-cols-3 gap-2">
          {(['Admin', 'Librarian', 'Member'] as Role[]).map((role) => (
            <button
              key={role}
              onClick={() => handleDemoClick(role)}
              type="button"
              className="py-2.5 px-3 rounded-xl bg-zinc-950 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-zinc-800 text-xs font-bold text-zinc-200 transition-all flex flex-col items-center gap-1 group"
            >
              <KeyRound className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span>{role}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@lms.com"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full bg-zinc-950 border border-zinc-800 text-sm text-zinc-100 placeholder-zinc-500 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Signing In...</span>
          ) : (
            <>
              <span>Authenticate & Enter</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-zinc-500">
          Don't have an account?{' '}
          <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
            Register New Account
          </Link>
        </p>
      </div>
    </div>
  );
}
