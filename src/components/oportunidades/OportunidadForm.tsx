'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Cliente, Responsable } from '@/types';
import { createOportunidad, updateOportunidad } from '@/actions/oportunidades';
import { SITUACION_CONFIG, FUNNEL_ORDER } from '@/lib/constants';
import type { Oportunidad } from '@/types';

interface OportunidadFormProps {
    clientes: Cliente[];
    responsables: Responsable[];
    oportunidad?: Oportunidad;
    mode?: 'create' | 'edit';
}

export function OportunidadForm({ clientes, responsables, oportunidad, mode = 'create' }: OportunidadFormProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            if (mode === 'edit' && oportunidad) {
                await updateOportunidad(oportunidad.id, formData);
            } else {
                await createOportunidad(formData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-5">Información principal</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Cliente */}
                    <div className="md:col-span-2">
                        <label htmlFor="cliente_id" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Cliente <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="cliente_id"
                            name="cliente_id"
                            required
                            defaultValue={oportunidad?.cliente_id ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Seleccionar cliente...</option>
                            {clientes.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Nombre */}
                    <div className="md:col-span-2">
                        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Nombre del proyecto <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            minLength={2}
                            maxLength={200}
                            defaultValue={oportunidad?.nombre ?? ''}
                            placeholder="Ej. Licitación convenio MIVAU DANA"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Área */}
                    <div>
                        <label htmlFor="area" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Área <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="area"
                            name="area"
                            required
                            defaultValue={oportunidad?.area ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Seleccionar área...</option>
                            <option value="CONSULTORÍA">Consultoría</option>
                            <option value="COMUNICACIÓN">Comunicación</option>
                            <option value="EA">Est. Ambiental</option>
                        </select>
                    </div>

                    {/* Situación */}
                    <div>
                        <label htmlFor="situacion" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Situación <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="situacion"
                            name="situacion"
                            required
                            defaultValue={oportunidad?.situacion ?? 'PENDIENTE_AGENDAR'}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {FUNNEL_ORDER.concat(['PROPUESTA_PERDIDA', 'DESCARTADA']).map(sit => (
                                <option key={sit} value={sit}>
                                    {SITUACION_CONFIG[sit as keyof typeof SITUACION_CONFIG]?.label ?? sit}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Responsable */}
                    <div>
                        <label htmlFor="responsable_id" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Responsable
                        </label>
                        <select
                            id="responsable_id"
                            name="responsable_id"
                            defaultValue={oportunidad?.responsable_id ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="">Sin asignar</option>
                            {responsables.map(r => (
                                <option key={r.id} value={r.id}>{r.nombre}</option>
                            ))}
                        </select>
                    </div>

                    {/* Presupuesto */}
                    <div>
                        <label htmlFor="presupuesto" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Presupuesto (€)
                        </label>
                        <input
                            id="presupuesto"
                            name="presupuesto"
                            type="number"
                            min="0"
                            step="0.01"
                            defaultValue={oportunidad?.presupuesto ?? ''}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Probabilidad */}
                    <div>
                        <label htmlFor="probabilidad_cierre" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Probabilidad de cierre (%)
                        </label>
                        <input
                            id="probabilidad_cierre"
                            name="probabilidad_cierre"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={oportunidad?.probabilidad_cierre ?? ''}
                            placeholder="50"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Prioridad */}
                    <div>
                        <label htmlFor="prioridad" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Prioridad
                        </label>
                        <select
                            id="prioridad"
                            name="prioridad"
                            defaultValue={oportunidad?.prioridad ?? 2}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="1">🔴 Alta</option>
                            <option value="2">🟡 Media</option>
                            <option value="3">🟢 Baja</option>
                        </select>
                    </div>

                    {/* Fecha próxima reunión */}
                    <div>
                        <label htmlFor="fecha_proxima_reunion" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Fecha próxima reunión
                        </label>
                        <input
                            id="fecha_proxima_reunion"
                            name="fecha_proxima_reunion"
                            type="date"
                            defaultValue={oportunidad?.fecha_proxima_reunion?.slice(0, 10) ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Fecha última reunión */}
                    <div>
                        <label htmlFor="fecha_ultima_reunion" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Fecha última reunión
                        </label>
                        <input
                            id="fecha_ultima_reunion"
                            name="fecha_ultima_reunion"
                            type="date"
                            defaultValue={oportunidad?.fecha_ultima_reunion?.slice(0, 10) ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Notas */}
                    <div className="md:col-span-2">
                        <label htmlFor="notas" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Notas
                        </label>
                        <textarea
                            id="notas"
                            name="notas"
                            rows={3}
                            defaultValue={oportunidad?.notas ?? ''}
                            placeholder="Observaciones sobre esta oportunidad..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-3 justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    id="btn-submit-oportunidad"
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : mode === 'create' ? 'Crear oportunidad' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
}
