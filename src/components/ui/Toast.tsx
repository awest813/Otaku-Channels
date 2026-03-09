'use client';

import { CheckCircle, Info, X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

export type ToastVariant = 'success' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  variant?: ToastVariant;
}

interface ToastContextValue {
  show: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastMessage[]>([]);

  const show = React.useCallback((message: string, variant: ToastVariant = 'success') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div
        aria-live='polite'
        aria-atomic='false'
        className='fixed bottom-6 right-4 z-[100] flex flex-col gap-2 sm:right-6'
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium shadow-xl',
              'animate-in slide-in-from-bottom-2 fade-in duration-200',
              toast.variant === 'info'
                ? 'border-slate-700 bg-slate-800 text-white'
                : 'border-cyan-500/30 bg-slate-900 text-white'
            )}
          >
            {toast.variant === 'info' ? (
              <Info className='h-4 w-4 shrink-0 text-cyan-400' />
            ) : (
              <CheckCircle className='h-4 w-4 shrink-0 text-cyan-400' />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              className='ml-1 rounded p-0.5 text-slate-400 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-400'
              aria-label='Dismiss notification'
            >
              <X className='h-3.5 w-3.5' />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
