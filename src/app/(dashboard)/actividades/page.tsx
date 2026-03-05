// src/app/(dashboard)/actividades/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { Activity } from 'lucide-react';
import { ACTIVIDAD_TIPO_CONFIG } from '@/lib/constants';
import { formatDateTime } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import Link from 'next/link';
import type { Actividad } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ActividadesPage() {
    const supabase = await createClient();

    const { data: actividades } = await supabase
        .from('actividades')
        .select('*, responsable:responsables(nombre, color), oportunidad:oportunidades(id, nombre), cliente:clientes(id, nombre)')
        .order('fecha', { ascending: false })
        .limit(100);

    const acts = (actividades ?? []) as Actividad[];

    return (
        <div>
            <PageHeader title="Actividades" subtitle={`${acts.length} actividades registradas`} />

            {acts.length === 0 ? (
                <EmptyState
                    icon={Activity}
                    title="Sin actividades"
                    description="Las actividades se registran desde el detalle de una oportunidad"
                />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Fecha</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tipo</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Título</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Oportunidad</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsable</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {acts.map((act) => {
                                const tipoConfig = ACTIVIDAD_TIPO_CONFIG[act.tipo];
                                return (
                                    <tr key={act.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                                            {formatDateTime(act.fecha)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs font-medium text-slate-600 bg-slate-100 rounded px-2 py-0.5">
                                                {tipoConfig?.label ?? act.tipo}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="font-medium text-slate-900">{act.titulo}</p>
                                            {act.resultado && (
                                                <p className="text-xs text-slate-400 truncate max-w-xs">{act.resultado}</p>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {act.oportunidad ? (
                                                <Link href={`/oportunidades/${act.oportunidad.id}`} className="text-xs text-green-600 hover:underline truncate max-w-[160px] block">
                                                    {act.oportunidad.nombre}
                                                </Link>
                                            ) : act.cliente ? (
                                                <Link href={`/clientes/${act.cliente.id}`} className="text-xs text-slate-500 hover:underline">
                                                    {act.cliente.nombre}
                                                </Link>
                                            ) : '—'}
                                        </td>
                                        <td className="px-4 py-3">
                                            {act.responsable ? (
                                                <ResponsableAvatar nombre={act.responsable.nombre} color={act.responsable.color} size="xs" showName />
                                            ) : <span className="text-slate-400">—</span>}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
