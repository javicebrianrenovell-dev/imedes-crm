// src/app/(dashboard)/reuniones/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { CalendarDays, Clock } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { SituacionBadge } from '@/components/oportunidades/SituacionBadge';
import Link from 'next/link';
import type { ProximaReunion } from '@/types';

export const dynamic = 'force-dynamic';

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function groupByWeek(items: ProximaReunion[]): { label: string; items: ProximaReunion[] }[] {
    const groups: Record<string, ProximaReunion[]> = {};

    for (const item of items) {
        const d = new Date(item.fecha_proxima_reunion);
        // Start of the week (Monday)
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(d);
        monday.setDate(diff);

        const key = monday.toISOString().split('T')[0];
        if (!groups[key]) groups[key] = [];
        groups[key].push(item);
    }

    return Object.entries(groups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, items]) => {
            const monday = new Date(key);
            const sunday = new Date(key);
            sunday.setDate(sunday.getDate() + 6);
            const label = `${monday.getDate()} ${MESES[monday.getMonth()]} – ${sunday.getDate()} ${MESES[sunday.getMonth()]}`;
            return { label, items };
        });
}

export default async function ReunionesPage() {
    const supabase = await createClient();

    const { data: reuniones } = await supabase
        .from('vista_proximas_reuniones')
        .select('*')
        .order('fecha_proxima_reunion', { ascending: true });

    const items = (reuniones ?? []) as ProximaReunion[];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = items.filter(r => new Date(r.fecha_proxima_reunion) >= today);
    const past = items.filter(r => new Date(r.fecha_proxima_reunion) < today);

    const upcomingGroups = groupByWeek(upcoming);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Reuniones"
                subtitle={`${upcoming.length} próximas · ${past.length} pasadas`}
            />

            {items.length === 0 ? (
                <EmptyState
                    icon={CalendarDays}
                    title="Sin reuniones planificadas"
                    description="Define fechas de próxima reunión en tus oportunidades para verlas aquí"
                />
            ) : (
                <div className="space-y-8">
                    {/* ── Upcoming grouped by week ── */}
                    {upcomingGroups.length === 0 ? (
                        <p className="text-sm text-slate-400 text-center py-6">No hay reuniones próximas planificadas</p>
                    ) : (
                        upcomingGroups.map(group => (
                            <div key={group.label}>
                                {/* Week header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{group.label}</span>
                                    <div className="flex-1 h-px bg-slate-100" />
                                    <span className="text-xs text-slate-400">{group.items.length} {group.items.length === 1 ? 'reunión' : 'reuniones'}</span>
                                </div>

                                <div className="space-y-2">
                                    {group.items.map(r => {
                                        const d = new Date(r.fecha_proxima_reunion);
                                        const isToday = d.toDateString() === new Date().toDateString();
                                        const isTomorrow = d.toDateString() === new Date(Date.now() + 86400000).toDateString();
                                        const dayLabel = isToday ? 'HOY' : isTomorrow ? 'MÑN' : DIAS[d.getDay()];

                                        return (
                                            <Link
                                                key={r.oportunidad_id}
                                                href={`/oportunidades/${r.oportunidad_id}`}
                                                className={`flex items-center gap-4 rounded-xl border px-5 py-3.5 hover:shadow-md transition-all group ${isToday ? 'bg-green-50 border-green-200 shadow-sm' : 'bg-white border-slate-200 shadow-sm'}`}
                                            >
                                                {/* Day badge */}
                                                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex flex-col items-center justify-center border ${isToday ? 'bg-green-600 border-green-600 text-white' : 'bg-slate-50 border-slate-200'}`}>
                                                    <span className={`text-[10px] font-bold uppercase leading-none ${isToday ? 'text-green-200' : 'text-slate-400'}`}>
                                                        {dayLabel}
                                                    </span>
                                                    <span className={`text-xl font-bold leading-tight ${isToday ? 'text-white' : 'text-slate-900'}`}>
                                                        {d.getDate()}
                                                    </span>
                                                    <span className={`text-[9px] uppercase leading-none ${isToday ? 'text-green-200' : 'text-slate-400'}`}>
                                                        {MESES[d.getMonth()]}
                                                    </span>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-slate-900 truncate group-hover:text-green-700 transition-colors">
                                                        {r.oportunidad}
                                                    </p>
                                                    <p className="text-xs text-slate-500 truncate mt-0.5">{r.cliente}</p>
                                                    {isToday && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-700 mt-1">
                                                            <Clock className="h-2.5 w-2.5" /> Hoy
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Situación */}
                                                <SituacionBadge situacion={r.situacion} size="sm" />

                                                {/* Responsable */}
                                                <ResponsableAvatar
                                                    nombre={r.responsable}
                                                    color={r.responsable_color}
                                                    showName
                                                    size="sm"
                                                />

                                                {/* Presupuesto */}
                                                {r.presupuesto && (
                                                    <span className="text-sm font-semibold text-slate-700 flex-shrink-0 min-w-[80px] text-right">
                                                        {formatCurrency(r.presupuesto)}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}

                    {/* ── Past reuniones ── */}
                    {past.length > 0 && (
                        <details className="group">
                            <summary className="flex items-center gap-3 cursor-pointer select-none list-none mb-3">
                                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pasadas ({past.length})</span>
                                <div className="flex-1 h-px bg-slate-100" />
                                <span className="text-xs text-slate-400 group-open:hidden">Mostrar</span>
                                <span className="text-xs text-slate-400 hidden group-open:inline">Ocultar</span>
                            </summary>
                            <div className="space-y-2 opacity-60">
                                {past.slice().reverse().map(r => {
                                    const d = new Date(r.fecha_proxima_reunion);
                                    return (
                                        <Link
                                            key={r.oportunidad_id}
                                            href={`/oportunidades/${r.oportunidad_id}`}
                                            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 px-5 py-3 hover:opacity-100 transition-all"
                                        >
                                            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex flex-col items-center justify-center">
                                                <span className="text-base font-bold text-slate-500 leading-none">{d.getDate()}</span>
                                                <span className="text-[9px] text-slate-400 uppercase">{MESES[d.getMonth()]}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-slate-600 truncate">{r.oportunidad}</p>
                                                <p className="text-xs text-slate-400 truncate">{r.cliente}</p>
                                            </div>
                                            <ResponsableAvatar nombre={r.responsable} color={r.responsable_color} size="sm" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </details>
                    )}
                </div>
            )}
        </div>
    );
}
