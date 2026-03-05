'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';

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
    const pathname = usePathname();
    const title = getPageTitle(pathname);

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
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
