'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Briefcase,
    Users,
    Activity,
    CalendarDays,
    Settings,
    LogOut,
    ChevronLeft,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn, getInitials } from '@/lib/utils';

const NAV_ITEMS = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/oportunidades', label: 'Oportunidades', icon: Briefcase },
    { href: '/clientes', label: 'Clientes', icon: Users },
    { href: '/actividades', label: 'Actividades', icon: Activity },
    { href: '/reuniones', label: 'Reuniones', icon: CalendarDays },
] as const;

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isActive = (href: string) => {
        if (href === '/dashboard') return pathname === '/dashboard';
        return pathname.startsWith(href);
    };

    const displayName = user?.email?.split('@')[0] ?? 'Usuario';
    const displayEmail = user?.email ?? '';

    return (
        <aside
            className={cn(
                'flex flex-col h-full bg-white border-r border-slate-200 transition-all duration-300',
                collapsed ? 'w-16' : 'w-[240px]'
            )}
        >
            {/* Logo */}
            <div className={cn('flex items-center border-b border-slate-100 px-4', collapsed ? 'h-16 justify-center' : 'h-16 gap-3')}>
                <div className="flex-shrink-0 w-8 h-8 relative">
                    <Image
                        src="/logo-imedes.png"
                        alt="Logo"
                        fill
                        className="object-contain"
                    />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight">IMEDES</p>
                        <p className="text-xs text-slate-400 leading-tight">CRM</p>
                    </div>
                )}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className={cn('ml-auto p-1 rounded-md hover:bg-slate-100 text-slate-400', collapsed && 'ml-0 mt-1')}
                        aria-label="Colapsar sidebar"
                    >
                        <ChevronLeft className={cn('h-4 w-4 transition-transform duration-300', collapsed && 'rotate-180')} />
                    </button>
                )}
            </div>

            {/* Navegación principal */}
            <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        id={`nav-${label.toLowerCase()}`}
                        title={collapsed ? label : undefined}
                        className={cn(
                            'sidebar-item',
                            isActive(href) ? 'sidebar-item-active' : 'sidebar-item-inactive',
                            collapsed && 'justify-center px-0'
                        )}
                    >
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span className="truncate">{label}</span>}
                    </Link>
                ))}

                {/* Separador */}
                <div className="pt-2 mt-2 border-t border-slate-100">
                    <Link
                        href="/ajustes"
                        id="nav-ajustes"
                        title={collapsed ? 'Ajustes' : undefined}
                        className={cn(
                            'sidebar-item',
                            pathname.startsWith('/ajustes') ? 'sidebar-item-active' : 'sidebar-item-inactive',
                            collapsed && 'justify-center px-0'
                        )}
                    >
                        <Settings className="h-4 w-4 flex-shrink-0" />
                        {!collapsed && <span>Ajustes</span>}
                    </Link>
                </div>
            </nav>

            {/* Usuario */}
            <div className={cn('border-t border-slate-100 p-3', collapsed ? 'flex flex-col items-center gap-2' : '')}>
                <div className={cn('flex items-center gap-3', collapsed && 'flex-col gap-1')}>
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-xs font-semibold text-green-700">
                        {getInitials(displayName)}
                    </div>
                    {!collapsed && (
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-900 truncate capitalize">{displayName}</p>
                            <p className="text-xs text-slate-400 truncate">{displayEmail}</p>
                        </div>
                    )}
                    <button
                        onClick={signOut}
                        title="Cerrar sesión"
                        className="flex-shrink-0 p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                        aria-label="Cerrar sesión"
                    >
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
