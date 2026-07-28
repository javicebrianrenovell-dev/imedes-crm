import type { Pulso } from '@/types';
import { VIZ, MUESTRA_MINIMA, formatEur } from '@/lib/viz-palette';

// Objetivo de toques semanales fijado en rutina-direccion.md (verde >=25).
const OBJETIVO_TOQUES = 25;

export function PulsoTiles({ pulso }: { pulso: Pulso }) {
    const alarmaAbandono = pulso.abandonadas > 0;
    const alarmaToques = pulso.toques_7dias < 15;
    const fichasOk = pulso.fichas_incompletas === 0;

    return (
        <div className="space-y-4">
            {/* El cuadro declara su propia fiabilidad antes de enseñar un solo número */}
            {pulso.cerradas_producto < MUESTRA_MINIMA && (
                <div
                    className="flex gap-2.5 items-start rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm"
                    style={{ borderLeftWidth: 3, borderLeftColor: VIZ.critical }}
                >
                    <span className="text-base leading-5" aria-hidden="true">⚠</span>
                    <p className="text-[13px] text-slate-600 m-0">
                        <strong className="text-slate-900">
                            Este cuadro todavía no puede decirte qué producto funciona.
                        </strong>{' '}
                        Solo hay {pulso.cerradas_producto === 1
                            ? '1 propuesta cerrada'
                            : `${pulso.cerradas_producto} propuestas cerradas`}{' '}
                        en todo el catálogo; hacen falta {MUESTRA_MINIMA} por producto para que un
                        porcentaje sea evidencia y no anécdota. Lo que sí puede decirte, con total
                        solidez, es <strong className="text-slate-900">a quién tienes abandonado</strong>.
                    </p>
                </div>
            )}

            <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Tile
                    label="Propuestas vivas"
                    value={String(pulso.propuestas_vivas)}
                    foot={`${formatEur(pulso.pipeline)} en juego`}
                />
                <Tile
                    label="Dinero parado"
                    value={formatEur(pulso.importe_abandonado)}
                    foot={`${pulso.abandonadas} propuestas sin tocar más de 35 días`}
                    alarm={alarmaAbandono}
                />
                <Tile
                    label="Toques esta semana"
                    value={String(pulso.toques_7dias)}
                    foot={`el objetivo de la rutina son ${OBJETIVO_TOQUES}`}
                    alarm={alarmaToques}
                />
                <Tile
                    label="Fichas incompletas"
                    value={String(pulso.fichas_incompletas)}
                    foot={fichasOk ? 'todas clasificadas y con próxima acción' : 'les falta algo para poder medir'}
                    good={fichasOk}
                />
            </div>
        </div>
    );
}

function Tile({
    label, value, foot, alarm, good,
}: { label: string; value: string; foot: string; alarm?: boolean; good?: boolean }) {
    return (
        <div
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            style={alarm ? { borderLeftWidth: 3, borderLeftColor: VIZ.critical } : undefined}
        >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
            <div
                className="mt-1.5 text-3xl font-semibold tracking-tight leading-none"
                style={{ color: alarm ? VIZ.critical : good ? VIZ.good : undefined }}
            >
                {value}
            </div>
            <div className="mt-1 text-xs text-slate-500">{foot}</div>
        </div>
    );
}
