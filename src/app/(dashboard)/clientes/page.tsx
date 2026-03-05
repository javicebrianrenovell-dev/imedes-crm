// src/app/(dashboard)/clientes/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import { EmptyState } from '@/components/shared/EmptyState';
import { Users } from 'lucide-react';
import { SECTOR_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

export const dynamic = 'force-dynamic';

interface ClientesPageProps {
    searchParams: Promise<{ search?: string; sector?: string }>;
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
    const params = await searchParams;
    const supabase = await createClient();

    let query = supabase
        .from('clientes')
        .select(`
      *,
      oportunidades:oportunidades(id, presupuesto, situacion)
    `)
        .eq('activo', true)
        .order('nombre');

    if (params.search) {
        query = query.ilike('nombre', `%${params.search}%`);
    }
    if (params.sector) {
        query = query.eq('sector', params.sector);
    }

    const { data: clientes, count } = await query;

    const addButton = (
        <Link
            href="/clientes/nuevo"
            id="btn-nuevo-cliente"
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
            <Plus className="h-4 w-4" /> Nuevo cliente
        </Link>
    );

    return (
        <div>
            <PageHeader
                title="Clientes"
                subtitle={`${count ?? clientes?.length ?? 0} clientes registrados`}
                actions={addButton}
            />

            {/* Filtros */}
            <Suspense>
                <div className="flex flex-wrap gap-2 mb-4">
                    <form method="get" className="flex gap-2 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                name="search"
                                type="text"
                                placeholder="Buscar cliente..."
                                defaultValue={params.search ?? ''}
                                className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 w-60"
                            />
                        </div>
                        <select
                            name="sector"
                            defaultValue={params.sector ?? ''}
                            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Todos los sectores</option>
                            <option value="PÚBLICO">Público</option>
                            <option value="PRIVADO">Privado</option>
                        </select>
                        <button type="submit" className="px-3 py-2 text-sm text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                            Buscar
                        </button>
                    </form>
                </div>
            </Suspense>

            {/* Tabla */}
            <Suspense fallback={<LoadingPage />}>
                {!clientes || clientes.length === 0 ? (
                    <EmptyState
                        icon={Users}
                        title="Sin clientes"
                        description="Añade clientes para empezar a registrar oportunidades"
                    />
                ) : (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nombre</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Sector</th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                                    <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Oportunidades</th>
                                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Pipeline</th>
                                    <th className="px-4 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {clientes.map((c) => {
                                    const ops = (c.oportunidades as Array<{ id: string; presupuesto: number; situacion: string }>) ?? [];
                                    const pipeline = ops
                                        .filter(o => !['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion))
                                        .reduce((sum, o) => sum + (Number(o.presupuesto) || 0), 0);
                                    const sectorConfig = SECTOR_CONFIG[c.sector as 'PÚBLICO' | 'PRIVADO'];

                                    return (
                                        <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <Link href={`/clientes/${c.id}`} className="font-medium text-slate-900 hover:text-green-700 transition-colors">
                                                    {c.nombre}
                                                </Link>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span
                                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                    style={{ backgroundColor: sectorConfig?.bgColor, color: sectorConfig?.color }}
                                                >
                                                    {sectorConfig?.label ?? c.sector}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-500">{c.tipo ?? '—'}</td>
                                            <td className="px-4 py-3 text-center text-sm font-medium text-slate-700">{ops.length}</td>
                                            <td className="px-4 py-3 text-right font-medium text-slate-900">{formatCurrency(pipeline)}</td>
                                            <td className="px-4 py-3">
                                                <Link
                                                    href={`/clientes/${c.id}`}
                                                    className="text-xs text-slate-400 hover:text-green-600 transition-colors"
                                                >
                                                    Ver →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Suspense>
        </div>
    );
}
