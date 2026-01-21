'use client';

import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Loader2, RefreshCw, X } from 'lucide-react';
import { create } from 'zustand';

// Toast types
export type ToastType = 'success' | 'error' | 'loading' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    description?: string;
    duration?: number;
}

// Toast store
interface ToastState {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => string;
    removeToast: (id: string) => void;
    updateToast: (id: string, toast: Partial<Toast>) => void;
}

export const useToastStore = create<ToastState>((set, get) => ({
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
            toasts: [...state.toasts, { ...toast, id }],
        }));

        // Auto-remove after duration (except loading toasts)
        if (toast.type !== 'loading') {
            const duration = toast.duration ?? (toast.type === 'error' ? 5000 : 3000);
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }

        return id;
    },
    removeToast: (id) => {
        set((state) => ({
            toasts: state.toasts.filter((t) => t.id !== id),
        }));
    },
    updateToast: (id, updates) => {
        set((state) => ({
            toasts: state.toasts.map((t) =>
                t.id === id ? { ...t, ...updates } : t
            ),
        }));

        // If changing from loading to another type, auto-remove
        const toast = get().toasts.find((t) => t.id === id);
        if (toast && updates.type && updates.type !== 'loading') {
            const duration = updates.duration ?? (updates.type === 'error' ? 5000 : 3000);
            setTimeout(() => {
                get().removeToast(id);
            }, duration);
        }
    },
}));

// Hook for using toasts
export function useToast() {
    const { addToast, removeToast, updateToast } = useToastStore();

    return {
        toast: addToast,
        dismiss: removeToast,
        update: updateToast,

        // Convenience methods
        success: (message: string, description?: string) =>
            addToast({ type: 'success', message, description }),
        error: (message: string, description?: string) =>
            addToast({ type: 'error', message, description }),
        loading: (message: string, description?: string) =>
            addToast({ type: 'loading', message, description }),
        info: (message: string, description?: string) =>
            addToast({ type: 'info', message, description }),
    };
}

// Toast icons
const ToastIcon = ({ type }: { type: ToastType }) => {
    switch (type) {
        case 'success':
            return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
        case 'error':
            return <AlertCircle className="h-5 w-5 text-red-500" />;
        case 'loading':
            return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
        case 'info':
            return <RefreshCw className="h-5 w-5 text-blue-500" />;
        default:
            return null;
    }
};

// Individual toast component
function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className={cn(
                'relative flex items-start gap-3 px-4 py-3 rounded-2xl',
                'min-w-[280px] max-w-[400px]',
                // Glassmorphism
                'bg-white/90 dark:bg-slate-800/90',
                'backdrop-blur-xl backdrop-saturate-200',
                'border border-white/50 dark:border-slate-700/50',
                'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.5)]',
                'dark:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.05)]'
            )}
        >
            <div className="shrink-0 pt-0.5">
                <ToastIcon type={toast.type} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-white">
                    {toast.message}
                </p>
                {toast.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {toast.description}
                    </p>
                )}
            </div>

            {toast.type !== 'loading' && (
                <button
                    onClick={onDismiss}
                    className={cn(
                        'shrink-0 p-1 rounded-lg',
                        'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
                        'hover:bg-slate-100 dark:hover:bg-slate-700',
                        'transition-colors'
                    )}
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </motion.div>
    );
}

// Toast container component
export function ToastContainer() {
    const { toasts, removeToast } = useToastStore();

    return (
        <div className="fixed top-4 right-4 z-100 flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <ToastItem
                        key={toast.id}
                        toast={toast}
                        onDismiss={() => removeToast(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Status bar component for inline feedback
interface StatusBarProps {
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    className?: string;
}

export function StatusBar({ status, message, className }: StatusBarProps) {
    if (status === 'idle' || !message) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                    'flex items-center justify-center gap-2 py-2 px-4 text-sm',
                    status === 'loading' && 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
                    status === 'success' && 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300',
                    status === 'error' && 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
                    className
                )}
            >
                {status === 'loading' && <Loader2 className="h-4 w-4 animate-spin" />}
                {status === 'success' && <CheckCircle2 className="h-4 w-4" />}
                {status === 'error' && <AlertCircle className="h-4 w-4" />}
                <span>{message}</span>
            </motion.div>
        </AnimatePresence>
    );
}

