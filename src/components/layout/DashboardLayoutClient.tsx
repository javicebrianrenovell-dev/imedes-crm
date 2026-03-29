'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/shared/CommandPalette';

const PAGE_TITLES: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/oportunidades': 'Oportunidades',
    '/clientes': 'Clientes',
    '/actividades': 'Actividades',
    '/reuniones': 'Reuniones',
    '/ajustes': 'Ajustes',
};

function getPageTitle(pathname: string): string {
    // Exacto
    if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
    // Prefijo
    const match = Object.entries(PAGE_TITLES).find(([key]) => pathname.startsWith(key) && key !== '/dashboard');
    return match ? match[1] : 'IMEDES CRM';
}

export default function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [cmdOpen, setCmdOpen] = useState(false);
    const pathname = usePathname();
    const title = getPageTitle(pathname);

    // Cmd+K / Ctrl+K global shortcut
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setCmdOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Sidebar desktop */}
            <div className="hidden lg:flex">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            {/* Sidebar móvil overlay */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-30 bg-black/40 lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
                        <Sidebar onToggle={() => setMobileOpen(false)} />
                    </div>
                </>
            )}

            {/* Contenido principal */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                <Header
                    title={title}
                    onMobileMenuToggle={() => setMobileOpen(!mobileOpen)}
                    onSearchOpen={() => setCmdOpen(true)}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>

            {/* Command Palette global */}
            <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
        </div>
    );
}
