// src/lib/supabase/client.ts
// Las env vars NEXT_PUBLIC_* se inlinean en el bundle del cliente durante
// `next build`. Los defaults están en el Dockerfile (ARG) para garantizar
// que Dokploy siempre los tenga en build-time.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
        console.error(
            '[Supabase] Falta NEXT_PUBLIC_SUPABASE_URL o ANON_KEY.',
            'Revisa el Dockerfile ARG defaults o las env vars de Dokploy.'
        );
    }

    return createBrowserClient(url!, key!);
}
