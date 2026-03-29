'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const toast = useCallback((message: string, type: ToastType = 'success') => {
        const id = Math.random().toString(36).slice(2);
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 3500);
    }, []);

    const dismiss = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
                {toasts.map(t => (
                    <div
                        key={t.id}
                        className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border pointer-events-auto animate-in-up',
                            t.type === 'success' && 'bg-white border-green-200',
                            t.type === 'error' && 'bg-white border-red-200',
                            t.type === 'info' && 'bg-white border-blue-200',
                        )}
                    >
                        {t.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />}
                        {t.type === 'error' && <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />}
                        {t.type === 'info' && <Info className="h-4 w-4 text-blue-500 flex-shrink-0" />}
                        <p className="text-sm font-medium text-slate-900 flex-1">{t.message}</p>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="text-slate-400 hover:text-slate-600 flex-shrink-0"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}
