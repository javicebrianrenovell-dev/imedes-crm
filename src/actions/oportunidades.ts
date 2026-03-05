'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const OportunidadSchema = z.object({
    cliente_id: z.string().uuid('Cliente requerido'),
    responsable_id: z.string().uuid().optional().or(z.literal('')),
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
    descripcion: z.string().optional(),
    area: z.enum(['CONSULTORÍA', 'COMUNICACIÓN', 'EA']),
    situacion: z.enum([
        'EN_PREVISION', 'PENDIENTE_AGENDAR', 'PENDIENTE_REUNION',
        'PENDIENTE_PROPUESTA', 'PENDIENTE_LICITACION', 'PROPUESTA_PRESENTADA',
        'PROPUESTA_EN_EJECUCION', 'PROPUESTA_GANADA', 'PROPUESTA_PERDIDA', 'DESCARTADA'
    ]),
    presupuesto: z.coerce.number().positive().optional().or(z.literal('')),
    probabilidad_cierre: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
    fecha_proxima_reunion: z.string().optional().or(z.literal('')),
    fecha_ultima_reunion: z.string().optional().or(z.literal('')),
    notas: z.string().optional(),
    prioridad: z.coerce.number().min(1).max(3).default(2),
    motivo_perdida: z.string().optional(),
});

function cleanData(raw: Record<string, unknown>) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
        if (v === '' || v === null || v === undefined) continue;
        cleaned[k] = v;
    }
    return cleaned;
}

export async function createOportunidad(formData: FormData) {
    const supabase = await createClient();
    const raw = Object.fromEntries(formData);
    const parsed = OportunidadSchema.safeParse(raw);

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(e => e.message).join(', '));
    }

    const data = cleanData(parsed.data as Record<string, unknown>);

    const { data: inserted, error } = await supabase
        .from('oportunidades')
        .insert(data)
        .select('id')
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/oportunidades');
    revalidatePath('/dashboard');

    redirect(`/oportunidades/${inserted.id}`);
}

export async function updateOportunidad(id: string, formData: FormData) {
    const supabase = await createClient();
    const raw = Object.fromEntries(formData);
    const parsed = OportunidadSchema.partial().safeParse(raw);

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(e => e.message).join(', '));
    }

    const data = cleanData(parsed.data as Record<string, unknown>);

    const { error } = await supabase
        .from('oportunidades')
        .update(data)
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/oportunidades');
    revalidatePath(`/oportunidades/${id}`);
    revalidatePath('/dashboard');

    redirect(`/oportunidades/${id}`);
}

export async function updateSituacion(id: string, situacion: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('oportunidades')
        .update({ situacion })
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/oportunidades');
    revalidatePath('/dashboard');
}

export async function deleteOportunidad(id: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('oportunidades')
        .delete()
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/oportunidades');
    revalidatePath('/dashboard');
}

export async function archivarOportunidad(id: string, archivada = true) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('oportunidades')
        .update({ archivada })
        .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/oportunidades');
    revalidatePath(`/oportunidades/${id}`);
    revalidatePath('/dashboard');
}
