import type { ReactNode } from 'react';
import type { RendimientoProducto } from '@/types';
import { SEQ, MUESTRA_MINIMA, formatEur } from '@/lib/viz-palette';

const NOMBRES: Record<string, string> = {
    'conecta-mayores-privado': 'Conecta empresas',
    'conecta-mayores-municipal': 'Conecta ayto.',
    'campanya-municipal-14500': 'Se Nota',
    'campanya-ambiental-25000': 'Campañas ambientales',
    'catalogo-campanas': 'Catálogo campañas',
    'recogida-a-la-carta': 'Recogida a la Carta',
    'diagnostico-poligonos': 'Diagnóstico polígonos',
    'areas-industriales': 'Áreas industriales',
    'nou-bim': 'Nou BIM',
    'visor-dana': 'Visor DANA',
};

/**
 * Tabla, no gráfico: con muestras de una o dos propuestas cerradas, un gráfico
 * de barras de «tasa de cierre» miente por omisión. La columna de muestra dice
 * cuánto falta para que el porcentaje signifique algo.
 */
export function ProductoTable({ filas }: { filas: RendimientoProducto[] }) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 m-0">Qué producto empujar</h3>
            <p className="mt-0.5 mb-4 text-[12.5px] text-slate-500">
                Tasa de cierre sobre propuestas <em>cerradas</em>, no sobre enviadas.
                La columna «muestra» dice cuánto te puedes fiar.
            </p>

            {filas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm text-slate-500 m-0">
                        Ninguna propuesta clasificada como producto todavía.
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-[13px] border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200">
                                <Th>Producto</Th>
                                <Th num>Prop.</Th>
                                <Th num>Cerr.</Th>
                                <Th num>Cierre</Th>
                                <Th>Muestra</Th>
                                <Th num>En juego</Th>
                            </tr>
                        </thead>
                        <tbody>
                            {filas.map(f => (
                                <tr key={f.producto} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="py-2.5 pr-2.5 font-semibold text-slate-800">
                                        {NOMBRES[f.producto] ?? f.producto}
                                    </td>
                                    <td className="py-2.5 pr-2.5 text-right tabular-nums text-slate-600">{f.propuestas}</td>
                                    <td className="py-2.5 pr-2.5 text-right tabular-nums text-slate-600">{f.cerradas}</td>
                                    <td className="py-2.5 pr-2.5 text-right tabular-nums text-slate-800">
                                        {f.tasa_aceptacion_pct === null
                                            ? <span className="text-slate-400">sin datos</span>
                                            : `${Math.round(f.tasa_aceptacion_pct)} %`}
                                    </td>
                                    <td className="py-2.5 pr-2.5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-11 h-1.5 rounded-full bg-slate-200 overflow-hidden shrink-0">
                                                <div
                                                    className="h-full rounded-full"
                                                    style={{
                                                        width: `${Math.min((f.cerradas / MUESTRA_MINIMA) * 100, 100)}%`,
                                                        background: SEQ[2],
                                                    }}
                                                />
                                            </div>
                                            <span className="text-slate-400 text-xs tabular-nums">
                                                {f.cerradas}/{MUESTRA_MINIMA}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-2.5 text-right tabular-nums text-slate-600">
                                        {formatEur(f.importe_en_juego)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function Th({ children, num }: { children: ReactNode; num?: boolean }) {
    return (
        <th className={`pb-2 pr-2.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 ${num ? 'text-right' : 'text-left'}`}>
            {children}
        </th>
    );
}
