import type { ReactNode } from 'react';
import type { ItemAbandono, ItemDescuento, RendimientoProducto, Pulso } from '@/types';
import { VIZ, formatEur } from '@/lib/viz-palette';

const OBJETIVO_TOQUES = 25;
const UMBRAL_ABANDONO = 60;   // días: a partir de aquí la propuesta está de hecho parada
const UMBRAL_DESVIACION = 0.5; // % — por debajo de esto, la propuesta salió a tarifa

/**
 * El cuadro no solo muestra: concluye. Cada punto se deriva de los datos, no es
 * texto fijo — si mañana el pipeline cambia, la lectura cambia con él.
 * Se ordenan por urgencia y se muestran como mucho cuatro.
 */
export function LecturaBlock({
    pulso, abandono, descuento, productos,
}: {
    pulso: Pulso;
    abandono: ItemAbandono[];
    descuento: ItemDescuento[];
    productos: RendimientoProducto[];
}) {
    const puntos: ReactNode[] = [];

    // 1 · Lo que lleva más tiempo parado, y cuánto dinero es
    const paradas = abandono.filter(a => a.dias_sin_tocar > UMBRAL_ABANDONO);
    if (paradas.length > 0) {
        const top = paradas.slice(0, 4);
        const suma = top.reduce((s, a) => s + Number(a.importe), 0);
        const nombres = Array.from(new Set(top.map(a => a.cliente.replace('AYUNTAMIENTO ', ''))));
        puntos.push(
            <>
                <strong>{listar(nombres)} concentran {formatEur(suma)} y llevan entre{' '}
                    {Math.round(Math.min(...top.map(t => t.dias_sin_tocar)) / 30)} y{' '}
                    {Math.round(Math.max(...top.map(t => t.dias_sin_tocar)) / 30)} meses sin un solo toque.</strong>{' '}
                Una llamada las resuelve o las entierra, y cualquiera de las dos cosas es mejor que esto.
            </>
        );
    }

    // 2 · ¿El precio es el problema, o no lo es?
    if (descuento.length >= 5) {
        const desviadas = descuento.filter(d => Math.abs(d.desviacion_pct) >= UMBRAL_DESVIACION);
        const aTarifa = descuento.length - desviadas.length;
        if (aTarifa / descuento.length >= 0.8) {
            puntos.push(
                <>
                    <strong>No tienes un problema de precio.</strong> De {descuento.length} propuestas de
                    producto, {aTarifa} salieron a tarifa exacta
                    {desviadas.length > 0 && <> y la mayor excepción es {desviadas[0].cliente} ({desviadas[0].desviacion_pct} %)</>}.
                    Tu fuga está en el seguimiento, no en la tarifa.
                </>
            );
        } else {
            const media = desviadas.reduce((s, d) => s + d.desviacion_pct, 0) / desviadas.length;
            puntos.push(
                <>
                    <strong>Estás descontando de forma sistemática:</strong> {desviadas.length} de{' '}
                    {descuento.length} propuestas salen fuera de tarifa, con una media del{' '}
                    {media.toFixed(1)} %. O el precio de catálogo está mal puesto, o se está regalando margen.
                </>
            );
        }
    }

    // 3 · El producto con más esfuerzo invertido y menos respuesta
    const enElAire = productos
        .filter(p => p.esperando_respuesta >= 3)
        .sort((a, b) => b.importe_en_juego - a.importe_en_juego)[0];
    if (enElAire) {
        puntos.push(
            <>
                <strong>{enElAire.producto} es tu apuesta y está en el aire:</strong>{' '}
                {formatEur(enElAire.importe_en_juego)} en {enElAire.propuestas} propuestas, de las cuales{' '}
                {enElAire.esperando_respuesta} siguen esperando respuesta y solo {enElAire.cerradas} se ha cerrado.
                Es el producto con más propuestas y menos respuestas.
            </>
        );
    }

    // 4 · La causa de la que cuelga todo lo demás
    if (pulso.toques_7dias < 15) {
        puntos.push(
            <>
                <strong>{pulso.toques_7dias === 1 ? 'Un toque' : `${pulso.toques_7dias} toques`} en siete días
                    contra un objetivo de {OBJETIVO_TOQUES}.</strong> Ningún gráfico de este cuadro va a mejorar
                mientras ese número siga ahí. Es la causa; todo lo demás es consecuencia.
            </>
        );
    }

    if (puntos.length === 0) return null;

    return (
        <div
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            style={{ borderLeftWidth: 3, borderLeftColor: VIZ.brand }}
        >
            <h3 className="text-base font-semibold text-slate-900 m-0 mb-3">Qué haría yo el lunes</h3>
            <ol className="m-0 pl-5 space-y-2.5">
                {puntos.slice(0, 4).map((p, idx) => (
                    <li key={idx} className="text-[13.5px] text-slate-600 marker:text-slate-400">
                        {p}
                    </li>
                ))}
            </ol>
        </div>
    );
}

function listar(xs: string[]): string {
    if (xs.length === 1) return xs[0];
    return `${xs.slice(0, -1).join(', ')} y ${xs[xs.length - 1]}`;
}
