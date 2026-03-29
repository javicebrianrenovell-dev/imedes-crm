'use client';

import { cn } from '@/lib/utils';

interface HealthMetric {
    label: string;
    value: number;
    description: string;
}

interface PipelineHealthScoreProps {
    metrics: HealthMetric[];
}

function DonutScore({ score }: { score: number }) {
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score >= 70 ? '#10b981' : score >= 40 ? '#f59e0b' : '#ef4444';
    const label = score >= 70 ? 'Bueno' : score >= 40 ? 'Regular' : 'Bajo';

    return (
        <div className="relative flex items-center justify-center">
            <svg width={100} height={100} className="-rotate-90">
                <circle cx={50} cy={50} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={10} />
                <circle
                    cx={50} cy={50} r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth={10}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-700"
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <span className="text-xl font-bold text-slate-900">{score}%</span>
                <span className="text-[10px] font-medium" style={{ color }}>{label}</span>
            </div>
        </div>
    );
}

export function PipelineHealthScore({ metrics }: PipelineHealthScoreProps) {
    const score = metrics.length > 0
        ? Math.round(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length)
        : 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">Salud del pipeline</h3>
                <p className="text-xs text-slate-400 mt-0.5">Calidad de los datos activos</p>
            </div>
            <div className="flex items-center gap-5">
                <DonutScore score={score} />
                <div className="flex-1 space-y-2.5">
                    {metrics.map(m => (
                        <div key={m.label}>
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs text-slate-600">{m.label}</span>
                                <span className={cn(
                                    'text-xs font-semibold',
                                    m.value >= 70 ? 'text-green-600' : m.value >= 40 ? 'text-amber-600' : 'text-red-500'
                                )}>{m.value}%</span>
                            </div>
                            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-500',
                                        m.value >= 70 ? 'bg-green-500' : m.value >= 40 ? 'bg-amber-400' : 'bg-red-400'
                                    )}
                                    style={{ width: `${m.value}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
