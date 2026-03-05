// src/app/(dashboard)/ajustes/page.tsx
import { createClient } from '@/lib/supabase/server';
import { PageHeader } from '@/components/shared/PageHeader';
import type { Responsable } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AjustesPage() {
    const supabase = await createClient();
    const { data: responsables } = await supabase
        .from('responsables')
        .select('*')
        .order('nombre');

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <PageHeader title="Ajustes" subtitle="Configuración del sistema" />

            {/* Responsables */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Responsables del equipo</h3>
                <ul className="space-y-2">
                    {(responsables as Responsable[])?.map(r => (
                        <li key={r.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                    style={{ backgroundColor: r.color }}
                                >
                                    {r.nombre.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">{r.nombre}</p>
                                    {r.email && <p className="text-xs text-slate-400">{r.email}</p>}
                                </div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.activo ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                {r.activo ? 'Activo' : 'Inactivo'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Info del sistema */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-slate-900 mb-4">Información del sistema</h3>
                <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <dt className="text-slate-500">Versión</dt>
                        <dd className="font-medium text-slate-700">1.0.0</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-500">Tecnología</dt>
                        <dd className="font-medium text-slate-700">Next.js 14 + Supabase</dd>
                    </div>
                    <div className="flex justify-between">
                        <dt className="text-slate-500">Base de datos</dt>
                        <dd className="font-medium text-slate-700">PostgreSQL (self-hosted)</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
