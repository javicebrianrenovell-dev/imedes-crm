// src/app/(dashboard)/oportunidades/[id]/editar/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { OportunidadForm } from '@/components/oportunidades/OportunidadForm';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Cliente, Responsable, Oportunidad } from '@/types';

interface EditarOportunidadPageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarOportunidadPage({ params }: EditarOportunidadPageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const [opRes, clientesRes, responsablesRes] = await Promise.all([
        supabase.from('oportunidades').select('*').eq('id', id).single(),
        supabase.from('clientes').select('id, nombre, sector').eq('activo', true).order('nombre'),
        supabase.from('responsables').select('id, nombre, color').eq('activo', true),
    ]);

    if (!opRes.data) notFound();

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Editar oportunidad" subtitle={opRes.data.nombre} />
            <OportunidadForm
                clientes={(clientesRes.data as Cliente[]) ?? []}
                responsables={(responsablesRes.data as Responsable[]) ?? []}
                oportunidad={opRes.data as Oportunidad}
                mode="edit"
            />
        </div>
    );
}
