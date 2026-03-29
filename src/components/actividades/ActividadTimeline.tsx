'use client';

import { useState } from 'react';
import { Plus, Users, Phone, Mail, FileText, Car, StickyNote, Activity, Clock } from 'lucide-react';
import type { Actividad } from '@/types';
import { ACTIVIDAD_TIPO_CONFIG } from '@/lib/constants';
import { formatRelativeDate } from '@/lib/utils';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ActividadForm } from './ActividadForm';

const TIPO_ICONS: Record<string, React.ElementType> = {
    REUNION: Users,
    LLAMADA: Phone,
    EMAIL: Mail,
    PROPUESTA: FileText,
    VISITA: Car,
    NOTA: StickyNote,
    OTRO: Activity,
};

const TIPO_COLORS: Record<string, string> = {
    REUNION: 'bg-indigo-100 text-indigo-600 border-indigo-200',
    LLAMADA: 'bg-sky-100 text-sky-600 border-sky-200',
    EMAIL: 'bg-blue-100 text-blue-600 border-blue-200',
    PROPUESTA: 'bg-amber-100 text-amber-600 border-amber-200',
    VISITA: 'bg-green-100 text-green-600 border-green-200',
    NOTA: 'bg-slate-100 text-slate-500 border-slate-200',
    OTRO: 'bg-slate-100 text-slate-500 border-slate-200',
};

interface ActividadTimelineProps {
    actividades: Actividad[];
    oportunidadId: string;
}

export function ActividadTimeline({ actividades, oportunidadId }: ActividadTimelineProps) {
    const [showForm, setShowForm] = useState(false);

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Actividades</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{actividades.length} registradas</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                    <Plus className="h-3.5 w-3.5" /> Registrar
                </button>
            </div>

            {showForm && (
                <div className="mb-5">
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
                    <ul className="space-y-3">
                        {actividades.map((act) => {
                            const tipoConfig = ACTIVIDAD_TIPO_CONFIG[act.tipo];
                            const IconComponent = TIPO_ICONS[act.tipo] ?? Activity;
                            const colorClass = TIPO_COLORS[act.tipo] ?? TIPO_COLORS.OTRO;
                            return (
                                <li key={act.id} className="flex gap-3 relative">
                                    <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center z-10 ${colorClass}`}>
                                        <IconComponent className="h-3 w-3" />
                                    </div>
                                    <div className="flex-1 bg-slate-50 rounded-xl p-3 min-w-0 border border-slate-100">
                                        <div className="flex items-start justify-between gap-2 mb-1.5">
                                            <span className="text-xs font-semibold text-slate-900 leading-snug">{act.titulo}</span>
                                            <span className="flex-shrink-0 text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatRelativeDate(act.fecha)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] font-medium rounded-full px-2 py-0.5 ${colorClass}`}>
                                                {tipoConfig?.label ?? act.tipo}
                                            </span>
                                            {act.duracion_minutos && (
                                                <span className="text-[10px] text-slate-400">{act.duracion_minutos} min</span>
                                            )}
                                        </div>
                                        {act.descripcion && (
                                            <p className="text-xs text-slate-600 mb-2 leading-relaxed">{act.descripcion}</p>
                                        )}
                                        {act.resultado && (
                                            <div className="text-xs text-slate-600 bg-white rounded-lg px-2.5 py-1.5 border border-slate-100 mb-1.5">
                                                <span className="font-medium text-slate-700">Resultado: </span>{act.resultado}
                                            </div>
                                        )}
                                        {act.proximos_pasos && (
                                            <div className="text-xs text-slate-600 bg-green-50 rounded-lg px-2.5 py-1.5 border border-green-100">
                                                <span className="font-medium text-green-700">Próximos pasos: </span>{act.proximos_pasos}
                                            </div>
                                        )}
                                        {act.responsable && (
                                            <div className="mt-2 pt-2 border-t border-slate-100">
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
