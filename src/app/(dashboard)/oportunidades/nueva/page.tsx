// src/app/(dashboard)/oportunidades/nueva/page.tsx
import { createClient } from '@/lib/supabase/server';
import { OportunidadForm } from '@/components/oportunidades/OportunidadForm';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Cliente, Responsable } from '@/types';

export default async function NuevaOportunidadPage() {
    const supabase = await createClient();

    const [clientesRes, responsablesRes] = await Promise.all([
        supabase.from('clientes').select('id, nombre, sector').eq('activo', true).order('nombre'),
        supabase.from('responsables').select('id, nombre, color').eq('activo', true),
    ]);

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Nueva oportunidad" subtitle="Registra un nuevo proyecto o propuesta comercial" />
            <OportunidadForm
                clientes={(clientesRes.data as Cliente[]) ?? []}
                responsables={(responsablesRes.data as Responsable[]) ?? []}
                mode="create"
            />
        </div>
    );
}
