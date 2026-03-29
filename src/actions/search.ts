'use server';

import { createClient } from '@/lib/supabase/server';

export interface SearchResult {
    type: 'oportunidad' | 'cliente';
    id: string;
    title: string;
    subtitle: string;
    href: string;
}

export async function searchGlobal(query: string): Promise<SearchResult[]> {
    if (!query.trim() || query.length < 2) return [];
    const supabase = await createClient();

    const [opsRes, clientesRes] = await Promise.all([
        supabase
            .from('oportunidades')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .select('id, nombre, cliente:clientes(nombre)' as any)
            .ilike('nombre', `%${query}%`)
            .eq('archivada', false)
            .limit(5),
        supabase
            .from('clientes')
            .select('id, nombre, sector')
            .ilike('nombre', `%${query}%`)
            .eq('activo', true)
            .limit(5),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ops: SearchResult[] = ((opsRes.data ?? []) as any[]).map((o) => ({
        type: 'oportunidad' as const,
        id: o.id,
        title: o.nombre,
        subtitle: (o.cliente as { nombre?: string } | null)?.nombre ?? 'Sin cliente',
        href: `/oportunidades/${o.id}`,
    }));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const clientes: SearchResult[] = ((clientesRes.data ?? []) as any[]).map((c) => ({
        type: 'cliente' as const,
        id: c.id,
        title: c.nombre,
        subtitle: c.sector,
        href: `/clientes/${c.id}`,
    }));

    return [...ops, ...clientes];
}
