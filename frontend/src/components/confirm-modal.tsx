'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  itemName?: string;
  itemDetails?: string;
  message?: string;
  warningText?: string;
  confirmText?: string;
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Record',
  itemName,
  itemDetails,
  message = 'Are you sure you want to delete this book?',
  warningText = 'This action is permanent and cannot be undone. All associated inventory records and hold queues will be removed.',
  confirmText = 'Delete Book',
  isLoading = false,
}: ConfirmModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={() => !isLoading && onClose()}
      />

      {/* Modal Dialog Box */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Decorative Alert Ribbon */}
        <div className="h-1.5 w-full bg-gradient-to-r from-rose-600 via-red-500 to-amber-500" />

        <div className="p-6 space-y-5">
          {/* Top Bar: Icon + Close button */}
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shadow-inner">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-zinc-500 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition-colors disabled:opacity-30"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Heading & Main Question */}
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white tracking-tight">{title}</h3>
            <p className="text-sm font-medium text-zinc-300">{message}</p>
          </div>

          {/* Targeted Item Card Highlight */}
          {itemName && (
            <div className="bg-zinc-950/80 border border-zinc-800/90 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-white truncate">{itemName}</h4>
                {itemDetails && <p className="text-xs text-zinc-400 truncate">{itemDetails}</p>}
              </div>
            </div>
          )}

          {/* Cautionary Warning Callout */}
          <div className="bg-rose-950/30 border border-rose-900/40 rounded-2xl p-3.5 flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
            <p className="text-xs text-rose-300 leading-relaxed font-normal">{warningText}</p>
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-sm font-semibold text-zinc-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-sm transition-all shadow-lg shadow-rose-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isLoading ? 'Deleting...' : confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
