'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from 'recharts';
import type { KPISector } from '@/types';
import { SECTOR_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface SectorBarChartProps {
    data: KPISector[];
}

export function SectorBarChart({ data }: SectorBarChartProps) {
    const chartData = data.map(d => ({
        name: SECTOR_CONFIG[d.sector]?.label ?? d.sector,
        pipeline: Number(d.pipeline_total),
        ganado: Number(d.importe_ganado),
        color: SECTOR_CONFIG[d.sector]?.color ?? '#6366f1',
    }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Público vs Privado</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline por sector (€)</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} barSize={36}>
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip
                        formatter={(v) => [formatCurrency(Number(v)), 'Pipeline']}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Bar dataKey="pipeline" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
