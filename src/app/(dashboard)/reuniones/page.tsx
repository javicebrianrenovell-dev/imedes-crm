// src/app/(dashboard)/reuniones/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { CalendarDays } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import Link from 'next/link';
import type { ProximaReunion } from '@/types';

export const dynamic = 'force-dynamic';

export default async function ReunionesPage() {
    const supabase = await createClient();

    const { data: reuniones } = await supabase
        .from('vista_proximas_reuniones')
        .select('*')
        .order('fecha_proxima_reunion', { ascending: true });

    const items = (reuniones ?? []) as ProximaReunion[];

    return (
        <div>
            <PageHeader
                title="Reuniones"
                subtitle={`${items.length} reuniones planificadas`}
            />

            {items.length === 0 ? (
                <EmptyState
                    icon={CalendarDays}
                    title="Sin reuniones planificadas"
                    description="Define fechas de próxima reunión en tus oportunidades para verlas aquí"
                />
            ) : (
                <div className="space-y-2">
                    {items.map((r) => (
                        <Link
                            key={r.oportunidad_id}
                            href={`/oportunidades/${r.oportunidad_id}`}
                            className="flex items-center gap-4 bg-white rounded-xl border border-slate-200 shadow-sm px-5 py-4 hover:shadow-md transition-all"
                        >
                            {/* Fecha */}
                            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-green-50 flex flex-col items-center justify-center border border-green-100">
                                <span className="text-xl font-bold text-green-700 leading-none">
                                    {new Date(r.fecha_proxima_reunion).getDate()}
                                </span>
                                <span className="text-[10px] text-green-500 uppercase leading-none mt-0.5">
                                    {formatDate(r.fecha_proxima_reunion).split('/').slice(1).join('/')}
                                </span>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900 truncate">{r.oportunidad}</p>
                                <p className="text-xs text-slate-500 truncate">{r.cliente}</p>
                            </div>

                            {/* Responsable */}
                            <ResponsableAvatar
                                nombre={r.responsable}
                                color={r.responsable_color}
                                showName
                                size="sm"
                            />

                            {/* Presupuesto */}
                            {r.presupuesto && (
                                <span className="text-sm font-semibold text-slate-800 flex-shrink-0">
                                    {formatCurrency(r.presupuesto)}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
