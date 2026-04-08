/**
 * seed-users.ts — Creación masiva de usuarios Auth para el equipo IMEDES.
 *
 * Crea los 7 usuarios en Supabase Auth con la contraseña inicial indicada
 * y los vincula con su fila correspondiente en la tabla `responsables`
 * mediante el campo `user_id`.
 *
 * Pre-requisitos:
 *  - La tabla `responsables` debe tener ya los emails reales (@grupimedes.com).
 *  - `.env.local` con NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.
 *
 * Ejecución:
 *   npx tsx scripts/seed-users.ts
 *
 * Es idempotente: si un usuario ya existe, actualiza su contraseña y
 * revincula con responsables por si se hubiera perdido la relación.
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
}

const admin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
});

// Contraseña inicial común. Cada usuario debe cambiarla en su primer acceso.
const INITIAL_PASSWORD = 'Imedes2026!';

type Persona = {
    email: string;
    fullName: string;
    // Email actual en la tabla `responsables` con el que se buscará la fila.
    // En nuestro caso coincide con `email` porque Javi ya actualizó la tabla.
    responsableEmail: string;
};

const EQUIPO: Persona[] = [
    { email: 'jcebrian@grupimedes.com',  fullName: 'Javier Cebrián',        responsableEmail: 'jcebrian@grupimedes.com' },
    { email: 'ebono@grupimedes.com',     fullName: 'Emèrit Bono',           responsableEmail: 'ebono@grupimedes.com' },
    { email: 'enavarro@grupimedes.com',  fullName: 'Kike Navarro',          responsableEmail: 'enavarro@grupimedes.com' },
    { email: 'echeca@grupimedes.com',    fullName: 'Eva Checa',             responsableEmail: 'echeca@grupimedes.com' },
    { email: 'aescriva@grupimedes.com',  fullName: 'Andrea Escrivà',        responsableEmail: 'aescriva@grupimedes.com' },
    { email: 'janento@grupimedes.com',   fullName: 'Jorge Anento',          responsableEmail: 'janento@grupimedes.com' },
    { email: 'mochoa@grupimedes.com',    fullName: 'Marcela Ochoaerrarte',  responsableEmail: 'mochoa@grupimedes.com' },
];

async function upsertUser(persona: Persona) {
    console.log(`\n→ ${persona.fullName} <${persona.email}>`);

    // 1) Intentar crear el usuario Auth.
    const { data: createData, error: createError } = await admin.auth.admin.createUser({
        email: persona.email,
        password: INITIAL_PASSWORD,
        email_confirm: true, // Sin SMTP: confirmamos directamente.
        user_metadata: { full_name: persona.fullName },
    });

    let userId: string | undefined = createData?.user?.id;

    if (createError) {
        if (!/already|registered|exists/i.test(createError.message)) {
            console.error(`   ❌ Error creando usuario: ${createError.message}`);
            return;
        }
        console.log('   ↻ Ya existe. Actualizando contraseña y metadata…');
        // Buscar el usuario existente.
        const { data: listData, error: listError } = await admin.auth.admin.listUsers();
        if (listError) {
            console.error(`   ❌ Error listando usuarios: ${listError.message}`);
            return;
        }
        const existing = listData.users.find(u => u.email?.toLowerCase() === persona.email.toLowerCase());
        if (!existing) {
            console.error('   ❌ No encontrado tras "already exists". Estado inconsistente.');
            return;
        }
        userId = existing.id;
        const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
            password: INITIAL_PASSWORD,
            user_metadata: { full_name: persona.fullName },
        });
        if (updateError) {
            console.error(`   ❌ Error actualizando: ${updateError.message}`);
            return;
        }
        console.log('   ✓ Contraseña y metadata actualizadas.');
    } else {
        console.log('   ✓ Usuario Auth creado.');
    }

    if (!userId) {
        console.error('   ❌ Sin user_id tras crear/actualizar.');
        return;
    }

    // 2) Vincular con la fila de responsables por email.
    const { data: respRow, error: respError } = await admin
        .from('responsables')
        .update({ user_id: userId })
        .eq('email', persona.responsableEmail)
        .select('id, nombre, apellidos, email');

    if (respError) {
        console.error(`   ❌ Error vinculando responsable: ${respError.message}`);
        return;
    }
    if (!respRow || respRow.length === 0) {
        console.warn(`   ⚠ No hay fila en 'responsables' con email=${persona.responsableEmail}. Usuario Auth creado pero SIN vincular.`);
        return;
    }
    console.log(`   ✓ Vinculado con responsable id=${respRow[0].id} (${respRow[0].nombre}).`);
}

async function main() {
    console.log('=== seed-users.ts — Alta de equipo IMEDES ===');
    console.log(`Supabase: ${supabaseUrl}`);
    console.log(`Contraseña inicial común: ${INITIAL_PASSWORD}`);
    console.log(`Total a procesar: ${EQUIPO.length}`);

    for (const persona of EQUIPO) {
        await upsertUser(persona);
    }

    console.log('\n=== Resumen final — estado de responsables ===');
    const { data: finalState, error: finalError } = await admin
        .from('responsables')
        .select('nombre, apellidos, email, user_id, activo')
        .order('nombre');
    if (finalError) {
        console.error(`Error consultando estado final: ${finalError.message}`);
        return;
    }
    console.table(
        (finalState ?? []).map(r => ({
            Nombre: `${r.nombre}${r.apellidos ? ' ' + r.apellidos : ''}`,
            Email: r.email,
            Vinculado: r.user_id ? '✓' : '—',
            Activo: r.activo ? '✓' : '—',
        }))
    );
    console.log('\n✅ Proceso terminado.');
}

main().catch(e => {
    console.error('❌ Error no controlado:', e);
    process.exit(1);
});
