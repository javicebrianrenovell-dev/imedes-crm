'use client';

import { useState } from 'react';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface HeaderProps {
    title: string;
    onMobileMenuToggle?: () => void;
}

export function Header({ title, onMobileMenuToggle }: HeaderProps) {
    const { user, signOut } = useAuth();
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const displayName = user?.email?.split('@')[0] ?? 'Usuario';

    return (
        <header className="h-16 flex-shrink-0 bg-white border-b border-slate-200 flex items-center justify-between px-4 gap-4">
            {/* Left: hamburger + title */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={onMobileMenuToggle}
                    className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    aria-label="Menú"
                >
                    <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-base font-semibold text-slate-900 truncate">{title}</h1>
            </div>

            {/* Right: acciones */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Notificaciones */}
                <button
                    id="btn-notificaciones"
                    className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500"
                    aria-label="Notificaciones"
                >
                    <Bell className="h-5 w-5" />
                </button>

                {/* Menú usuario */}
                <div className="relative">
                    <button
                        id="btn-user-menu"
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                        className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                            {getInitials(displayName)}
                        </div>
                        <span className="text-sm font-medium text-slate-700 capitalize hidden sm:block">{displayName}</span>
                        <ChevronDown className={cn('h-4 w-4 text-slate-400 transition-transform hidden sm:block', userMenuOpen && 'rotate-180')} />
                    </button>

                    {userMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                            <div className="absolute right-0 top-full mt-1 w-48 rounded-lg border border-slate-200 bg-white shadow-lg z-20 py-1 animate-in-up">
                                <div className="px-3 py-2 border-b border-slate-100">
                                    <p className="text-sm font-medium text-slate-900 capitalize">{displayName}</p>
                                    <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                                </div>
                                <button
                                    onClick={signOut}
                                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                    Cerrar sesión
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
