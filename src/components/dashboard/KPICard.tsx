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
    hero?: boolean;
}

const COLOR_MAP = {
    green: { iconBg: 'bg-green-100', icon: 'text-green-600', heroGradient: 'from-green-600 to-green-700', heroBadge: 'bg-green-500/30' },
    blue: { iconBg: 'bg-blue-100', icon: 'text-blue-600', heroGradient: 'from-blue-500 to-blue-600', heroBadge: 'bg-blue-400/30' },
    indigo: { iconBg: 'bg-indigo-100', icon: 'text-indigo-600', heroGradient: 'from-indigo-500 to-indigo-600', heroBadge: 'bg-indigo-400/30' },
    amber: { iconBg: 'bg-amber-100', icon: 'text-amber-600', heroGradient: 'from-amber-500 to-amber-600', heroBadge: 'bg-amber-400/30' },
};

export function KPICard({ title, value, icon: Icon, trend, trendLabel, color = 'green', subtitle, hero = false }: KPICardProps) {
    const colors = COLOR_MAP[color];
    const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
    const trendColor = trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-500' : 'text-slate-400';

    if (hero) {
        return (
            <div className={cn('relative overflow-hidden rounded-xl bg-gradient-to-br p-5 shadow-sm text-white', colors.heroGradient)}>
                <div className={cn('absolute -right-4 -top-4 w-20 h-20 rounded-full', colors.heroBadge)} />
                <div className={cn('absolute -right-2 bottom-[-24px] w-28 h-28 rounded-full opacity-50', colors.heroBadge)} />
                <div className="relative">
                    <div className="flex items-start justify-between">
                        <p className="text-xs font-semibold uppercase tracking-widest text-white/70">{title}</p>
                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Icon className="h-[18px] w-[18px] text-white" />
                        </div>
                    </div>
                    <p className="mt-2 text-3xl font-bold leading-none text-white">{value}</p>
                    {subtitle && <p className="mt-1 text-xs text-white/60">{subtitle}</p>}
                    {trendLabel && (
                        <div className="flex items-center gap-1 mt-3 text-xs font-medium text-white/80">
                            {trend && <TrendIcon className="h-3.5 w-3.5" />}
                            <span>{trendLabel}</span>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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
