// src/app/(dashboard)/oportunidades/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Pencil, ExternalLink } from 'lucide-react';
import { SituacionBadge } from '@/components/oportunidades/SituacionBadge';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { PageHeader } from '@/components/shared/PageHeader';
import { formatCurrency, formatDate, formatRelativeDate } from '@/lib/utils';
import { AREA_CONFIG, PRIORIDAD_CONFIG } from '@/lib/constants';
import { ActividadTimeline } from '@/components/actividades/ActividadTimeline';
import type { Oportunidad, Actividad } from '@/types';

export const dynamic = 'force-dynamic';

interface OportunidadDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function OportunidadDetailPage({ params }: OportunidadDetailPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const [opRes, actividadesRes] = await Promise.all([
        supabase
            .from('oportunidades')
            .select('*, cliente:clientes(*), responsable:responsables(*)')
            .eq('id', id)
            .single(),
        supabase
            .from('actividades')
            .select('*, responsable:responsables(nombre, color)')
            .eq('oportunidad_id', id)
            .order('fecha', { ascending: false }),
    ]);

    if (!opRes.data) notFound();

    const op = opRes.data as Oportunidad;
    const actividades = (actividadesRes.data ?? []) as Actividad[];
    const areaConfig = AREA_CONFIG[op.area];
    const prioridadConfig = PRIORIDAD_CONFIG[op.prioridad as 1 | 2 | 3];

    const actions = (
        <div className="flex items-center gap-2">
            <Link
                href={`/oportunidades/${id}/editar`}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
                <Pencil className="h-4 w-4" /> Editar
            </Link>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <PageHeader
                title={op.nombre}
                subtitle={op.cliente?.nombre}
                actions={actions}
            />

            {/* Header info */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                    <SituacionBadge situacion={op.situacion} />
                    <span
                        className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                        style={{ backgroundColor: areaConfig?.bgColor, color: areaConfig?.color }}
                    >
                        {areaConfig?.label ?? op.area}
                    </span>
                    <span className="text-xs text-slate-500">{prioridadConfig?.icon} Prioridad {prioridadConfig?.label.toLowerCase()}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Presupuesto</p>
                        <p className="text-lg font-bold text-slate-900">{formatCurrency(op.presupuesto)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Probabilidad</p>
                        <p className="text-lg font-bold text-slate-900">{op.probabilidad_cierre ?? '—'}%</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Última reunión</p>
                        <p className="text-sm font-medium text-slate-700">{formatDate(op.fecha_ultima_reunion)}</p>
                    </div>
                    <div>
                        <p className="text-xs text-slate-400 mb-1">Próxima reunión</p>
                        <p className="text-sm font-medium text-slate-700">
                            {op.fecha_proxima_reunion ? (
                                <span className="text-green-700">{formatRelativeDate(op.fecha_proxima_reunion)}</span>
                            ) : '—'}
                        </p>
                    </div>
                </div>

                {op.responsable && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-2">Responsable</p>
                        <ResponsableAvatar
                            nombre={op.responsable.nombre}
                            color={op.responsable.color}
                            showName
                            size="md"
                        />
                    </div>
                )}

                {op.notas && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                        <p className="text-xs text-slate-400 mb-1">Notas</p>
                        <p className="text-sm text-slate-700 whitespace-pre-wrap">{op.notas}</p>
                    </div>
                )}
            </div>

            {/* Cliente card */}
            {op.cliente && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-slate-900">Cliente</h3>
                        <Link
                            href={`/clientes/${op.cliente.id}`}
                            className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                        >
                            Ver perfil <ExternalLink className="h-3 w-3" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Nombre</p>
                            <p className="text-sm font-medium text-slate-900">{op.cliente.nombre}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-400 mb-0.5">Sector</p>
                            <p className="text-sm font-medium text-slate-900">{op.cliente.sector}</p>
                        </div>
                        {op.cliente.contacto_nombre && (
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Contacto</p>
                                <p className="text-sm text-slate-700">{op.cliente.contacto_nombre}</p>
                            </div>
                        )}
                        {op.cliente.contacto_email && (
                            <div>
                                <p className="text-xs text-slate-400 mb-0.5">Email</p>
                                <a href={`mailto:${op.cliente.contacto_email}`} className="text-sm text-green-600 hover:underline">
                                    {op.cliente.contacto_email}
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Timeline de actividades */}
            <ActividadTimeline actividades={actividades} oportunidadId={id} />
        </div>
    );
}
