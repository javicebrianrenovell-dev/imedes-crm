// src/app/(dashboard)/clientes/[id]/editar/page.tsx
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Cliente } from '@/types';

interface EditarClientePageProps {
    params: Promise<{ id: string }>;
}

export default async function EditarClientePage({ params }: EditarClientePageProps) {
    const { id } = await params;
    const supabase = await createClient();

    const { data: cliente } = await supabase.from('clientes').select('*').eq('id', id).single();
    if (!cliente) notFound();

    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Editar cliente" subtitle={cliente.nombre} />
            <ClienteForm cliente={cliente as Cliente} mode="edit" />
        </div>
    );
}
