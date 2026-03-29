// src/app/layout.tsx
import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/shared/Toast';

export const metadata: Metadata = {
    title: 'IMEDES CRM',
    description: 'Sistema de gestión del desarrollo de negocio de IMEDES',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="es" suppressHydrationWarning>
            <body className="min-h-screen bg-slate-50 antialiased">
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}
