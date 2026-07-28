/**
 * Paleta de visualización — validada el 28-jul-2026 contra la superficie real
 * de la app (#ffffff) con el validador de seis controles (lightness band,
 * chroma floor, separación CVD, suelo de visión normal, contraste).
 *
 * Resultados:
 *  - Diverging azul/rojo .......... ALL CHECKS PASS
 *  - Escala secuencial azul ....... magnitud continua (días sin tocar)
 *  - Estado verde/naranja ......... DESCARTADA: falla CVD protan (ΔE 5.6).
 *    El juicio se comunica en TEXTO, nunca solo con color.
 *
 * No añadir hues sueltos aquí sin volver a pasar el validador.
 */

// Escala secuencial (pasos 250/350/450/550 del ramp azul).
// Codifica magnitud: cuanto más oscuro, más días sin contacto.
export const SEQ = ['#86b6ef', '#5598e7', '#2a78d6', '#1c5cab'] as const;

// Par divergente: negativo (descuento) ↔ positivo (por encima de tarifa).
export const DIVERGING = { neg: '#e34948', pos: '#2a78d6' } as const;

export const VIZ = {
    good: '#0ca30c',
    critical: '#d03b3b',
    grid: '#e1e0d9',
    ink3: '#898781',
    brand: '#70ab37', // Pantone 376 U de Imedes — marca, no serie de datos
} as const;

/** Umbrales de la rutina de dirección: verde ≤21 d, rojo >35 d. */
export function escalonAbandono(dias: number): string {
    if (dias <= 21) return SEQ[0];
    if (dias <= 60) return SEQ[1];
    if (dias <= 120) return SEQ[2];
    return SEQ[3];
}

/** El juicio va en texto porque el color no puede llevarlo solo (CVD). */
export function juicioAbandono(dias: number): string {
    if (dias <= 21) return 'al día';
    if (dias <= 60) return 'se enfría';
    if (dias <= 120) return 'abandonada';
    return 'perdida de hecho';
}

/** Nº de propuestas cerradas por debajo del cual un porcentaje no es evidencia. */
export const MUESTRA_MINIMA = 5;

export function formatEur(n: number | null | undefined): string {
    return `${Number(n ?? 0).toLocaleString('es-ES', { maximumFractionDigits: 0 })} €`;
}
