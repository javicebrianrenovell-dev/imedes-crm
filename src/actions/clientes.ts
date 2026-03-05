'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { redirect } from 'next/navigation';

const ClienteSchema = z.object({
    nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(200),
    sector: z.enum(['PÚBLICO', 'PRIVADO']),
    tipo: z.string().optional(),
    provincia: z.string().optional(),
    comunidad: z.string().optional(),
    contacto_nombre: z.string().optional(),
    contacto_email: z.string().email().optional().or(z.literal('')),
    contacto_telefono: z.string().optional(),
    contacto_cargo: z.string().optional(),
    notas: z.string().optional(),
});

function cleanData(raw: Record<string, unknown>) {
    const cleaned: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(raw)) {
        if (v === '' || v === null || v === undefined) continue;
        cleaned[k] = v;
    }
    return cleaned;
}

export async function createCliente(formData: FormData) {
    const supabase = await createClient();
    const parsed = ClienteSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(e => e.message).join(', '));
    }

    const data = cleanData(parsed.data as Record<string, unknown>);

    const { data: inserted, error } = await supabase
        .from('clientes')
        .insert(data)
        .select('id')
        .single();

    if (error) throw new Error(error.message);

    revalidatePath('/clientes');
    redirect(`/clientes/${inserted.id}`);
}

export async function updateCliente(id: string, formData: FormData) {
    const supabase = await createClient();
    const parsed = ClienteSchema.partial().safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        throw new Error(parsed.error.issues.map(e => e.message).join(', '));
    }

    const data = cleanData(parsed.data as Record<string, unknown>);

    const { error } = await supabase.from('clientes').update(data).eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/clientes');
    revalidatePath(`/clientes/${id}`);
    redirect(`/clientes/${id}`);
}

export async function deleteCliente(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from('clientes').delete().eq('id', id);
    if (error) throw new Error(error.message);

    revalidatePath('/clientes');
}
