'use client';

import type { FunnelItem } from '@/types';
import { SITUACION_CONFIG, FUNNEL_ORDER } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface FunnelChartProps {
    data: FunnelItem[];
}

export function FunnelChart({ data }: FunnelChartProps) {
    const chartData = FUNNEL_ORDER
        .map(sit => data.find(d => d.situacion === sit))
        .filter(Boolean)
        .map(d => ({
            name: SITUACION_CONFIG[d!.situacion]?.label ?? d!.situacion,
            ops: Number(d!.num_oportunidades),
            importe: Number(d!.importe_total),
            color: SITUACION_CONFIG[d!.situacion]?.color ?? '#94a3b8',
        }));

    const maxOps = Math.max(...chartData.map(d => d.ops), 1);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Embudo de ventas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Oportunidades e importe por etapa</p>
            </div>
            <div className="space-y-2">
                {chartData.map((d, i) => {
                    const pct = maxOps > 0 ? (d.ops / maxOps) * 100 : 0;
                    const prev = i > 0 ? chartData[i - 1].ops : null;
                    const convPct = prev && prev > 0 ? Math.round((d.ops / prev) * 100) : null;

                    return (
                        <div key={d.name}>
                            {convPct !== null && (
                                <div className="flex items-center gap-2 pb-0.5">
                                    <span className="w-[120px] flex-shrink-0" />
                                    <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                                        ↓ {convPct}% pasan
                                    </span>
                                </div>
                            )}
                            <div className="flex items-center gap-3">
                                <span className="text-[11px] text-slate-500 w-[120px] flex-shrink-0 truncate text-right">{d.name}</span>
                                <div className="flex-1 flex items-center gap-2">
                                    <div className="flex-1 bg-slate-100 rounded-full h-[18px] overflow-hidden">
                                        <div
                                            className="h-full rounded-full flex items-center justify-end pr-1.5 transition-all duration-500"
                                            style={{ width: `${Math.max(pct, 3)}%`, backgroundColor: d.color }}
                                        >
                                            {d.ops > 0 && (
                                                <span className="text-[10px] font-bold text-white leading-none">{d.ops}</span>
                                            )}
                                        </div>
                                    </div>
                                    <span className="text-[11px] text-slate-500 flex-shrink-0 w-16 text-right">{formatCurrency(d.importe)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cerradas */}
            {data.filter(d => ['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(d.situacion)).length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-4 flex-wrap">
                    {data.filter(d => ['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(d.situacion)).map(d => (
                        <div key={d.situacion} className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: SITUACION_CONFIG[d.situacion]?.color }} />
                            <span className="text-xs text-slate-500">
                                {SITUACION_CONFIG[d.situacion]?.label}: <strong>{d.num_oportunidades}</strong>
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
