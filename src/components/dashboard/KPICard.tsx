// src/components/dashboard/KPICard.tsx
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KPICardProps {
    title: string;
    value: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendLabel?: string;
    color?: 'green' | 'blue' | 'indigo' | 'amber';
    subtitle?: string;
}

const COLOR_MAP = {
    green: { bg: 'bg-green-50', icon: 'text-green-600', iconBg: 'bg-green-100' },
    blue: { bg: 'bg-blue-50', icon: 'text-blue-600', iconBg: 'bg-blue-100' },
    indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600', iconBg: 'bg-indigo-100' },
    amber: { bg: 'bg-amber-50', icon: 'text-amber-600', iconBg: 'bg-amber-100' },
};

export function KPICard({ title, value, icon: Icon, trend, trendLabel, color = 'green', subtitle }: KPICardProps) {
    const colors = COLOR_MAP[color];

    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

    return (
        <div className="kpi-card card-hover">
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{title}</p>
                    <p className="mt-1.5 text-2xl font-bold text-slate-900 leading-none">{value}</p>
                    {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
                </div>
                <div className={cn('flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center', colors.iconBg)}>
                    <Icon className={cn('h-5 w-5', colors.icon)} />
                </div>
            </div>
            {(trend || trendLabel) && (
                <div className={cn('flex items-center gap-1 mt-3 text-xs font-medium', trendColor)}>
                    <TrendIcon className="h-3.5 w-3.5" />
                    <span>{trendLabel}</span>
                </div>
            )}
        </div>
    );
}
