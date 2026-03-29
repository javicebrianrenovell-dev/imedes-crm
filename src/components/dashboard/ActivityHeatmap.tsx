'use client';

import { useMemo } from 'react';
import { format, eachDayOfInterval, subDays, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface ActivityDay {
    date: string;
    count: number;
}

interface ActivityHeatmapProps {
    data: ActivityDay[];
}

function getColor(count: number): string {
    if (count === 0) return '#f1f5f9';
    if (count === 1) return '#bbf7d0';
    if (count <= 3) return '#4ade80';
    if (count <= 5) return '#16a34a';
    return '#14532d';
}

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
    const today = new Date();
    const startDate = subDays(today, 364);

    const countMap = useMemo(() => {
        const map = new Map<string, number>();
        data.forEach(d => map.set(d.date, d.count));
        return map;
    }, [data]);

    const days = useMemo(() => {
        return eachDayOfInterval({ start: startDate, end: today });
    }, [startDate, today]);

    // Group by week columns
    const firstDayOfWeek = startOfWeek(startDate, { weekStartsOn: 1 });
    const paddingDays = getDay(startDate) === 0 ? 6 : getDay(startDate) - 1;

    const weeks: (Date | null)[][] = [];
    let currentWeek: (Date | null)[] = Array(paddingDays).fill(null);

    for (const day of days) {
        currentWeek.push(day);
        if (currentWeek.length === 7) {
            weeks.push(currentWeek);
            currentWeek = [];
        }
    }
    if (currentWeek.length > 0) {
        while (currentWeek.length < 7) currentWeek.push(null);
        weeks.push(currentWeek);
    }

    // Month labels
    const monthLabels: { month: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, col) => {
        const firstValid = week.find(d => d !== null);
        if (firstValid) {
            const month = firstValid.getMonth();
            if (month !== lastMonth) {
                monthLabels.push({ month: MONTHS[month], col });
                lastMonth = month;
            }
        }
    });

    const totalActivities = data.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900">Actividad registrada</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{totalActivities} actividades en el último año</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span>Menos</span>
                    {['#f1f5f9', '#bbf7d0', '#4ade80', '#16a34a', '#14532d'].map(c => (
                        <div key={c} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                    ))}
                    <span>Más</span>
                </div>
            </div>
            <div className="overflow-x-auto">
                <div className="inline-block">
                    {/* Month labels */}
                    <div className="flex mb-1 ml-6">
                        {weeks.map((_, col) => {
                            const label = monthLabels.find(m => m.col === col);
                            return (
                                <div key={col} className="w-[13px] mr-[2px] text-[9px] text-slate-400 text-center leading-none">
                                    {label?.month ?? ''}
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex gap-0.5">
                        {/* Day labels */}
                        <div className="flex flex-col gap-[2px] mr-1">
                            {DAYS.map((d, i) => (
                                <div key={d} className="h-[11px] w-4 text-[9px] text-slate-400 flex items-center justify-center leading-none">
                                    {i % 2 === 0 ? d : ''}
                                </div>
                            ))}
                        </div>
                        {/* Grid */}
                        {weeks.map((week, col) => (
                            <div key={col} className="flex flex-col gap-[2px]">
                                {week.map((day, row) => {
                                    if (!day) {
                                        return <div key={row} className="w-[11px] h-[11px] rounded-sm" style={{ backgroundColor: 'transparent' }} />;
                                    }
                                    const dateStr = format(day, 'yyyy-MM-dd');
                                    const count = countMap.get(dateStr) ?? 0;
                                    const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
                                    return (
                                        <div
                                            key={row}
                                            title={`${format(day, 'dd MMM yyyy', { locale: es })}: ${count} actividades`}
                                            className="w-[11px] h-[11px] rounded-sm transition-transform hover:scale-125 cursor-default"
                                            style={{
                                                backgroundColor: getColor(count),
                                                outline: isToday ? '1.5px solid #16a34a' : undefined,
                                                outlineOffset: '1px',
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
