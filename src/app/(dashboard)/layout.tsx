// src/app/(dashboard)/layout.tsx
import DashboardLayoutClient from '@/components/layout/DashboardLayoutClient';

/**
 * Layout principal del Dashboard.
 * Se ha desactivado la comprobación de usuario para permitir acceso libre.
 */
export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ya no comprobamos si el usuario existe para dejar entrar a cualquiera
    return (
        <DashboardLayoutClient>
            {children}
        </DashboardLayoutClient>
    );
}
