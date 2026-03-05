// src/app/(dashboard)/clientes/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Pencil, Plus } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { SituacionBadge } from '@/components/oportunidades/SituacionBadge';
import { formatCurrency, formatDate } from '@/lib/utils';
import { SECTOR_CONFIG } from '@/lib/constants';
import type { Oportunidad } from '@/types';

export const dynamic = 'force-dynamic';

interface ClienteDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ClienteDetailPage({ params }: ClienteDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: cliente } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', id)
        .single();

    if (!cliente) notFound();

    const { data: oportunidades } = await supabase
        .from('oportunidades')
        .select('*, responsable:responsables(nombre, color)')
        .eq('cliente_id', id)
        .eq('archivada', false)
        .order('updated_at', { ascending: false });

    const ops = (oportunidades ?? []) as Oportunidad[];
    const pipelineTotal = ops.reduce((sum, o) => sum + (Number(o.presupuesto) || 0), 0);
    const importeGanado = ops.filter(o => o.situacion === 'PROPUESTA_GANADA').reduce((sum, o) => sum + (Number(o.presupuesto) || 0), 0);
    const sectorConfig = SECTOR_CONFIG[cliente.sector as 'PÚBLICO' | 'PRIVADO'];

    const actions = (
        <div className="flex gap-2">
            <Link
                href={`/clientes/${id}/editar`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <Pencil className="h-4 w-4" /> Editar
            </Link>
            <Link
                href={`/oportunidades/nueva?cliente_id=${id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
            >
                <Plus className="h-4 w-4" /> Nueva oportunidad
            </Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader title={cliente.nombre} actions={actions} />

            {/* Info general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Información</h3>
                    <dl className="space-y-3">
                        <div>
                            <dt className="text-xs text-slate-400">Sector</dt>
                            <dd>
                                <span
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{ backgroundColor: sectorConfig?.bgColor, color: sectorConfig?.color }}
                                >
                                    {sectorConfig?.label ?? cliente.sector}
                                </span>
                            </dd>
                        </div>
                        {cliente.tipo && (
                            <div>
                                <dt className="text-xs text-slate-400">Tipo</dt>
                                <dd className="text-sm text-slate-700">{cliente.tipo}</dd>
                            </div>
                        )}
                        {cliente.provincia && (
                            <div>
                                <dt className="text-xs text-slate-400">Provincia</dt>
                                <dd className="text-sm text-slate-700">{cliente.provincia}</dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Contacto */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">Contacto</h3>
                    {cliente.contacto_nombre || cliente.contacto_email ? (
                        <dl className="space-y-3">
                            {cliente.contacto_nombre && (
                                <div>
                                    <dt className="text-xs text-slate-400">Nombre</dt>
                                    <dd className="text-sm text-slate-700">{cliente.contacto_nombre}</dd>
                                </div>
                            )}
                            {cliente.contacto_cargo && (
                                <div>
                                    <dt className="text-xs text-slate-400">Cargo</dt>
                                    <dd className="text-sm text-slate-700">{cliente.contacto_cargo}</dd>
                                </div>
                            )}
                            {cliente.contacto_email && (
                                <div>
                                    <dt className="text-xs text-slate-400">Email</dt>
                                    <dd>
                                        <a href={`mailto:${cliente.contacto_email}`} className="text-sm text-green-600 hover:underline">
                                            {cliente.contacto_email}
                                        </a>
                                    </dd>
                                </div>
                            )}
                            {cliente.contacto_telefono && (
                                <div>
                                    <dt className="text-xs text-slate-400">Teléfono</dt>
                                    <dd>
                                        <a href={`tel:${cliente.contacto_telefono}`} className="text-sm text-green-600 hover:underline">
                                            {cliente.contacto_telefono}
                                        </a>
                                    </dd>
                                </div>
                            )}
                        </dl>
                    ) : (
                        <p className="text-sm text-slate-400">Sin datos de contacto</p>
                    )}
                </div>
            </div>

            {/* Estadísticas */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: 'Pipeline total', value: formatCurrency(pipelineTotal) },
                    { label: 'Importe ganado', value: formatCurrency(importeGanado) },
                    { label: 'Oportunidades', value: String(ops.length) },
                ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 text-center">
                        <p className="text-xs text-slate-400 mb-1">{label}</p>
                        <p className="text-lg font-bold text-slate-900">{value}</p>
                    </div>
                ))}
            </div>

            {/* Oportunidades */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900">Oportunidades</h3>
                </div>
                {ops.length === 0 ? (
                    <p className="text-sm text-slate-400 text-center py-8">Sin oportunidades registradas</p>
                ) : (
                    <ul className="divide-y divide-slate-50">
                        {ops.map(op => (
                            <li key={op.id}>
                                <Link
                                    href={`/oportunidades/${op.id}`}
                                    className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{op.nombre}</p>
                                        <p className="text-xs text-slate-400">{formatDate(op.fecha_proxima_reunion)}</p>
                                    </div>
                                    <SituacionBadge situacion={op.situacion} size="sm" />
                                    <span className="text-sm font-semibold text-slate-800 flex-shrink-0">{formatCurrency(op.presupuesto)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
