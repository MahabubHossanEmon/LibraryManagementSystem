'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Clock,
  AlertTriangle,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  type: 'overdue' | 'reservation' | 'system' | 'loan';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Overdue Book Notice',
    description:
      'Member "Robert Downey" has an overdue loan for "Design Patterns". Return date was expected 2 days ago. Late penalty notice generated for circulation record.',
    timestamp: '10m ago',
    read: false,
    type: 'overdue',
  },
  {
    id: 'n2',
    title: 'Reservation Queue Ready',
    description:
      'Hold queue position #1 reached for "Clean Architecture". The book is now reserved and held at Central Library Branch until end of day tomorrow.',
    timestamp: '45m ago',
    read: false,
    type: 'reservation',
  },
  {
    id: 'n3',
    title: 'New Book Added to Catalog',
    description:
      'New inventory title "Refactoring: Improving the Design of Existing Code" by Martin Fowler was registered in Central Library with 5 physical copies.',
    timestamp: '2h ago',
    read: false,
    type: 'loan',
  },
  {
    id: 'n4',
    title: 'System Security & Sync',
    description:
      'API connection re-established with Clean Architecture C# Backend Service. Operational database backup performed successfully.',
    timestamp: '1d ago',
    read: true,
    type: 'system',
  },
];

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['n1'])); // n1 open by default for demo
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleItemClick = (id: string) => {
    // Mark item read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

    // Toggle expanded text state
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue':
        return <AlertTriangle className="w-4 h-4 text-rose-400" />;
      case 'reservation':
        return <Clock className="w-4 h-4 text-amber-400" />;
      case 'loan':
        return <BookOpen className="w-4 h-4 text-indigo-400" />;
      case 'system':
        return <ShieldCheck className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getBadgeStyle = (type: NotificationItem['type']) => {
    switch (type) {
      case 'overdue':
        return 'bg-rose-500/10 border-rose-500/20';
      case 'reservation':
        return 'bg-amber-500/10 border-amber-500/20';
      case 'loan':
        return 'bg-indigo-500/10 border-indigo-500/20';
      case 'system':
        return 'bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all relative ${
          isOpen
            ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-400 shadow-lg shadow-indigo-600/20'
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
        }`}
        aria-label="Toggle notifications menu"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center ring-2 ring-zinc-950 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-zinc-900/95 border border-zinc-800/90 rounded-2xl shadow-2xl backdrop-blur-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Panel Header */}
          <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm tracking-tight">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="px-5 py-2 bg-zinc-950/60 border-b border-zinc-800/80 flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'all'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === 'unread'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-zinc-800/60">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((item) => {
                const isExpanded = expandedIds.has(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item.id)}
                    className={`p-4 transition-all cursor-pointer group flex items-start gap-3 relative border-l-2 ${
                      !item.read
                        ? 'bg-indigo-950/20 hover:bg-indigo-950/35 border-l-indigo-500'
                        : 'hover:bg-zinc-800/40 border-l-transparent'
                    }`}
                  >
                    {/* Category Icon Badge */}
                    <div
                      className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${getBadgeStyle(
                        item.type
                      )}`}
                    >
                      {getIcon(item.type)}
                    </div>

                    {/* Notification Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-2">
                        <h4
                          className={`text-xs font-bold ${
                            !item.read ? 'text-white' : 'text-zinc-300'
                          }`}
                        >
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          <span className="text-[10px] font-medium text-zinc-500">
                            {item.timestamp}
                          </span>
                          <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </span>
                        </div>
                      </div>

                      {/* Expandable Description Text */}
                      <p
                        className={`text-xs text-zinc-400 leading-relaxed mt-1 transition-all ${
                          isExpanded
                            ? 'text-zinc-200 whitespace-normal break-words font-normal'
                            : 'line-clamp-2'
                        }`}
                      >
                        {item.description}
                      </p>

                      <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-400/80 group-hover:text-indigo-400 transition-colors">
                        {isExpanded ? 'Collapse' : 'Click to expand text'}
                      </span>
                    </div>

                    {/* Unread Dot & Dismiss Action */}
                    <div className="flex items-center gap-1.5 shrink-0 self-start mt-0.5">
                      {!item.read && (
                        <span
                          className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"
                          title="Unread notification"
                        />
                      )}
                      <button
                        onClick={(e) => handleDismiss(item.id, e)}
                        className="p-1 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100"
                        title="Dismiss notification"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-zinc-800/60 border border-zinc-700/50 flex items-center justify-center text-zinc-500 mx-auto">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-xs font-semibold text-zinc-300">All caught up!</p>
                <p className="text-[11px] text-zinc-500">
                  {filter === 'unread'
                    ? 'No unread notifications right now.'
                    : 'Your notification center is clear.'}
                </p>
              </div>
            )}
          </div>

          {/* Panel Footer */}
          <div className="p-3 bg-zinc-950/80 border-t border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
              Library Core Live Alerts
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
