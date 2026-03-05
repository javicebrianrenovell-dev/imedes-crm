// src/components/oportunidades/OportunidadCard.tsx
import Link from 'next/link';
import type { Oportunidad } from '@/types';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AREA_CONFIG } from '@/lib/constants';
import { CalendarDays } from 'lucide-react';

interface OportunidadCardProps {
    oportunidad: Oportunidad;
    isDragging?: boolean;
}

export function OportunidadCard({ oportunidad: op, isDragging = false }: OportunidadCardProps) {
    const areaConfig = AREA_CONFIG[op.area];

    return (
        <Link
            href={`/oportunidades/${op.id}`}
            className={`block bg-white rounded-lg border p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ${isDragging ? 'shadow-xl rotate-1 opacity-90 border-green-300' : 'border-slate-200'
                }`}
            onClick={e => isDragging && e.preventDefault()}
        >
            {/* Área badge */}
            <div className="flex items-center justify-between mb-2">
                <span
                    className="text-[10px] font-medium rounded px-1.5 py-0.5"
                    style={{ backgroundColor: areaConfig?.bgColor, color: areaConfig?.color }}
                >
                    {areaConfig?.label ?? op.area}
                </span>
                {op.prioridad === 1 && <span title="Alta prioridad" className="text-red-500 text-xs">●</span>}
            </div>

            {/* Nombre */}
            <p className="text-xs font-semibold text-slate-900 leading-snug mb-1 line-clamp-2">
                {op.nombre}
            </p>

            {/* Cliente */}
            <p className="text-[11px] text-slate-500 truncate mb-2">
                {op.cliente?.nombre ?? '—'}
            </p>

            {/* Presupuesto y fecha */}
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">
                    {formatCurrency(op.presupuesto)}
                </span>
                {op.fecha_proxima_reunion && (
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                        <CalendarDays className="h-3 w-3" />
                        {formatDate(op.fecha_proxima_reunion)}
                    </span>
                )}
            </div>

            {/* Responsable */}
            {op.responsable && (
                <div className="mt-2 pt-2 border-t border-slate-50">
                    <ResponsableAvatar
                        nombre={op.responsable.nombre}
                        color={op.responsable.color}
                        size="xs"
                        showName
                    />
                </div>
            )}
        </Link>
    );
}
