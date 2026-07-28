import type { ReactNode } from 'react';
import Link from 'next/link';
import type { ItemAbandono } from '@/types';
import { SEQ, escalonAbandono, juicioAbandono, formatEur } from '@/lib/viz-palette';

/**
 * Barras horizontales: longitud = días sin contacto (magnitud continua →
 * escala secuencial de un solo hue). El juicio va en texto y en el tooltip,
 * nunca solo en el color: el par verde/naranja de la paleta de estado no
 * supera la separación CVD.
 */
export function AbandonoChart({ items }: { items: ItemAbandono[] }) {
    if (items.length === 0) {
        return (
            <Card>
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm text-slate-500 m-0">
                        No hay propuestas vivas. Nada que perseguir.
                    </p>
                </div>
            </Card>
        );
    }

    const maxDias = Math.max(...items.map(i => i.dias_sin_tocar), 1);

    return (
        <Card>
            <div className="flex flex-col gap-0.5">
                {items.map(i => (
                    <Link
                        key={i.id}
                        href={`/oportunidades/${i.id}`}
                        className="grid items-center gap-3 rounded-md px-1.5 py-1 hover:bg-slate-50 transition-colors"
                        style={{ gridTemplateColumns: 'minmax(140px,210px) 1fr auto' }}
                        title={`${i.cliente} · ${i.oportunidad}\n${i.dias_sin_tocar} días sin contacto — ${juicioAbandono(i.dias_sin_tocar)}\n${formatEur(i.importe)} en juego · ${i.toques} toques`}
                    >
                        <div className="truncate text-[12.5px] text-slate-700">
                            {i.cliente.replace('AYUNTAMIENTO ', '')}
                            <span className="text-slate-400 text-[11.5px]"> · {i.oportunidad}</span>
                        </div>
                        <div className="h-[15px] relative">
                            <div
                                className="h-full rounded-r"
                                style={{
                                    width: `${Math.max((i.dias_sin_tocar / maxDias) * 100, 0.8)}%`,
                                    background: escalonAbandono(i.dias_sin_tocar),
                                }}
                            />
                        </div>
                        <div className="text-xs text-slate-500 text-right whitespace-nowrap tabular-nums">
                            <b className="text-slate-900 font-semibold">{i.dias_sin_tocar} d</b> · {formatEur(i.importe)}
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-3.5 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-[11.5px] text-slate-500">
                <Key color={SEQ[0]} label="hasta 21 días · al día" />
                <Key color={SEQ[1]} label="22-60 · se enfría" />
                <Key color={SEQ[2]} label="61-120 · abandonada" />
                <Key color={SEQ[3]} label="más de 120 · perdida de hecho" />
            </div>
        </Card>
    );
}

function Key({ color, label }: { color: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: color }} />
            {label}
        </span>
    );
}

function Card({ children }: { children: ReactNode }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 m-0">A quién tienes abandonado</h3>
            <p className="mt-0.5 mb-4 text-[12.5px] text-slate-500">
                Días desde el último contacto real. Ordenado por lo que más tiempo lleva parado.
            </p>
            {children}
        </div>
    );
}
