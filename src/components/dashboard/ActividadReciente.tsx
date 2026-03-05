// src/components/dashboard/ActividadReciente.tsx
import { Activity } from 'lucide-react';
import type { Actividad } from '@/types';
import { ACTIVIDAD_TIPO_CONFIG } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { EmptyState } from '@/components/shared/EmptyState';

interface ActividadRecienteProps {
    actividades: Actividad[];
}

export function ActividadReciente({ actividades }: ActividadRecienteProps) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Actividad reciente</h3>
                <p className="text-xs text-slate-400 mt-0.5">Últimas acciones registradas</p>
            </div>
            {actividades.length === 0 ? (
                <EmptyState
                    icon={Activity}
                    title="Sin actividad reciente"
                    description="Registra reuniones, llamadas o emails desde una oportunidad"
                />
            ) : (
                <div className="space-y-3">
                    {actividades.map((act) => {
                        const tipoConfig = ACTIVIDAD_TIPO_CONFIG[act.tipo];
                        return (
                            <div key={act.id} className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs">
                                    📋
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-medium text-slate-900 truncate">{act.titulo}</span>
                                        <span className="flex-shrink-0 text-xs text-slate-400">{formatRelativeDate(act.fecha)}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">
                                        {tipoConfig.label}
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
