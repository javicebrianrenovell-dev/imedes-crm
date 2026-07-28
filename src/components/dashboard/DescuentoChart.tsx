import type { ItemDescuento, MotivoProducto } from '@/types';
import { DIVERGING, formatEur } from '@/lib/viz-palette';

/**
 * Barras divergentes desde el 0: polaridad (por debajo / por encima de tarifa).
 * Par azul↔rojo, el único que pasa los seis controles sobre fondo blanco.
 * Solo se pintan las propuestas que se desvían: las que salieron a tarifa
 * exacta se resumen en una frase, que es lo que de verdad hay que leer.
 */
export function DescuentoChart({ items }: { items: ItemDescuento[] }) {
    const desviadas = items.filter(i => Math.abs(i.desviacion_pct) >= 0.5);
    const aTarifa = items.length - desviadas.length;
    const maxAbs = Math.max(...desviadas.map(i => Math.abs(i.desviacion_pct)), 1);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 m-0">Dónde pierdes por descontar</h3>
            <p className="mt-0.5 mb-4 text-[12.5px] text-slate-500">
                Desviación de cada propuesta sobre el precio de catálogo.
            </p>

            {desviadas.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center">
                    <p className="text-sm text-slate-500 m-0">
                        Las {items.length} propuestas de producto salieron a tarifa exacta.
                        No hay un problema de descuento que resolver.
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex flex-col gap-0.5">
                        {desviadas.map(i => {
                            const neg = i.desviacion_pct < 0;
                            const ancho = Math.max((Math.abs(i.desviacion_pct) / maxAbs) * 50, 0.6);
                            return (
                                <div
                                    key={i.id}
                                    className="grid items-center gap-3 rounded-md px-1.5 py-1 hover:bg-slate-50"
                                    style={{ gridTemplateColumns: 'minmax(130px,190px) 1fr auto' }}
                                    title={`${i.cliente}\nOfertado ${formatEur(i.ofertado)} sobre tarifa de ${formatEur(i.tarifa)}\n${i.desviacion_pct > 0 ? '+' : ''}${i.desviacion_pct} % · ${i.resultado}`}
                                >
                                    <div className="truncate text-[12.5px] text-slate-700">{i.cliente}</div>
                                    <div
                                        className="relative h-4"
                                        style={{
                                            background:
                                                'linear-gradient(to right, transparent calc(50% - .5px), #e1e0d9 calc(50% - .5px), #e1e0d9 calc(50% + .5px), transparent calc(50% + .5px))',
                                        }}
                                    >
                                        <div
                                            className="absolute top-0.5 h-3"
                                            style={{
                                                width: `${ancho}%`,
                                                background: neg ? DIVERGING.neg : DIVERGING.pos,
                                                ...(neg
                                                    ? { right: '50%', borderRadius: '4px 0 0 4px' }
                                                    : { left: '50%', borderRadius: '0 4px 4px 0' }),
                                            }}
                                        />
                                    </div>
                                    <div className="text-xs text-right tabular-nums text-slate-900 font-semibold whitespace-nowrap">
                                        {i.desviacion_pct > 0 ? '+' : ''}{i.desviacion_pct} %
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {aTarifa > 0 && (
                        <p className="mt-3.5 mb-0 text-[12.5px] text-slate-600">
                            Las otras <strong className="text-slate-900">{aTarifa} propuestas salieron a tarifa exacta</strong>.
                        </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 border-t border-slate-100 pt-3 text-[11.5px] text-slate-500">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: DIVERGING.neg }} />
                            por debajo de tarifa
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: DIVERGING.pos }} />
                            por encima
                        </span>
                    </div>
                </>
            )}
        </div>
    );
}

const MOTIVO_TEXTO: Record<string, string> = {
    PRECIO: 'les parece caro',
    MOMENTO: 'no es el momento',
    NO_LO_ENTIENDEN: 'no entienden la propuesta',
    SIN_PRESUPUESTO: 'no hay presupuesto',
    COMPETENCIA: 'se lo lleva otro',
    CAMBIO_INTERLOCUTOR: 'cambió el interlocutor',
    SIN_RESPUESTA: 'nunca contestaron',
    OTRO: 'otro motivo',
};

/** Con menos de 5 rechazos no hay patrón: se dice, en vez de dibujar una barra sola. */
export function MotivosBlock({ motivos }: { motivos: MotivoProducto[] }) {
    const total = motivos.reduce((s, m) => s + m.n, 0);

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900 m-0">Qué producto arreglar o jubilar</h3>
            <p className="mt-0.5 mb-4 text-[12.5px] text-slate-500">
                Motivos de rechazo cruzados con producto.
            </p>

            {total < 5 ? (
                <div className="rounded-lg border border-dashed border-slate-300 p-5 text-center">
                    <div className="text-[15px] font-semibold text-slate-800 mb-1.5">
                        {total === 0
                            ? 'Ningún rechazo registrado todavía'
                            : `${total} ${total === 1 ? 'rechazo registrado' : 'rechazos registrados'} en todo el catálogo`}
                    </div>
                    <p className="mx-auto max-w-[60ch] text-[13px] text-slate-500 m-0">
                        {total === 0
                            ? 'Este bloque se llena solo según vayan contestando. Cada «no» que registres con su motivo es lo que te dirá qué corregir del producto.'
                            : <>
                                {motivos.map(m => (
                                    <span key={`${m.producto}-${m.motivo_rechazo}`}>
                                        {MOTIVO_TEXTO[m.motivo_rechazo] ?? m.motivo_rechazo} ({m.n}){' '}
                                    </span>
                                ))}
                                — con menos de 5 rechazos no hay patrón. Se lee en cualitativo, no en porcentaje.
                            </>}
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-0.5">
                    {motivos.map(m => (
                        <div
                            key={`${m.producto}-${m.motivo_rechazo}`}
                            className="grid items-center gap-3 rounded-md px-1.5 py-1 hover:bg-slate-50"
                            style={{ gridTemplateColumns: 'minmax(130px,190px) 1fr auto' }}
                            title={`${m.producto}\n${MOTIVO_TEXTO[m.motivo_rechazo] ?? m.motivo_rechazo}\n${formatEur(m.importe_perdido)} perdidos`}
                        >
                            <div className="truncate text-[12.5px] text-slate-700">
                                {MOTIVO_TEXTO[m.motivo_rechazo] ?? m.motivo_rechazo}
                            </div>
                            <div className="h-[15px]">
                                <div
                                    className="h-full rounded-r"
                                    style={{
                                        width: `${(m.n / Math.max(...motivos.map(x => x.n))) * 100}%`,
                                        background: DIVERGING.neg,
                                    }}
                                />
                            </div>
                            <div className="text-xs text-right tabular-nums text-slate-500 whitespace-nowrap">
                                <b className="text-slate-900 font-semibold">{m.n}</b> · {formatEur(m.importe_perdido)}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
