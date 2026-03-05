'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Cell,
    ResponsiveContainer,
} from 'recharts';
import type { FunnelItem } from '@/types';
import { SITUACION_CONFIG, FUNNEL_ORDER } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface FunnelChartProps {
    data: FunnelItem[];
}

export function FunnelChart({ data }: FunnelChartProps) {
    // Ordenar por el orden del funnel, excluir perdidas
    const chartData = FUNNEL_ORDER
        .map(sit => data.find(d => d.situacion === sit))
        .filter(Boolean)
        .map(d => ({
            name: SITUACION_CONFIG[d!.situacion]?.label ?? d!.situacion,
            ops: Number(d!.num_oportunidades),
            importe: Number(d!.importe_total),
            color: SITUACION_CONFIG[d!.situacion]?.color ?? '#94a3b8',
            situacion: d!.situacion,
        }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Embudo de ventas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Nº de oportunidades por etapa</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} layout="vertical" barSize={14}>
                    <XAxis type="number" hide />
                    <YAxis
                        type="category"
                        dataKey="name"
                        width={130}
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        formatter={(value, _, props) => [
                            `${value} ops · ${formatCurrency(props.payload.importe)}`,
                            'Oportunidades',
                        ]}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="ops" radius={[0, 4, 4, 0]}>
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
