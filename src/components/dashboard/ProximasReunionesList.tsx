// src/components/dashboard/ProximasReunionesList.tsx
import { CalendarDays } from 'lucide-react';
import type { ProximaReunion } from '@/types';
import { formatDateShort, formatCurrency } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import Link from 'next/link';

interface ProximasReunionesList {
    reuniones: ProximaReunion[];
}

export function ProximasReunionesList({ reuniones }: ProximasReunionesList) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Próximas reuniones</h3>
                <p className="text-xs text-slate-400 mt-0.5">Próximos 30 días</p>
            </div>
            {reuniones.length === 0 ? (
                <EmptyState
                    icon={CalendarDays}
                    title="Sin reuniones próximas"
                    description="No hay reuniones planificadas en los próximos días"
                />
            ) : (
                <ul className="space-y-2">
                    {reuniones.slice(0, 6).map((r) => (
                        <li key={r.oportunidad_id}>
                            <Link
                                href={`/oportunidades/${r.oportunidad_id}`}
                                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
                            >
                                {/* Fecha destacada */}
                                <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex flex-col items-center justify-center">
                                    <span className="text-lg font-bold text-slate-900 leading-none">
                                        {new Date(r.fecha_proxima_reunion).getDate()}
                                    </span>
                                    <span className="text-[10px] text-slate-400 uppercase leading-none">
                                        {formatDateShort(r.fecha_proxima_reunion).split(' ')[1]}
                                    </span>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-slate-900 truncate leading-snug group-hover:text-green-700">
                                        {r.oportunidad}
                                    </p>
                                    <p className="text-xs text-slate-500 truncate">{r.cliente}</p>
                                    {r.presupuesto && (
                                        <p className="text-xs text-slate-400">{formatCurrency(r.presupuesto)}</p>
                                    )}
                                </div>

                                <ResponsableAvatar
                                    nombre={r.responsable}
                                    color={r.responsable_color}
                                    size="xs"
                                />
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
