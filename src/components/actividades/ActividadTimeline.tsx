'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Actividad } from '@/types';
import { ACTIVIDAD_TIPO_CONFIG } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { Activity } from 'lucide-react';
import { ActividadForm } from './ActividadForm';

interface ActividadTimelineProps {
    actividades: Actividad[];
    oportunidadId: string;
}

export function ActividadTimeline({ actividades, oportunidadId }: ActividadTimelineProps) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Actividades</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{actividades.length} registradas</p>
                </div>
                <button
                    id="btn-registrar-actividad"
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Registrar actividad
                </button>
            </div>

            {showForm && (
                <div className="mb-4">
                    <ActividadForm
                        oportunidadId={oportunidadId}
                        onClose={() => setShowForm(false)}
                    />
                </div>
            )}

            {actividades.length === 0 ? (
                <EmptyState
                    icon={Activity}
                    title="Sin actividades"
                    description="Registra la primera actividad de esta oportunidad"
                />
            ) : (
                <div className="relative">
                    <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100" />
                    <ul className="space-y-4">
                        {actividades.map((act) => {
                            const tipoConfig = ACTIVIDAD_TIPO_CONFIG[act.tipo];
                            return (
                                <li key={act.id} className="flex gap-4 relative">
                                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-xs z-10">
                                        📋
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-lg p-3 min-w-0">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            <span className="text-xs font-semibold text-slate-900">{act.titulo}</span>
                                            <span className="flex-shrink-0 text-[10px] text-slate-400">
                                                {formatRelativeDate(act.fecha)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-[10px] font-medium text-slate-500 bg-slate-200 rounded px-1.5 py-0.5">
                                                {tipoConfig?.label ?? act.tipo}
                                            </span>
                                            {act.duracion_minutos && (
                                                <span className="text-[10px] text-slate-400">{act.duracion_minutos} min</span>
                                            )}
                                        </div>
                                        {act.descripcion && (
                                            <p className="text-xs text-slate-600 mb-2">{act.descripcion}</p>
                                        )}
                                        {act.resultado && (
                                            <div className="text-xs text-slate-600">
                                                <span className="font-medium text-slate-700">Resultado: </span>{act.resultado}
                                            </div>
                                        )}
                                        {act.proximos_pasos && (
                                            <div className="text-xs text-slate-600 mt-1">
                                                <span className="font-medium text-slate-700">Próximos pasos: </span>{act.proximos_pasos}
                                            </div>
                                        )}
                                        {act.responsable && (
                                            <div className="mt-2">
                                                <ResponsableAvatar
                                                    nombre={act.responsable.nombre}
                                                    color={act.responsable.color}
                                                    size="xs"
                                                    showName
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}
