'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createActividad } from '@/actions/actividades';
import { ACTIVIDAD_TIPO_CONFIG } from '@/lib/constants';
import { X } from 'lucide-react';

interface ActividadFormProps {
    oportunidadId?: string;
    clienteId?: string;
    onClose: () => void;
}

export function ActividadForm({ oportunidadId, clienteId, onClose }: ActividadFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        if (oportunidadId) formData.set('oportunidad_id', oportunidadId);
        if (clienteId) formData.set('cliente_id', clienteId);

        try {
            await createActividad(formData);
            onClose();
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar');
            setLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900">Registrar actividad</h4>
                <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-md text-slate-400">
                    <X className="h-4 w-4" />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* Tipo */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Tipo *</label>
                        <select
                            name="tipo"
                            required
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            {Object.entries(ACTIVIDAD_TIPO_CONFIG).map(([key, val]) => (
                                <option key={key} value={key}>{val.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Fecha *</label>
                        <input
                            name="fecha"
                            type="datetime-local"
                            required
                            defaultValue={new Date().toISOString().slice(0, 16)}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Título */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Título *</label>
                    <input
                        name="titulo"
                        type="text"
                        required
                        placeholder="Ej. Reunión de seguimiento..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {/* Descripción */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Descripción</label>
                    <textarea
                        name="descripcion"
                        rows={2}
                        placeholder="Detalla qué ocurrió en esta actividad..."
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Resultado */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Resultado</label>
                        <input
                            name="resultado"
                            type="text"
                            placeholder="¿Qué se acordó?"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    {/* Duración */}
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Duración (min)</label>
                        <input
                            name="duracion_minutos"
                            type="number"
                            min="0"
                            placeholder="60"
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                </div>

                {/* Próximos pasos */}
                <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Próximos pasos</label>
                    <input
                        name="proximos_pasos"
                        type="text"
                        placeholder="¿Qué se hará ahora?"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg p-2">{error}</p>
                )}

                <div className="flex gap-2 justify-end">
                    <button type="button" onClick={onClose} className="px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-200 rounded-lg transition-colors">
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-xs font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar actividad'}
                    </button>
                </div>
            </form>
        </div>
    );
}
