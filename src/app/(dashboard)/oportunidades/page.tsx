// src/app/(dashboard)/oportunidades/page.tsx
import { Suspense } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Plus, LayoutList, Kanban } from 'lucide-react';
import { OportunidadTable } from '@/components/oportunidades/OportunidadTable';
import { OportunidadKanban } from '@/components/oportunidades/OportunidadKanban';
import { OportunidadFilters } from '@/components/oportunidades/OportunidadFilters';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingPage } from '@/components/shared/LoadingSpinner';
import type { Oportunidad, Responsable } from '@/types';

export const dynamic = 'force-dynamic';

interface OportunidadesPageProps {
    searchParams: Promise<{
        view?: string;
        search?: string;
        responsable_id?: string;
        area?: string;
        situacion?: string;
        sector?: string;
        page?: string;
        perPage?: string;
    }>;
}

export default async function OportunidadesPage({ searchParams }: OportunidadesPageProps) {
    const params = await searchParams;
    const view = params.view ?? 'table';
    const page = parseInt(params.page ?? '1');
    const perPage = parseInt(params.perPage ?? '25');

    const supabase = await createClient();

    // Cargar responsables para filtros
    const { data: responsables } = await supabase
        .from('responsables')
        .select('*')
        .eq('activo', true);

    // Construir query con filtros
    let query = supabase
        .from('oportunidades')
        .select('*, cliente:clientes(id, nombre, sector), responsable:responsables(id, nombre, color)', { count: 'exact' })
        .eq('archivada', false)
        .order('updated_at', { ascending: false });

    if (params.search) {
        query = query.or(`nombre.ilike.%${params.search}%,cliente.nombre.ilike.%${params.search}%`);
    }
    if (params.responsable_id) {
        query = query.eq('responsable_id', params.responsable_id);
    }
    if (params.area) {
        query = query.eq('area', params.area);
    }
    if (params.situacion) {
        query = query.eq('situacion', params.situacion);
    }
    if (params.sector) {
        query = query.eq('cliente.sector', params.sector);
    }

    // Paginación server-side
    if (view === 'table') {
        query = query.range((page - 1) * perPage, page * perPage - 1);
    }

    const { data: oportunidades, count } = await query;

    const viewToggle = (
        <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white overflow-hidden">
                <Link
                    href="?view=table"
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${view === 'table' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <LayoutList className="h-4 w-4" /> Tabla
                </Link>
                <Link
                    href="?view=kanban"
                    className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-l border-slate-200 transition-colors ${view === 'kanban' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    <Kanban className="h-4 w-4" /> Kanban
                </Link>
            </div>
            <Link
                href="/oportunidades/nueva"
                id="btn-nueva-oportunidad"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
                <Plus className="h-4 w-4" />
                Nueva oportunidad
            </Link>
        </div>
    );

    return (
        <div>
            <PageHeader
                title="Oportunidades"
                subtitle={`${count ?? 0} oportunidades activas`}
                actions={viewToggle}
            />

            <Suspense>
                <OportunidadFilters responsables={(responsables as Responsable[]) ?? []} />
            </Suspense>

            <Suspense fallback={<LoadingPage />}>
                {view === 'kanban' ? (
                    <OportunidadKanban oportunidades={(oportunidades as Oportunidad[]) ?? []} />
                ) : (
                    <OportunidadTable
                        oportunidades={(oportunidades as Oportunidad[]) ?? []}
                        total={count ?? 0}
                        page={page}
                        perPage={perPage}
                    />
                )}
            </Suspense>
        </div>
    );
}
