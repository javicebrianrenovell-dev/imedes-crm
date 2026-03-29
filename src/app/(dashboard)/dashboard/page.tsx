/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(dashboard)/dashboard/page.tsx
import { Suspense } from 'react';
import { createClient } from '@/lib/supabase/server';
import { TrendingUp, Trophy, Target, Percent } from 'lucide-react';
import { KPICard } from '@/components/dashboard/KPICard';
import { PipelineChart } from '@/components/dashboard/PipelineChart';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { AreaPieChart } from '@/components/dashboard/AreaPieChart';
import { SectorBarChart } from '@/components/dashboard/SectorBarChart';
import { ProximasReunionesList } from '@/components/dashboard/ProximasReunionesList';
import { ActividadReciente } from '@/components/dashboard/ActividadReciente';
import { DashboardFilters } from '@/components/dashboard/DashboardFilters';
import { PipelineHealthScore } from '@/components/dashboard/PipelineHealthScore';
import { ActivityHeatmap } from '@/components/dashboard/ActivityHeatmap';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { KPIResponsable, KPIArea, KPISector, FunnelItem, ProximaReunion, Actividad, Responsable } from '@/types';

export const dynamic = 'force-dynamic';

async function getDashboardData(filters: {
    responsable?: string;
    area?: string;
    sector?: string;
}) {
    const supabase = await createClient();

    // Obtener responsables
    const { data: responsablesData } = await supabase
        .from('responsables')
        .select('*')
        .eq('activo', true);
    const responsables: Responsable[] = responsablesData ?? [];

    // Obtener todas las oportunidades sin filtrar para las vistas KPI
    const [
        kpiResponsableRes,
        kpiAreaRes,
        kpiSectorRes,
        funnelRes,
        reunionesRes,
        actividadesRes,
        clientesRes,
    ] = await Promise.all([
        supabase.from('vista_kpi_responsable').select('*'),
        supabase.from('vista_kpi_area').select('*'),
        supabase.from('vista_kpi_sector').select('*'),
        supabase.from('vista_funnel').select('*'),
        supabase.from('vista_proximas_reuniones').select('*').limit(10),
        supabase
            .from('actividades')
            .select('*, responsable:responsables(nombre, color), oportunidad:oportunidades(nombre), cliente:clientes(nombre)')
            .order('fecha', { ascending: false })
            .limit(10),
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
    ]);

    const kpiResponsable: KPIResponsable[] = kpiResponsableRes.data ?? [];
    const kpiArea: KPIArea[] = kpiAreaRes.data ?? [];
    const kpiSector: KPISector[] = kpiSectorRes.data ?? [];
    const funnel: FunnelItem[] = funnelRes.data ?? [];
    const reuniones: ProximaReunion[] = reunionesRes.data ?? [];
    const actividades: Actividad[] = (actividadesRes.data ?? []) as Actividad[];
    const numClientes = clientesRes.count ?? 0;

    // Si hay filtros, traer oportunidades filtradas
    let pipelineTotal = kpiResponsable.reduce((sum, r) => sum + Number(r.pipeline_total), 0);
    let importeGanado = kpiResponsable.reduce((sum, r) => sum + Number(r.importe_ganado), 0);
    let numActivas = 0;
    let tasaConversion = 0;
    let kpiResponsableFinal = kpiResponsable;
    let funnelFinal = funnel;

    // Calcular numActivas y tasaConversion desde el funnel
    const totalGanadasFunnel = funnel.find(f => f.situacion === 'PROPUESTA_GANADA')?.num_oportunidades ?? 0;
    const totalPerdidasFunnel = funnel.find(f => f.situacion === 'PROPUESTA_PERDIDA')?.num_oportunidades ?? 0;
    const totalCerradas = totalGanadasFunnel + totalPerdidasFunnel;
    tasaConversion = totalCerradas > 0 ? Math.round((totalGanadasFunnel / totalCerradas) * 100) : 0;
    numActivas = funnel
        .filter(f => !['PROPUESTA_GANADA', 'PROPUESTA_PERDIDA', 'DESCARTADA'].includes(f.situacion))
        .reduce((sum, f) => sum + Number(f.num_oportunidades), 0);

    if (filters.responsable || filters.area || filters.sector) {
        // Construir query raww como any para evitar TypeScript deep instantiation
        let q = supabase.from('oportunidades').select('id,situacion,presupuesto,area,responsable_id,cliente_id,archivada').eq('archivada', false) as any;
        if (filters.area) q = q.eq('area', filters.area);
        if (filters.responsable) {
            const { data: rd } = await supabase.from('responsables').select('id').eq('nombre', filters.responsable).single();
            if (rd) q = q.eq('responsable_id', rd.id);
        }

        const { data: ops } = await q;
        const oportunidades: any[] = ops ?? [];

        // Si filtramos por sector, necesitamos cruzar con clientes
        let opsFiltradas = oportunidades;
        if (filters.sector) {
            const { data: clientesSector } = await supabase
                .from('clientes')
                .select('id')
                .eq('sector', filters.sector);
            const clienteIds = new Set((clientesSector ?? []).map((c: any) => c.id));
            opsFiltradas = oportunidades.filter((o: any) => clienteIds.has(o.cliente_id));
        }

        pipelineTotal = opsFiltradas
            .filter((o: any) => !['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion))
            .reduce((sum: number, o: any) => sum + Number(o.presupuesto ?? 0), 0);
        importeGanado = opsFiltradas
            .filter((o: any) => o.situacion === 'PROPUESTA_GANADA')
            .reduce((sum: number, o: any) => sum + Number(o.presupuesto ?? 0), 0);
        numActivas = opsFiltradas.filter((o: any) =>
            !['PROPUESTA_GANADA', 'PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion)
        ).length;
        const totalGanadas = opsFiltradas.filter((o: any) => o.situacion === 'PROPUESTA_GANADA').length;
        const totalCerradas2 = opsFiltradas.filter((o: any) =>
            o.situacion === 'PROPUESTA_GANADA' || o.situacion === 'PROPUESTA_PERDIDA'
        ).length;
        tasaConversion = totalCerradas2 > 0 ? Math.round((totalGanadas / totalCerradas2) * 100) : 0;

        // Recalcular KPI por responsable
        kpiResponsableFinal = responsables.map(r => {
            const rOps = opsFiltradas.filter((o: any) => o.responsable_id === r.id);
            return {
                responsable_id: r.id,
                responsable: r.nombre,
                color: r.color,
                total_oportunidades: rOps.length,
                ganadas: rOps.filter((o: any) => o.situacion === 'PROPUESTA_GANADA').length,
                presentadas: rOps.filter((o: any) => o.situacion === 'PROPUESTA_PRESENTADA').length,
                activas: rOps.filter((o: any) => !['PROPUESTA_GANADA', 'PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion)).length,
                pipeline_total: rOps.filter((o: any) => !['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion)).reduce((s: number, o: any) => s + Number(o.presupuesto ?? 0), 0),
                importe_ganado: rOps.filter((o: any) => o.situacion === 'PROPUESTA_GANADA').reduce((s: number, o: any) => s + Number(o.presupuesto ?? 0), 0),
                tasa_conversion: 0,
            } as unknown as KPIResponsable;
        });

        // Recalcular funnel
        const grouped: Record<string, { num: number; importe: number }> = {};
        opsFiltradas.forEach((o: any) => {
            if (!grouped[o.situacion]) grouped[o.situacion] = { num: 0, importe: 0 };
            grouped[o.situacion].num++;
            grouped[o.situacion].importe += Number(o.presupuesto ?? 0);
        });
        funnelFinal = Object.entries(grouped).map(([situacion, v]) => ({
            situacion: situacion as FunnelItem['situacion'],
            num_oportunidades: v.num,
            importe_total: v.importe,
        }));
    }

    // Health metrics: % activas con próxima reunión definida + % con presupuesto
    const activas = (await supabase
        .from('oportunidades')
        .select('id, presupuesto, fecha_proxima_reunion, situacion')
        .eq('archivada', false)
        .not('situacion', 'in', '(PROPUESTA_GANADA,PROPUESTA_PERDIDA,DESCARTADA)')).data ?? [];

    const totalActivas = activas.length;
    const pctConReunion = totalActivas > 0
        ? Math.round(activas.filter((o: any) => o.fecha_proxima_reunion).length / totalActivas * 100)
        : 0;
    const pctConPresupuesto = totalActivas > 0
        ? Math.round(activas.filter((o: any) => o.presupuesto && Number(o.presupuesto) > 0).length / totalActivas * 100)
        : 0;

    // Activity heatmap data: group by date
    const { data: heatmapRaw } = await supabase
        .from('actividades')
        .select('fecha')
        .order('fecha', { ascending: false })
        .limit(500);

    const heatmapMap = new Map<string, number>();
    (heatmapRaw ?? []).forEach((a: any) => {
        const date = a.fecha?.slice(0, 10);
        if (date) heatmapMap.set(date, (heatmapMap.get(date) ?? 0) + 1);
    });
    const heatmapData = Array.from(heatmapMap.entries()).map(([date, count]) => ({ date, count }));

    const healthMetrics = [
        { label: 'Con reunión programada', value: pctConReunion, description: 'Oportunidades con próxima reunión' },
        { label: 'Con presupuesto definido', value: pctConPresupuesto, description: 'Oportunidades con importe' },
        { label: 'Tasa de conversión', value: tasaConversion, description: 'Ganadas vs cerradas' },
    ];

    return {
        kpiResponsable: kpiResponsableFinal,
        kpiArea,
        kpiSector,
        funnel: funnelFinal,
        reuniones,
        actividades,
        responsables,
        pipelineTotal,
        importeGanado,
        numActivas,
        numClientes,
        tasaConversion,
        healthMetrics,
        heatmapData,
    };
}

// Next.js 14: searchParams es un objeto directo (NO Promise)
interface DashboardPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const filters = {
        responsable: typeof searchParams.responsable === 'string' ? searchParams.responsable : undefined,
        area: typeof searchParams.area === 'string' ? searchParams.area : undefined,
        sector: typeof searchParams.sector === 'string' ? searchParams.sector : undefined,
        periodo: typeof searchParams.periodo === 'string' ? searchParams.periodo : '2026',
    };

    const data = await getDashboardData(filters);

    return (
        <div className="space-y-5">
            {/* Filtros */}
            <Suspense>
                <DashboardFilters responsables={data.responsables} />
            </Suspense>

            {/* Indicador de filtros activos */}
            {(filters.responsable || filters.area || filters.sector) && (
                <div className="flex items-center gap-2 text-sm bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="font-medium text-green-700">Filtros activos:</span>
                    {filters.responsable && <span className="bg-green-100 text-green-800 rounded-md px-2 py-0.5 text-xs">{filters.responsable}</span>}
                    {filters.area && <span className="bg-indigo-100 text-indigo-800 rounded-md px-2 py-0.5 text-xs">{filters.area}</span>}
                    {filters.sector && <span className="bg-amber-100 text-amber-800 rounded-md px-2 py-0.5 text-xs">{filters.sector}</span>}
                </div>
            )}

            {/* KPIs Hero Strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Pipeline Total"
                    value={formatCurrency(data.pipelineTotal)}
                    icon={TrendingUp}
                    color="green"
                    hero
                    trendLabel={`${data.numActivas} oportunidades activas`}
                    trend="up"
                />
                <KPICard
                    title="Importe Ganado"
                    value={formatCurrency(data.importeGanado)}
                    icon={Trophy}
                    color="amber"
                    hero
                />
                <KPICard
                    title="Oportunidades"
                    value={String(data.numActivas)}
                    icon={Target}
                    color="indigo"
                    hero
                    subtitle={`de ${data.numClientes} clientes`}
                />
                <KPICard
                    title="Conversión"
                    value={`${data.tasaConversion}%`}
                    icon={Percent}
                    color="blue"
                    hero
                    trendLabel="Ganadas vs cerradas"
                />
            </div>

            {/* Gráficas principales — Fila 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PipelineChart data={data.kpiResponsable} />
                <FunnelChart data={data.funnel} />
            </div>

            {/* Gráficas secundarias — Fila 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AreaPieChart data={data.kpiArea} />
                <SectorBarChart data={data.kpiSector} />
                <ProximasReunionesList reuniones={data.reuniones} />
            </div>

            {/* Fila 4: Actividad + Health Score */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2">
                    <ActividadReciente actividades={data.actividades} />
                </div>
                <PipelineHealthScore metrics={data.healthMetrics} />
            </div>

            {/* Heatmap de actividad */}
            <ActivityHeatmap data={data.heatmapData} />
        </div>
    );
}
