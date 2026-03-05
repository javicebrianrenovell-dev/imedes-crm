// scripts/seed-from-excel.ts
// Ejecutar con: npx ts-node --project tsconfig.json scripts/seed-from-excel.ts

import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as xlsx from 'xlsx';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://crm-imedes-supabase-841299-72-60-214-52.traefik.me';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

const RESPONSABLE_MAP: Record<string, string> = {
    'Javi': 'Javi',
    'Emèrit': 'Emèrit',
    'Kike': 'Kike',
    'Eva': 'Eva',
    'Andrea': 'Andrea',
};

const SITUACION_MAP: Record<string, string> = {
    'EN PREVISION': 'EN_PREVISION',
    'EN PREVISIÓN': 'EN_PREVISION',
    'PENDIENTE AGENDAR': 'PENDIENTE_AGENDAR',
    'PENDIENTE REUNION': 'PENDIENTE_REUNION',
    'PENDIENTE REUNIÓN': 'PENDIENTE_REUNION',
    'PENDIENTE PROPUESTA': 'PENDIENTE_PROPUESTA',
    'PENDIENTE LICITACION': 'PENDIENTE_LICITACION',
    'PENDIENTE LICITACIÓN': 'PENDIENTE_LICITACION',
    'PENDIENTE LICITACIÖN': 'PENDIENTE_LICITACION',
    'PROPUESTA PRESENTADA': 'PROPUESTA_PRESENTADA',
    'PROPUESTA EN EJECUCION': 'PROPUESTA_EN_EJECUCION',
    'PROPUESTA EN EJECUCIÓN': 'PROPUESTA_EN_EJECUCION',
    'PROPUESTA GANADA': 'PROPUESTA_GANADA',
    'PROPUESTA PERDIDA': 'PROPUESTA_PERDIDA',
    'DESCARTADA': 'DESCARTADA',
};

const SECTOR_MAP: Record<string, string> = {
    'PUBLICO': 'PÚBLICO',
    'PÚBLICO': 'PÚBLICO',
    'PRIVADO': 'PRIVADO',
};

function parseExcelDate(serial: any): string | undefined {
    if (!serial || typeof serial !== 'number') return undefined;
    const date = new Date(Math.round((serial - 25569) * 86400 * 1000));
    return date.toISOString().split('T')[0];
}

async function normalizeArea(area: string | undefined): Promise<string> {
    if (!area) return 'CONSULTORÍA';
    const map: Record<string, string> = {
        'CONSULTORIA': 'CONSULTORÍA',
        'CONSULTORÍA': 'CONSULTORÍA',
        'COMUNICACION': 'COMUNICACIÓN',
        'COMUNICACIÓN': 'COMUNICACIÓN',
        'EA': 'EA',
    };
    return map[area.toUpperCase()] ?? 'CONSULTORÍA';
}

async function main() {
    console.log('🌱 Iniciando seed interactivo desde Excel real...\n');

    const excelPath = path.resolve(process.cwd(), '../DESARROLLO NEGOCIO 2026 IMEDES.xlsx');
    console.log(`Leyendo fichero: ${excelPath}`);

    let rb;
    try {
        rb = xlsx.readFile(excelPath);
    } catch (e) {
        console.error('❌ No se encuentra el archivo Excel. Asegúrate de estar en imedes-crm y que el archivo está un nivel arriba.');
        process.exit(1);
    }

    const sheet = rb.Sheets[rb.SheetNames[0]];
    // row[0] es el título "DESARRROLLO NEGOCIO 2026", row[1] son cabeceras reales.
    const rows = xlsx.utils.sheet_to_json<any[]>(sheet, { header: 1 });

    // Obtener responsables
    const { data: responsablesDB } = await supabase.from('responsables').select('*');
    const responsablesByName = Object.fromEntries(
        (responsablesDB ?? []).map(r => [r.nombre.toLowerCase(), r.id])
    );

    let clientesCreados = 0;
    let oportunidadesCreadas = 0;
    let errores = 0;

    // Saltar row[0] y row[1]
    for (let i = 2; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const sectorRaw = String(row[0] || '').trim();
        const clienteRaw = String(row[1] || '').trim();
        const respoRaw = String(row[2] || '').trim();

        if (!clienteRaw || clienteRaw === 'undefined') continue; // Fila vacía o inútil

        const sector = SECTOR_MAP[sectorRaw.toUpperCase()] ?? 'PÚBLICO';

        // Crear o encontrar cliente
        const { data: existingCliente } = await supabase
            .from('clientes')
            .select('id')
            .eq('nombre', clienteRaw)
            .single();

        let clienteId: string;
        if (existingCliente) {
            clienteId = existingCliente.id;
        } else {
            const { data: newCliente, error: clienteError } = await supabase
                .from('clientes')
                .insert({ nombre: clienteRaw, sector, provincia: 'Valencia', comunidad: 'Comunitat Valenciana' })
                .select('id')
                .single();

            if (clienteError || !newCliente) {
                console.error(`❌ Error creando cliente "${clienteRaw}":`, clienteError?.message);
                errores++;
                continue;
            }
            clienteId = newCliente.id;
            clientesCreados++;
            console.log(`✅ Cliente registrado: ${clienteRaw}`);
        }

        const responsableId = responsablesByName[respoRaw.toLowerCase()];

        // Leer los hasta 3 proyectos (offsets: P1=3, P2=9, P3=15)
        for (const offset of [3, 9, 15]) {
            const nombre = typeof row[offset] === 'string' ? row[offset].trim() : undefined;
            if (!nombre) continue;

            const areaRaw = typeof row[offset + 1] === 'string' ? row[offset + 1] : undefined;
            const presuRaw = row[offset + 2];
            const presu = typeof presuRaw === 'number' ? presuRaw : undefined;
            const sitRaw = typeof row[offset + 3] === 'string' ? row[offset + 3].trim() : undefined;
            const durRaw = row[offset + 4];
            const dprRaw = row[offset + 5];

            const sitNorm = SITUACION_MAP[sitRaw?.toUpperCase() ?? ''] ?? 'EN_PREVISION';
            const areaNorm = await normalizeArea(areaRaw);

            const opPayload: any = {
                cliente_id: clienteId,
                responsable_id: responsableId ?? null,
                nombre,
                area: areaNorm,
                situacion: sitNorm,
                presupuesto: presu,
            };

            const fUltima = parseExcelDate(durRaw);
            if (fUltima) opPayload.fecha_ultima_reunion = fUltima;

            const fProxima = parseExcelDate(dprRaw);
            if (fProxima) opPayload.fecha_proxima_reunion = fProxima;

            const { error: opError } = await supabase.from('oportunidades').insert(opPayload);

            if (opError) {
                console.error(`  ❌ Error en op "${nombre}":`, opError.message);
                errores++;
            } else {
                oportunidadesCreadas++;
                console.log(`  ➕ Proyecto: ${nombre} (${sitNorm})`);
            }
        }
    }

    console.log(`\n📊 Resumen de Importación de Excel 📊`);
    console.log(`Clientes creados/verificados: ${clientesCreados} (de ${rows.length - 2} procesados)`);
    console.log(`Oportunidades únicas creadas: ${oportunidadesCreadas}`);
    console.log(`Errores encontrados: ${errores}\n`);
}

main().catch(console.error);
