'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { KPIArea } from '@/types';
import { AREA_CONFIG } from '@/lib/constants';
import { formatCurrency } from '@/lib/utils';

interface AreaPieChartProps {
    data: KPIArea[];
}

export function AreaPieChart({ data }: AreaPieChartProps) {
    const chartData = data.map(d => ({
        name: AREA_CONFIG[d.area]?.label ?? d.area,
        value: Number(d.pipeline_total),
        color: AREA_CONFIG[d.area]?.color ?? '#6366f1',
    }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm h-full">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Distribución por área</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline total (€)</p>
            </div>
            <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={72}
                        paddingAngle={3}
                        dataKey="value"
                    >
                        {chartData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(v) => [formatCurrency(Number(v)), 'Pipeline']}
                        contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 11, color: '#64748b' }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
