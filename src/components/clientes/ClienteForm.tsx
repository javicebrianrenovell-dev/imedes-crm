'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Cliente } from '@/types';
import { createCliente, updateCliente } from '@/actions/clientes';

interface ClienteFormProps {
    cliente?: Cliente;
    mode?: 'create' | 'edit';
}

export function ClienteForm({ cliente, mode = 'create' }: ClienteFormProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);

        try {
            if (mode === 'edit' && cliente) {
                await updateCliente(cliente.id, formData);
            } else {
                await createCliente(formData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-5">Datos del cliente</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre */}
                    <div className="md:col-span-2">
                        <label htmlFor="nombre" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Nombre <span className="text-red-500">*</span>
                        </label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            required
                            defaultValue={cliente?.nombre ?? ''}
                            placeholder="Ej. Ayuntamiento de Valencia"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Sector */}
                    <div>
                        <label htmlFor="sector" className="block text-sm font-medium text-slate-700 mb-1.5">
                            Sector <span className="text-red-500">*</span>
                        </label>
                        <select
                            id="sector"
                            name="sector"
                            required
                            defaultValue={cliente?.sector ?? 'PÚBLICO'}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            <option value="PÚBLICO">Público</option>
                            <option value="PRIVADO">Privado</option>
                        </select>
                    </div>

                    {/* Tipo */}
                    <div>
                        <label htmlFor="tipo" className="block text-sm font-medium text-slate-700 mb-1.5">Tipo</label>
                        <input
                            id="tipo"
                            name="tipo"
                            type="text"
                            defaultValue={cliente?.tipo ?? ''}
                            placeholder="Ayuntamiento, Consorcio, Empresa..."
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Provincia */}
                    <div>
                        <label htmlFor="provincia" className="block text-sm font-medium text-slate-700 mb-1.5">Provincia</label>
                        <input
                            id="provincia"
                            name="provincia"
                            type="text"
                            defaultValue={cliente?.provincia ?? 'Valencia'}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Comunidad */}
                    <div>
                        <label htmlFor="comunidad" className="block text-sm font-medium text-slate-700 mb-1.5">Comunidad</label>
                        <input
                            id="comunidad"
                            name="comunidad"
                            type="text"
                            defaultValue={cliente?.comunidad ?? 'Comunitat Valenciana'}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>
            </div>

            {/* Contacto */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                <h3 className="text-sm font-semibold text-slate-900 mb-5">Datos de contacto</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label htmlFor="contacto_nombre" className="block text-sm font-medium text-slate-700 mb-1.5">Nombre contacto</label>
                        <input
                            id="contacto_nombre"
                            name="contacto_nombre"
                            type="text"
                            defaultValue={cliente?.contacto_nombre ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="contacto_cargo" className="block text-sm font-medium text-slate-700 mb-1.5">Cargo</label>
                        <input
                            id="contacto_cargo"
                            name="contacto_cargo"
                            type="text"
                            defaultValue={cliente?.contacto_cargo ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="contacto_email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                        <input
                            id="contacto_email"
                            name="contacto_email"
                            type="email"
                            defaultValue={cliente?.contacto_email ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="contacto_telefono" className="block text-sm font-medium text-slate-700 mb-1.5">Teléfono</label>
                        <input
                            id="contacto_telefono"
                            name="contacto_telefono"
                            type="tel"
                            defaultValue={cliente?.contacto_telefono ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="notas" className="block text-sm font-medium text-slate-700 mb-1.5">Notas</label>
                        <textarea
                            id="notas"
                            name="notas"
                            rows={3}
                            defaultValue={cliente?.notas ?? ''}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        />
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
            )}

            <div className="flex gap-3 justify-end">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    id="btn-submit-cliente"
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : mode === 'create' ? 'Crear cliente' : 'Guardar cambios'}
                </button>
            </div>
        </form>
    );
}
