// src/components/shared/SkeletonLoaders.tsx

export function SkeletonKPICard() {
    return (
        <div className="kpi-card animate-pulse">
            <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                    <div className="h-3 w-24 bg-slate-200 rounded" />
                    <div className="h-7 w-32 bg-slate-200 rounded" />
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-200" />
            </div>
        </div>
    );
}

export function SkeletonChart({ height = 220 }: { height?: number }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm animate-pulse">
            <div className="space-y-2 mb-4">
                <div className="h-4 w-40 bg-slate-200 rounded" />
                <div className="h-3 w-28 bg-slate-100 rounded" />
            </div>
            <div className="bg-slate-100 rounded-lg" style={{ height }} />
        </div>
    );
}

export function SkeletonTableRow({ cols = 7 }: { cols?: number }) {
    return (
        <tr>
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div
                        className="h-4 bg-slate-100 rounded animate-pulse"
                        style={{ width: `${50 + (i % 4) * 15}%` }}
                    />
                </td>
            ))}
        </tr>
    );
}

export function SkeletonTableFull({ rows = 8, cols = 7 }: { rows?: number; cols?: number }) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50">
                            {Array.from({ length: cols }).map((_, i) => (
                                <th key={i} className="px-4 py-3">
                                    <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {Array.from({ length: rows }).map((_, i) => (
                            <SkeletonTableRow key={i} cols={cols} />
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function SkeletonDashboard() {
    return (
        <div className="space-y-6">
            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <SkeletonKPICard key={i} />)}
            </div>
            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <SkeletonChart />
                <SkeletonChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <SkeletonChart height={180} />
                <SkeletonChart height={180} />
                <SkeletonChart height={180} />
            </div>
        </div>
    );
}

export function SkeletonKanbanCard() {
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-3 animate-pulse space-y-2">
            <div className="h-3 w-16 bg-slate-200 rounded" />
            <div className="h-4 w-full bg-slate-200 rounded" />
            <div className="h-3 w-3/4 bg-slate-100 rounded" />
            <div className="h-4 w-20 bg-slate-200 rounded" />
        </div>
    );
}

export function SkeletonDetail() {
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-2">
                    <div className="h-6 w-64 bg-slate-200 rounded" />
                    <div className="h-4 w-32 bg-slate-100 rounded" />
                </div>
                <div className="h-9 w-24 bg-slate-200 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                            <div className="h-4 w-24 bg-slate-200 rounded" />
                            <div className="h-16 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-8 bg-slate-100 rounded" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
