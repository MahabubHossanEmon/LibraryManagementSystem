'use client';

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  trend?: string;
  href?: string;
}

export function KpiCard({ title, value, subtitle, icon: Icon, color = 'indigo', trend, href }: KpiCardProps) {
  const colorStyles = {
    indigo: {
      bgIcon: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400',
      badge: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      glow: 'hover:border-indigo-500/50 hover:shadow-indigo-500/10',
    },
    emerald: {
      bgIcon: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
      badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      glow: 'hover:border-emerald-500/50 hover:shadow-emerald-500/10',
    },
    amber: {
      bgIcon: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
      badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      glow: 'hover:border-amber-500/50 hover:shadow-amber-500/10',
    },
    rose: {
      bgIcon: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
      badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      glow: 'hover:border-rose-500/50 hover:shadow-rose-500/10',
    },
    violet: {
      bgIcon: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
      badge: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
      glow: 'hover:border-violet-500/50 hover:shadow-violet-500/10',
    },
  }[color];

  const content = (
    <div
      className={`bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 transition-all duration-200 ${colorStyles.glow} hover:shadow-xl group flex flex-col justify-between h-full ${
        href ? 'cursor-pointer hover:-translate-y-1' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">
          {title}
        </span>
        <div className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110 ${colorStyles.bgIcon}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div>
        <div className="text-3xl font-extrabold text-white tracking-tight leading-none mb-2">
          {value}
        </div>
        <div className="flex items-center justify-between">
          {subtitle && <p className="text-xs text-zinc-500 font-normal group-hover:text-zinc-400 transition-colors">{subtitle}</p>}
          {trend && (
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${colorStyles.badge}`}>
              {trend}
            </span>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block h-full">{content}</Link>;
  }

  return content;
}
