// src/components/dashboard/ActividadReciente.tsx
import { Activity, Phone, Mail, FileText, Users, Car, StickyNote } from 'lucide-react';
import type { Actividad, ActividadTipo } from '@/types';
import { ACTIVIDAD_TIPO_CONFIG } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import Link from 'next/link';

const TIPO_ICONS: Record<ActividadTipo, React.ElementType> = {
    REUNION: Users,
    LLAMADA: Phone,
    EMAIL: Mail,
    PROPUESTA_ENVIADA: FileText,
    SEGUIMIENTO: Activity,
    VISITA: Car,
    NOTA_INTERNA: StickyNote,
};

const TIPO_COLORS: Record<ActividadTipo, string> = {
    REUNION: 'bg-indigo-100 text-indigo-600',
    LLAMADA: 'bg-green-100 text-green-600',
    EMAIL: 'bg-sky-100 text-sky-600',
    PROPUESTA_ENVIADA: 'bg-purple-100 text-purple-600',
    SEGUIMIENTO: 'bg-amber-100 text-amber-600',
    VISITA: 'bg-orange-100 text-orange-600',
    NOTA_INTERNA: 'bg-slate-100 text-slate-500',
};

interface ActividadRecienteProps {
    actividades: Actividad[];
}

export function ActividadReciente({ actividades }: ActividadRecienteProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Actividad reciente</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Últimas acciones registradas</p>
                </div>
                <Link href="/actividades" className="text-xs text-green-600 hover:text-green-700 font-medium">
                    Ver todo →
                </Link>
            </div>
            {actividades.length === 0 ? (
                <EmptyState
                    icon={Activity}
                    title="Sin actividad reciente"
                    description="Registra reuniones, llamadas o emails desde una oportunidad"
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {actividades.map((act) => {
                        const tipoConfig = ACTIVIDAD_TIPO_CONFIG[act.tipo];
                        const Icon = TIPO_ICONS[act.tipo] ?? Activity;
                        const colorClass = TIPO_COLORS[act.tipo] ?? 'bg-slate-100 text-slate-500';
                        return (
                            <div key={act.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                                <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${colorClass}`}>
                                    <Icon className="h-3.5 w-3.5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-medium text-slate-900 truncate">{act.titulo}</span>
                                        <span className="flex-shrink-0 text-[10px] text-slate-400">{formatRelativeDate(act.fecha)}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                        <span className="font-medium">{tipoConfig.label}</span>
                                        {act.oportunidad && ` · ${act.oportunidad.nombre}`}
                                        {act.cliente && ` · ${act.cliente.nombre}`}
                                    </p>
                                </div>
                                {act.responsable && (
                                    <ResponsableAvatar
                                        nombre={act.responsable.nombre}
                                        color={act.responsable.color}
                                        size="xs"
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
