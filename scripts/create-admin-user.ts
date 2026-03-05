
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no encontradas en .env.local');
    process.exit(1);
}

// Crear cliente con Service Role para saltarse RLS y emails
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createAdminUser() {
    const email = 'javier.cebrian@imedes.es';
    const password = 'Imedes2026!';

    console.log(`Intentando crear usuario: ${email}...`);

    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Confirmar email automáticamente
        user_metadata: { full_name: 'Javier Cebrián' }
    });

    if (error) {
        if (error.message.includes('already registered')) {
            console.log('El usuario ya existe. Actualizando contraseña por seguridad...');

            // Si ya existe, nos aseguramos de que la contraseña sea la correcta
            const { data: listData, error: listError } = await supabase.auth.admin.listUsers();
            if (listError) {
                console.error('Error listando usuarios:', listError.message);
                return;
            }

            const existingUser = listData.users.find(u => u.email === email);
            if (existingUser) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    existingUser.id,
                    { password }
                );
                if (updateError) {
                    console.error('Error actualizando usuario:', updateError.message);
                } else {
                    console.log('Contraseña actualizada con éxito.');
                }
            }
        } else {
            console.error('Error creando usuario:', error.message);
        }
    } else {
        console.log('Usuario creado y confirmado satisfactoriamente:', data.user?.email);

        // Vincular con la tabla responsables si existe
        const { data: respData } = await supabase
            .from('responsables')
            .update({ user_id: data.user?.id })
            .eq('email', 'javi@imedes.es') // Mapeo según schema.sql
            .select();

        if (respData) {
            console.log('Usuario vinculado correctamente con el responsable "Javi".');
        }
    }
}

createAdminUser();
