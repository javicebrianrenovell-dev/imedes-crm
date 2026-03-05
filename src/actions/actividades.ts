'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const ActividadSchema = z.object({
    oportunidad_id: z.string().uuid().optional().or(z.literal('')),
    cliente_id: z.string().uuid().optional().or(z.literal('')),
    tipo: z.enum(['REUNION', 'LLAMADA', 'EMAIL', 'PROPUESTA_ENVIADA', 'SEGUIMIENTO', 'VISITA', 'NOTA_INTERNA']),
    titulo: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
    descripcion: z.string().optional(),
    fecha: z.string().datetime({ offset: true }).optional().or(z.string()),
    duracion_minutos: z.coerce.number().int().positive().optional().or(z.literal('')),
    resultado: z.string().optional(),
    proximos_pasos: z.string().optional(),
    completada: z.coerce.boolean().default(false),
});

function cleanData(raw: Record<string, unknown>) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
        if (v === '' || v === null || v === undefined) continue;
        cleaned[k] = v;
    }
    return cleaned;
}

export async function createActividad(formData: FormData) {
    const supabase = await createClient();
    const raw = Object.fromEntries(formData);
    const parsed = ActividadSchema.safeParse(raw);

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(e => e.message).join(', '));
    }

    const data = cleanData(parsed.data as Record<string, unknown>);

    const { error } = await supabase.from('actividades').insert(data);
    if (error) throw new Error(error.message);

    revalidatePath('/actividades');
    revalidatePath('/dashboard');
    if (data.oportunidad_id) {
        revalidatePath(`/oportunidades/${data.oportunidad_id}`);
    }
    if (data.cliente_id) {
        revalidatePath(`/clientes/${data.cliente_id}`);
    }
}

export async function updateActividad(id: string, formData: FormData) {
    const supabase = await createClient();
    const raw = Object.fromEntries(formData);
    const parsed = ActividadSchema.partial().safeParse(raw);

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(e => e.message).join(', '));
    }

    const data = cleanData(parsed.data as Record<string, unknown>);

    const { error } = await supabase.from('actividades').update(data).eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/actividades');
    revalidatePath('/dashboard');
}

export async function deleteActividad(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('actividades').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/actividades');
    revalidatePath('/dashboard');
}
