'use client';

import { useState } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCenter,
    useSensor,
    useSensors,
    PointerSensor,
    type DragEndEvent,
    type DragStartEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Oportunidad, Situacion } from '@/types';
import { OportunidadCard } from './OportunidadCard';
import { KANBAN_SITUACIONES, SITUACION_CONFIG } from '@/lib/constants';
import { updateSituacion } from '@/actions/oportunidades';
import { useRouter } from 'next/navigation';

interface OportunidadKanbanProps {
    oportunidades: Oportunidad[];
}

function KanbanColumn({ situacion, oportunidades }: { situacion: Situacion; oportunidades: Oportunidad[] }) {
    const config = SITUACION_CONFIG[situacion];
    const ids = oportunidades.map(o => o.id);
    const totalImporte = oportunidades.reduce((sum, o) => sum + Number(o.presupuesto ?? 0), 0);
    const formatK = (n: number) => n === 0 ? '' : n >= 1000 ? `${(n / 1000).toFixed(0)}k €` : `${n} €`;

    return (
        <div className="flex flex-col min-w-[240px] w-64 flex-shrink-0">
            {/* Header */}
            <div
                className="flex items-start justify-between px-3 py-2.5 rounded-t-xl"
                style={{ backgroundColor: config.color }}
            >
                <div className="min-w-0">
                    <span className="text-xs font-bold text-white truncate block leading-snug">{config.label}</span>
                    {totalImporte > 0 && (
                        <span className="text-[10px] text-white/80 leading-none">{formatK(totalImporte)}</span>
                    )}
                </div>
                <span className="flex-shrink-0 ml-2 text-xs bg-white/25 rounded-full px-2 py-0.5 font-bold text-white">
                    {oportunidades.length}
                </span>
            </div>

            {/* Cards */}
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
                <div
                    className="flex flex-col gap-2 p-2 min-h-[200px] rounded-b-xl flex-1"
                    style={{ backgroundColor: config.bgColor }}
                    data-situacion={situacion}
                >
                    {oportunidades.map(op => (
                        <SortableCard key={op.id} oportunidad={op} />
                    ))}
                    {oportunidades.length === 0 && (
                        <div className="flex items-center justify-center h-16 rounded-lg border-2 border-dashed border-slate-200 text-xs text-slate-400">
                            Arrastra aquí
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

function SortableCard({ oportunidad }: { oportunidad: Oportunidad }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: oportunidad.id,
        data: { situacion: oportunidad.situacion },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <OportunidadCard oportunidad={oportunidad} isDragging={isDragging} />
        </div>
    );
}

export function OportunidadKanban({ oportunidades }: OportunidadKanbanProps) {
    const router = useRouter();
    const [items, setItems] = useState<Oportunidad[]>(oportunidades);
    const [activeId, setActiveId] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
    );

    const grouped = KANBAN_SITUACIONES.reduce((acc, sit) => {
        acc[sit] = items.filter(o => o.situacion === sit);
        return acc;
    }, {} as Record<Situacion, Oportunidad[]>);

    const activeOp = activeId ? items.find(o => o.id === activeId) : null;

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over || active.id === over.id) return;

        // Encontrar situación destino
        const overId = over.id as string;
        const destSituacion = KANBAN_SITUACIONES.find(sit =>
            items.filter(o => o.situacion === sit).some(o => o.id === overId)
        ) ?? (KANBAN_SITUACIONES.includes(overId as Situacion) ? overId as Situacion : null);

        if (!destSituacion) return;

        const sourceOp = items.find(o => o.id === active.id);
        if (!sourceOp || sourceOp.situacion === destSituacion) return;

        // Optimistic update
        setItems(prev => prev.map(o =>
            o.id === active.id ? { ...o, situacion: destSituacion } : o
        ));

        try {
            await updateSituacion(active.id as string, destSituacion);
            router.refresh();
        } catch {
            // Revertir en caso de error
            setItems(oportunidades);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
                {KANBAN_SITUACIONES.map(sit => (
                    <KanbanColumn
                        key={sit}
                        situacion={sit}
                        oportunidades={grouped[sit] ?? []}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeOp && <OportunidadCard oportunidad={activeOp} isDragging />}
            </DragOverlay>
        </DndContext>
    );
}
