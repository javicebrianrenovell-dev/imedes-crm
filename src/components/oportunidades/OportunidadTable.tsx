'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MoreHorizontal, Eye, Pencil, Trash2, Archive, Plus, ChevronDown, Activity } from 'lucide-react';
import type { Oportunidad, Situacion } from '@/types';
import { SituacionBadge } from './SituacionBadge';
import { ResponsableAvatar } from '@/components/shared/ResponsableAvatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { ActividadForm } from '@/components/actividades/ActividadForm';
import { formatCurrency, formatDate } from '@/lib/utils';
import { AREA_CONFIG, SITUACION_CONFIG, FUNNEL_ORDER } from '@/lib/constants';
import { deleteOportunidad, archivarOportunidad, updateSituacion } from '@/actions/oportunidades';
import { useToast } from '@/components/shared/Toast';
import Link from 'next/link';

const ALL_SITUACIONES = [...FUNNEL_ORDER, 'PROPUESTA_PERDIDA', 'DESCARTADA'] as Situacion[];

interface OportunidadTableProps {
    oportunidades: Oportunidad[];
    total: number;
    page: number;
    perPage: number;
}

export function OportunidadTable({ oportunidades, total, page, perPage }: OportunidadTableProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [statusMenuId, setStatusMenuId] = useState<string | null>(null);
    const [activityFormId, setActivityFormId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const totalPages = Math.ceil(total / perPage);

    const handleDelete = async () => {
        if (!deleteId) return;
        setLoading(true);
        await deleteOportunidad(deleteId);
        setDeleteId(null);
        setLoading(false);
        toast('Oportunidad eliminada', 'success');
        router.refresh();
    };

    const handleArchivar = async (id: string) => {
        setOpenMenuId(null);
        await archivarOportunidad(id);
        toast('Oportunidad archivada', 'success');
        router.refresh();
    };

    const handleStatusChange = async (id: string, situacion: Situacion) => {
        setStatusMenuId(null);
        await updateSituacion(id, situacion);
        toast(`Situación actualizada: ${SITUACION_CONFIG[situacion]?.label}`, 'success');
        router.refresh();
    };

    if (oportunidades.length === 0) {
        return (
            <EmptyState
                title="Sin oportunidades"
                description="No hay oportunidades que coincidan con los filtros actuales"
                action={
                    <Link
                        href="/oportunidades/nueva"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Nueva oportunidad
                    </Link>
                }
            />
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Cliente</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Proyecto</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Área</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Responsable</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Presupuesto</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Situación</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Próx. Reunión</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {oportunidades.map((op) => {
                                const areaConfig = AREA_CONFIG[op.area];
                                return (
                                    <React.Fragment key={op.id}>
                                    <tr className="table-row-hover">
                                        <td className="px-4 py-3">
                                            <p className="text-xs text-slate-500 max-w-[140px] truncate">
                                                {op.cliente?.nombre ?? '—'}
                                            </p>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/oportunidades/${op.id}`}
                                                className="font-medium text-slate-900 hover:text-green-700 max-w-[200px] truncate block transition-colors"
                                            >
                                                {op.nombre}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span
                                                className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
                                                style={{ backgroundColor: areaConfig?.bgColor, color: areaConfig?.color }}
                                            >
                                                {areaConfig?.label ?? op.area}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {op.responsable ? (
                                                <ResponsableAvatar
                                                    nombre={op.responsable.nombre}
                                                    color={op.responsable.color}
                                                    showName
                                                />
                                            ) : (
                                                <span className="text-slate-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-900">
                                            {formatCurrency(op.presupuesto)}
                                        </td>
                                                        <td className="px-4 py-3">
                                            {/* Inline status edit */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setStatusMenuId(statusMenuId === op.id ? null : op.id)}
                                                    className="flex items-center gap-1 group"
                                                    title="Cambiar situación"
                                                >
                                                    <SituacionBadge situacion={op.situacion} size="sm" />
                                                    <ChevronDown className="h-3 w-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </button>
                                                {statusMenuId === op.id && (
                                                    <>
                                                        <div className="fixed inset-0 z-10" onClick={() => setStatusMenuId(null)} />
                                                        <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-slate-200 bg-white shadow-xl z-20 py-1.5 animate-in-up max-h-72 overflow-y-auto">
                                                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide px-3 py-1">Cambiar a</p>
                                                            {ALL_SITUACIONES.map(sit => {
                                                                const cfg = SITUACION_CONFIG[sit];
                                                                return (
                                                                    <button
                                                                        key={sit}
                                                                        onClick={() => handleStatusChange(op.id, sit)}
                                                                        className={`flex w-full items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-left ${sit === op.situacion ? 'bg-slate-50' : ''}`}
                                                                    >
                                                                        <span
                                                                            className="w-2 h-2 rounded-full flex-shrink-0"
                                                                            style={{ backgroundColor: cfg?.color }}
                                                                        />
                                                                        <span className="text-xs text-slate-700">{cfg?.label ?? sit}</span>
                                                                        {sit === op.situacion && <span className="ml-auto text-[10px] text-slate-400">actual</span>}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-slate-500">
                                            {formatDate(op.fecha_proxima_reunion)}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1">
                                                {/* Quick activity */}
                                                <button
                                                    title="Registrar actividad"
                                                    onClick={() => setActivityFormId(activityFormId === op.id ? null : op.id)}
                                                    className="p-1.5 rounded-md hover:bg-green-50 text-slate-400 hover:text-green-600 transition-colors"
                                                >
                                                    <Activity className="h-3.5 w-3.5" />
                                                </button>
                                                {/* Actions menu */}
                                                <div className="relative">
                                                    <button
                                                        id={`menu-${op.id}`}
                                                        onClick={() => setOpenMenuId(openMenuId === op.id ? null : op.id)}
                                                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </button>
                                                    {openMenuId === op.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                            <div className="absolute right-0 top-full mt-1 w-44 rounded-xl border border-slate-200 bg-white shadow-lg z-20 py-1 text-sm animate-in-up">
                                                                <Link
                                                                    href={`/oportunidades/${op.id}`}
                                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" /> Ver detalle
                                                                </Link>
                                                                <Link
                                                                    href={`/oportunidades/${op.id}/editar`}
                                                                    className="flex items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                                                                    onClick={() => setOpenMenuId(null)}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" /> Editar
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleArchivar(op.id)}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 hover:bg-slate-50 text-slate-700"
                                                                >
                                                                    <Archive className="h-3.5 w-3.5" /> Archivar
                                                                </button>
                                                                <div className="h-px bg-slate-100 my-1" />
                                                                <button
                                                                    onClick={() => { setDeleteId(op.id); setOpenMenuId(null); }}
                                                                    className="flex w-full items-center gap-2 px-3 py-2 hover:bg-red-50 text-red-600"
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" /> Eliminar
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {activityFormId === op.id && (
                                        <tr>
                                            <td colSpan={8} className="px-4 pb-3 bg-slate-50/80">
                                                <ActividadForm
                                                    oportunidadId={op.id}
                                                    onClose={() => setActivityFormId(null)}
                                                />
                                            </td>
                                        </tr>
                                    )}
                                    </React.Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                            {Math.min((page - 1) * perPage + 1, total)}–{Math.min(page * perPage, total)} de {total}
                        </p>
                        <div className="flex gap-1">
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const p = i + 1;
                                return (
                                    <Link
                                        key={p}
                                        href={`?page=${p}&perPage=${perPage}`}
                                        className={`w-7 h-7 flex items-center justify-center rounded-md text-xs font-medium transition-colors ${p === page
                                                ? 'bg-slate-900 text-white'
                                                : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                    >
                                        {p}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmDialog
                open={!!deleteId}
                title="¿Eliminar oportunidad?"
                description="Esta acción no se puede deshacer. Se eliminarán también todas las actividades asociadas."
                confirmLabel="Eliminar"
                onConfirm={handleDelete}
                onCancel={() => setDeleteId(null)}
                loading={loading}
            />
        </>
    );
}
