'use client';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import type { KPIResponsable } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface PipelineChartProps {
    data: KPIResponsable[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-sm">
                <p className="font-semibold text-slate-900 mb-2">{label}</p>
                {payload.map((p) => (
                    <div key={p.name} className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                        <span className="text-slate-600">{p.name}:</span>
                        <span className="font-medium text-slate-900">{formatCurrency(p.value)}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export function PipelineChart({ data }: PipelineChartProps) {
    const chartData = data.map(d => ({
        name: d.responsable,
        'Pipeline activo': Number(d.pipeline_total) - Number(d.importe_ganado),
        'Importe ganado': Number(d.importe_ganado),
        color: d.color,
    }));

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Pipeline por responsable</h3>
                <p className="text-xs text-slate-400 mt-0.5">Pipeline activo vs importe ganado (€)</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} barSize={20} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, color: '#64748b' }}
                    />
                    <Bar dataKey="Importe ganado" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pipeline activo" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
