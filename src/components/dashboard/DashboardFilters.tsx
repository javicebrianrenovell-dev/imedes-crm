'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import type { Responsable } from '@/types';

interface DashboardFiltersProps {
    responsables: Responsable[];
}

export function DashboardFilters({ responsables }: DashboardFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const updateParam = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        router.push(`${pathname}?${params.toString()}`);
    }, [router, pathname, searchParams]);

    const clearFilters = () => {
        router.push(pathname);
    };

    const hasFilters = searchParams.size > 0;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {/* Responsable */}
            <select
                id="filter-responsable"
                value={searchParams.get('responsable') ?? ''}
                onChange={e => updateParam('responsable', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 min-w-[140px]"
            >
                <option value="">Todos los responsables</option>
                {responsables.map(r => (
                    <option key={r.id} value={r.nombre}>{r.nombre}</option>
                ))}
            </select>

            {/* Área */}
            <select
                id="filter-area"
                value={searchParams.get('area') ?? ''}
                onChange={e => updateParam('area', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Todas las áreas</option>
                <option value="CONSULTORÍA">Consultoría</option>
                <option value="COMUNICACIÓN">Comunicación</option>
                <option value="EA">Edu. Ambiental</option>
            </select>

            {/* Sector */}
            <select
                id="filter-sector"
                value={searchParams.get('sector') ?? ''}
                onChange={e => updateParam('sector', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Todos los sectores</option>
                <option value="PÚBLICO">Público</option>
                <option value="PRIVADO">Privado</option>
            </select>

            {/* Período */}
            <select
                id="filter-periodo"
                value={searchParams.get('periodo') ?? '2026'}
                onChange={e => updateParam('periodo', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="2026">2026</option>
                <option value="2025">2025</option>
            </select>

            {/* Limpiar */}
            {hasFilters && (
                <button
                    id="btn-clear-filters"
                    onClick={clearFilters}
                    className="text-sm text-slate-500 hover:text-slate-900 underline transition-colors"
                >
                    Limpiar filtros
                </button>
            )}
        </div>
    );
}
