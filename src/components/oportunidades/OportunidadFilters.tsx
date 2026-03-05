'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, X } from 'lucide-react';
import type { Responsable } from '@/types';
import { SITUACION_CONFIG, FUNNEL_ORDER } from '@/lib/constants';

interface OportunidadFiltersProps {
    responsables: Responsable[];
}

export function OportunidadFilters({ responsables }: OportunidadFiltersProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [, startTransition] = useTransition();

    const update = useCallback((key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('page');
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    }, [router, pathname, searchParams]);

    const hasFilters = ['search', 'responsable_id', 'area', 'situacion', 'sector'].some(k => searchParams.has(k));

    return (
        <div className="flex flex-wrap items-center gap-2 mb-4">
            {/* Búsqueda */}
            <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                    id="search-oportunidades"
                    type="text"
                    placeholder="Buscar proyecto o cliente..."
                    defaultValue={searchParams.get('search') ?? ''}
                    onChange={e => update('search', e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* Responsable */}
            <select
                id="filter-responsable"
                value={searchParams.get('responsable_id') ?? ''}
                onChange={e => update('responsable_id', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Responsable</option>
                {responsables.map(r => (
                    <option key={r.id} value={r.id}>{r.nombre}</option>
                ))}
            </select>

            {/* Área */}
            <select
                id="filter-area"
                value={searchParams.get('area') ?? ''}
                onChange={e => update('area', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Área</option>
                <option value="CONSULTORÍA">Consultoría</option>
                <option value="COMUNICACIÓN">Comunicación</option>
                <option value="EA">Est. Ambiental</option>
            </select>

            {/* Situación */}
            <select
                id="filter-situacion"
                value={searchParams.get('situacion') ?? ''}
                onChange={e => update('situacion', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Situación</option>
                {FUNNEL_ORDER.concat(['PROPUESTA_PERDIDA', 'DESCARTADA']).map(sit => (
                    <option key={sit} value={sit}>
                        {SITUACION_CONFIG[sit as keyof typeof SITUACION_CONFIG]?.label ?? sit}
                    </option>
                ))}
            </select>

            {/* Sector */}
            <select
                id="filter-sector"
                value={searchParams.get('sector') ?? ''}
                onChange={e => update('sector', e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
                <option value="">Sector</option>
                <option value="PÚBLICO">Público</option>
                <option value="PRIVADO">Privado</option>
            </select>

            {hasFilters && (
                <button
                    id="btn-clear-op-filters"
                    onClick={() => router.push(pathname)}
                    className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
                >
                    <X className="h-3.5 w-3.5" /> Limpiar
                </button>
            )}
        </div>
    );
}
