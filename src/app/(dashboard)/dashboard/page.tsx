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
import { formatCurrency } from '@/lib/utils';
import type { KPIResponsable, KPIArea, KPISector, FunnelItem, ProximaReunion, Actividad, Responsable } from '@/types';

export const dynamic = 'force-dynamic';

async function getDashboardData(filters: {
    responsable?: string;
    area?: string;
    sector?: string;
    periodo?: string;
}) {
    const supabase = await createClient();

    // Construir query de oportunidades con filtros
    let opQuery = supabase
        .from('oportunidades')
        .select(`
            *,
            cliente:clientes(nombre, sector),
            responsable:responsables(nombre, color)
        `)
        .eq('archivada', false);

    if (filters.area) {
        opQuery = opQuery.eq('area', filters.area);
    }
    if (filters.sector) {
        opQuery = opQuery.eq('cliente.sector' as any, filters.sector);
    }

    // Para el filtro por responsable, obtenemos el id del responsable por nombre
    let responsableIdFiltro: string | undefined;
    if (filters.responsable) {
        const { data: respData } = await supabase
            .from('responsables')
            .select('id')
            .eq('nombre', filters.responsable)
            .single();
        if (respData) {
            responsableIdFiltro = respData.id;
            opQuery = opQuery.eq('responsable_id', responsableIdFiltro);
        }
    }

    const [
        kpiResponsableRes,
        kpiAreaRes,
        kpiSectorRes,
        funnelRes,
        reunionesRes,
        actividadesRes,
        responsablesRes,
        opFiltradas,
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
        supabase.from('responsables').select('*').eq('activo', true),
        opQuery,
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
    ]);

    const kpiResponsable: KPIResponsable[] = kpiResponsableRes.data ?? [];
    const kpiArea: KPIArea[] = kpiAreaRes.data ?? [];
    const kpiSector: KPISector[] = kpiSectorRes.data ?? [];
    const funnel: FunnelItem[] = funnelRes.data ?? [];
    const reuniones: ProximaReunion[] = reunionesRes.data ?? [];
    const actividades: Actividad[] = (actividadesRes.data ?? []) as Actividad[];
    const responsables: Responsable[] = responsablesRes.data ?? [];
    const oportunidadesFiltradas = opFiltradas.data ?? [];

    // KPIs calculados sobre las oportunidades filtradas
    const pipelineTotal = oportunidadesFiltradas
        .filter(o => !['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion))
        .reduce((sum, o) => sum + Number(o.presupuesto ?? 0), 0);

    const importeGanado = oportunidadesFiltradas
        .filter(o => o.situacion === 'PROPUESTA_GANADA')
        .reduce((sum, o) => sum + Number(o.presupuesto ?? 0), 0);

    const numActivas = oportunidadesFiltradas
        .filter(o => !['PROPUESTA_GANADA', 'PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion))
        .length;

    const numClientes = clientesRes.count ?? 0;

    const totalGanadas = oportunidadesFiltradas.filter(o => o.situacion === 'PROPUESTA_GANADA').length;
    const totalCerradas = oportunidadesFiltradas.filter(o =>
        o.situacion === 'PROPUESTA_GANADA' || o.situacion === 'PROPUESTA_PERDIDA'
    ).length;
    const tasaConversion = totalCerradas > 0 ? Math.round((totalGanadas / totalCerradas) * 100) : 0;

    // Recalcular KPIs por area/sector/responsable usando las oportunidades filtradas
    const kpiResponsableFiltrado: KPIResponsable[] = filters.responsable || filters.area || filters.sector
        ? responsables.map(r => {
            const ops = oportunidadesFiltradas.filter((o: any) => o.responsable_id === r.id);
            return {
                responsable_id: r.id,
                responsable: r.nombre,
                color: r.color,
                total_oportunidades: ops.length,
                ganadas: ops.filter(o => o.situacion === 'PROPUESTA_GANADA').length,
                presentadas: ops.filter(o => o.situacion === 'PROPUESTA_PRESENTADA').length,
                activas: ops.filter(o => !['PROPUESTA_GANADA', 'PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion)).length,
                pipeline_total: ops.filter(o => !['PROPUESTA_PERDIDA', 'DESCARTADA'].includes(o.situacion)).reduce((s, o) => s + Number(o.presupuesto ?? 0), 0),
                importe_ganado: ops.filter(o => o.situacion === 'PROPUESTA_GANADA').reduce((s, o) => s + Number(o.presupuesto ?? 0), 0),
                tasa_conversion: totalCerradas > 0 ? Math.round((totalGanadas / totalCerradas) * 100) : 0,
            } as unknown as KPIResponsable;
        })
        : kpiResponsable;

    // Recalcular funnel con datos filtrados
    const funnelFiltrado: FunnelItem[] = filters.responsable || filters.area || filters.sector
        ? (() => {
            const grouped: Record<string, { num: number; importe: number }> = {};
            oportunidadesFiltradas.forEach(o => {
                if (!grouped[o.situacion]) grouped[o.situacion] = { num: 0, importe: 0 };
                grouped[o.situacion].num++;
                grouped[o.situacion].importe += Number(o.presupuesto ?? 0);
            });
            return Object.entries(grouped).map(([situacion, v]) => ({
                situacion: situacion as any,
                num_oportunidades: v.num,
                importe_total: v.importe,
            }));
        })()
        : funnel;

    return {
        kpiResponsable: kpiResponsableFiltrado,
        kpiArea,
        kpiSector,
        funnel: funnelFiltrado,
        reuniones,
        actividades,
        responsables,
        pipelineTotal,
        importeGanado,
        numActivas,
        numClientes,
        tasaConversion,
    };
}

interface DashboardPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const params = await searchParams;
    const filters = {
        responsable: typeof params.responsable === 'string' ? params.responsable : undefined,
        area: typeof params.area === 'string' ? params.area : undefined,
        sector: typeof params.sector === 'string' ? params.sector : undefined,
        periodo: typeof params.periodo === 'string' ? params.periodo : '2026',
    };

    const data = await getDashboardData(filters);

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Suspense>
                <DashboardFilters responsables={data.responsables} />
            </Suspense>

            {/* Indicador de filtros activos */}
            {(filters.responsable || filters.area || filters.sector) && (
                <div className="flex items-center gap-2 text-sm text-slate-500 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                    <span className="font-medium text-green-700">Filtros activos:</span>
                    {filters.responsable && <span className="bg-green-100 text-green-800 rounded px-2 py-0.5">{filters.responsable}</span>}
                    {filters.area && <span className="bg-indigo-100 text-indigo-800 rounded px-2 py-0.5">{filters.area}</span>}
                    {filters.sector && <span className="bg-amber-100 text-amber-800 rounded px-2 py-0.5">{filters.sector}</span>}
                </div>
            )}

            {/* KPIs — Fila 1 */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard
                    title="Pipeline Total"
                    value={formatCurrency(data.pipelineTotal)}
                    icon={TrendingUp}
                    color="green"
                    trendLabel="Oportunidades activas"
                    trend="up"
                />
                <KPICard
                    title="Importe Ganado"
                    value={formatCurrency(data.importeGanado)}
                    icon={Trophy}
                    color="amber"
                />
                <KPICard
                    title="Oportunidades Activas"
                    value={String(data.numActivas)}
                    icon={Target}
                    color="indigo"
                    subtitle={`de ${data.numClientes} clientes`}
                />
                <KPICard
                    title="Tasa de Conversión"
                    value={`${data.tasaConversion}%`}
                    icon={Percent}
                    color="blue"
                    trendLabel="Propuestas ganadas / cerradas"
                />
            </div>

            {/* Gráficas — Fila 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <PipelineChart data={data.kpiResponsable} />
                <FunnelChart data={data.funnel} />
            </div>

            {/* Gráficas — Fila 3 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <AreaPieChart data={data.kpiArea} />
                <SectorBarChart data={data.kpiSector} />
                <ProximasReunionesList reuniones={data.reuniones} />
            </div>

            {/* Actividad reciente — Fila 4 */}
            <ActividadReciente actividades={data.actividades} />
        </div>
    );
}
