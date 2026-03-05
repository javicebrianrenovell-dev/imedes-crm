// src/middleware.ts
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Middleware de Next.js
 * 
 * NOTA: La seguridad por login ha sido desactivada temporalmente para
 * facilitar el acceso directo de los usuarios a su CRM sin credenciales.
 */
export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request });

    // El middleware ahora simplemente deja pasar todas las peticiones
    // sin comprobar el estado de Supabase Auth.

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
};
