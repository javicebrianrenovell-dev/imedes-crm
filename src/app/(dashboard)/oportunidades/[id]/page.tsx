// src/app/(dashboard)/oportunidades/[id]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Pencil, ExternalLink, CalendarDays, Euro, TrendingUp, CalendarCheck } from 'lucide-react';
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
        <Link
            href={`/oportunidades/${id}/editar`}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
            <Pencil className="h-4 w-4" /> Editar
        </Link>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <PageHeader
                title={op.nombre}
                subtitle={op.cliente?.nombre}
                actions={actions}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* ── Main column: Timeline ── */}
                <div className="lg:col-span-2">
                    <ActividadTimeline actividades={actividades} oportunidadId={id} />
                </div>

                {/* ── Sidebar ── */}
                <div className="space-y-4">
                    {/* Estado & Clasificación */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Estado</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Situación</span>
                                <SituacionBadge situacion={op.situacion} size="sm" />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Área</span>
                                <span
                                    className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                    style={{ backgroundColor: areaConfig?.bgColor, color: areaConfig?.color }}
                                >
                                    {areaConfig?.label ?? op.area}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-slate-500">Prioridad</span>
                                <span className="text-xs font-medium text-slate-700">
                                    {prioridadConfig?.icon} {prioridadConfig?.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Métricas financieras */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Financiero</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <Euro className="h-3.5 w-3.5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Presupuesto</p>
                                    <p className="text-sm font-bold text-slate-900">{formatCurrency(op.presupuesto)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                                    <TrendingUp className="h-3.5 w-3.5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Probabilidad cierre</p>
                                    <p className="text-sm font-bold text-slate-900">{op.probabilidad_cierre ?? '—'}%</p>
                                </div>
                            </div>
                            {op.probabilidad_cierre && op.presupuesto && (
                                <div className="mt-1 bg-slate-50 rounded-lg p-2.5 text-center">
                                    <p className="text-[10px] text-slate-400 mb-0.5">Valor esperado</p>
                                    <p className="text-sm font-semibold text-slate-700">
                                        {formatCurrency(Number(op.presupuesto) * Number(op.probabilidad_cierre) / 100)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fechas */}
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Fechas</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                    <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Última reunión</p>
                                    <p className="text-xs font-medium text-slate-700">{formatDate(op.fecha_ultima_reunion)}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0">
                                    <CalendarCheck className="h-3.5 w-3.5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase">Próxima reunión</p>
                                    {op.fecha_proxima_reunion ? (
                                        <p className="text-xs font-medium text-green-700">{formatRelativeDate(op.fecha_proxima_reunion)}</p>
                                    ) : (
                                        <p className="text-xs text-slate-400">Sin planificar</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Responsable */}
                    {op.responsable && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Responsable</h3>
                            <ResponsableAvatar
                                nombre={op.responsable.nombre}
                                color={op.responsable.color}
                                showName
                                size="md"
                            />
                        </div>
                    )}

                    {/* Cliente */}
                    {op.cliente && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Cliente</h3>
                                <Link
                                    href={`/clientes/${op.cliente.id}`}
                                    className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                                >
                                    Ver perfil <ExternalLink className="h-3 w-3" />
                                </Link>
                            </div>
                            <div className="space-y-2">
                                <div>
                                    <p className="text-[10px] text-slate-400 uppercase mb-0.5">Nombre</p>
                                    <p className="text-xs font-semibold text-slate-900">{op.cliente.nombre}</p>
                                </div>
                                {op.cliente.sector && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase mb-0.5">Sector</p>
                                        <p className="text-xs text-slate-700">{op.cliente.sector}</p>
                                    </div>
                                )}
                                {op.cliente.contacto_nombre && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase mb-0.5">Contacto</p>
                                        <p className="text-xs text-slate-700">{op.cliente.contacto_nombre}</p>
                                    </div>
                                )}
                                {op.cliente.contacto_email && (
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase mb-0.5">Email</p>
                                        <a
                                            href={`mailto:${op.cliente.contacto_email}`}
                                            className="text-xs text-green-600 hover:underline"
                                        >
                                            {op.cliente.contacto_email}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notas */}
                    {op.notas && (
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Notas</h3>
                            <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed">{op.notas}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
