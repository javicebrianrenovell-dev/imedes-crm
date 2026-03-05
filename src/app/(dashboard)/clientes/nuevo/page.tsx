// src/app/(dashboard)/clientes/nuevo/page.tsx
import { ClienteForm } from '@/components/clientes/ClienteForm';
import { PageHeader } from '@/components/shared/PageHeader';

export default function NuevoClientePage() {
    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader title="Nuevo cliente" subtitle="Añade un nuevo cliente al sistema" />
            <ClienteForm mode="create" />
        </div>
    );
}
