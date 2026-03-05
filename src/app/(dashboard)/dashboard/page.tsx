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

async function getDashboardData() {
    const supabase = await createClient();

    const [
        kpiResponsableRes,
        kpiAreaRes,
        kpiSectorRes,
        funnelRes,
        reunionesRes,
        actividadesRes,
        responsablesRes,
        oportunidadesActivasRes,
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
        supabase
            .from('oportunidades')
            .select('id', { count: 'exact', head: true })
            .eq('archivada', false)
            .not('situacion', 'in', '("PROPUESTA_GANADA","PROPUESTA_PERDIDA","DESCARTADA")'),
        supabase.from('clientes').select('id', { count: 'exact', head: true }).eq('activo', true),
    ]);

    const kpiResponsable: KPIResponsable[] = kpiResponsableRes.data ?? [];
    const kpiArea: KPIArea[] = kpiAreaRes.data ?? [];
    const kpiSector: KPISector[] = kpiSectorRes.data ?? [];
    const funnel: FunnelItem[] = funnelRes.data ?? [];
    const reuniones: ProximaReunion[] = reunionesRes.data ?? [];
    const actividades: Actividad[] = (actividadesRes.data ?? []) as Actividad[];
    const responsables: Responsable[] = responsablesRes.data ?? [];

    // KPIs globales
    const pipelineTotal = kpiResponsable.reduce((sum, r) => sum + Number(r.pipeline_total), 0);
    const importeGanado = kpiResponsable.reduce((sum, r) => sum + Number(r.importe_ganado), 0);
    const numActivas = oportunidadesActivasRes.count ?? 0;
    const numClientes = clientesRes.count ?? 0;
    const totalGanadas = kpiResponsable.reduce((sum, r) => sum + Number(r.ganadas), 0);
    const totalCerradas = funnel.filter(f =>
        f.situacion === 'PROPUESTA_GANADA' || f.situacion === 'PROPUESTA_PERDIDA'
    ).reduce((sum, f) => sum + Number(f.num_oportunidades), 0);
    const tasaConversion = totalCerradas > 0 ? Math.round((totalGanadas / totalCerradas) * 100) : 0;

    return { kpiResponsable, kpiArea, kpiSector, funnel, reuniones, actividades, responsables, pipelineTotal, importeGanado, numActivas, numClientes, tasaConversion };
}

export default async function DashboardPage() {
    const data = await getDashboardData();

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Suspense>
                <DashboardFilters responsables={data.responsables} />
            </Suspense>

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
