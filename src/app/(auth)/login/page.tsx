'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
export const dynamic = 'force-dynamic';

import { createClient } from '@/lib/supabase/client';
import { IMEDES_LOGO_BASE64 } from '@/lib/constants';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(traducirError(error.message));
            setLoading(false);
            return;
        }

        router.push('/dashboard');
        router.refresh();
    };

    return (
        <div className="min-h-screen grid lg:grid-cols-2">
            {/* Panel izquierdo — Marca */}
            <aside className="relative hidden lg:flex flex-col justify-between bg-[#1a3a2e] text-[#faf8f3] p-12 overflow-hidden">
                {/* Patrón decorativo sutil */}
                <div
                    aria-hidden
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage:
                            'radial-gradient(circle at 20% 30%, #faf8f3 1px, transparent 1px), radial-gradient(circle at 70% 70%, #faf8f3 1px, transparent 1px)',
                        backgroundSize: '60px 60px, 80px 80px',
                    }}
                />
                {/* Acento de luz cálida */}
                <div
                    aria-hidden
                    className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#c9a961] opacity-[0.08] blur-3xl"
                />

                {/* Logo + nombre arriba */}
                <header className="relative z-10 flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={IMEDES_LOGO_BASE64}
                        alt="IMEDES"
                        className="w-14 h-14 object-contain bg-[#faf8f3] rounded-lg p-1.5"
                    />
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[#c9a961] font-medium">
                            Instituto IMEDES
                        </p>
                        <p className="text-sm text-[#faf8f3]/70 mt-1 leading-relaxed">
                            Medio Ambiente y Territorio<br />
                            Comunicación<br />
                            Educación Ambiental
                        </p>
                    </div>
                </header>

                {/* Mensaje de marca centro */}
                <div className="relative z-10 max-w-md">
                    <h1 className="text-4xl font-light leading-tight text-[#faf8f3] mb-6">
                        Desarrollo de negocio,
                        <br />
                        <span className="font-semibold text-[#c9a961]">con criterio.</span>
                    </h1>
                    <p className="text-[#faf8f3]/70 text-base leading-relaxed">
                        El sistema interno de IMEDES para el seguimiento de oportunidades,
                        clientes y propuestas. Datos en tiempo real al servicio de las
                        decisiones del equipo.
                    </p>
                </div>

                {/* Pie del panel */}
                <footer className="relative z-10 text-xs text-[#faf8f3]/40">
                    © {new Date().getFullYear()} Instituto IMEDES S.L. · Valencia
                </footer>
            </aside>

            {/* Panel derecho — Formulario */}
            <main className="flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    {/* Logo solo en móvil */}
                    <div className="lg:hidden flex flex-col items-center mb-10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={IMEDES_LOGO_BASE64}
                            alt="IMEDES"
                            className="w-16 h-16 object-contain mb-3"
                        />
                        <p className="text-xs uppercase tracking-[0.2em] text-[#2d5e44] font-medium">
                            Instituto IMEDES
                        </p>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-semibold text-[#1a3a2e] mb-2">
                            Acceso al CRM
                        </h2>
                        <p className="text-sm text-slate-500">
                            Introduce tus credenciales corporativas para entrar.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-xs font-semibold uppercase tracking-wider text-[#1a3a2e] mb-2"
                            >
                                Correo electrónico
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="nombre@grupimedes.com"
                                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2d5e44] focus:border-[#2d5e44] transition-all"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-semibold uppercase tracking-wider text-[#1a3a2e] mb-2"
                            >
                                Contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full rounded-md border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2d5e44] focus:border-[#2d5e44] transition-all"
                            />
                        </div>

                        {error && (
                            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <button
                            id="btn-login"
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-md bg-[#1a3a2e] px-4 py-3 text-sm font-semibold text-[#faf8f3] shadow-sm hover:bg-[#2d5e44] focus:outline-none focus:ring-2 focus:ring-[#2d5e44] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg
                                        className="animate-spin h-4 w-4"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    Iniciando sesión…
                                </span>
                            ) : (
                                'Entrar'
                            )}
                        </button>
                    </form>

                    <div className="mt-10 pt-6 border-t border-slate-200">
                        <p className="text-xs text-slate-400 text-center">
                            Sistema interno · Acceso restringido al equipo de IMEDES
                        </p>
                        <p className="text-xs text-slate-400 text-center mt-1">
                            ¿Problemas para entrar? Contacta con Javi Cebrián.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

// Traducción de mensajes de error técnicos a lenguaje claro para el usuario.
function traducirError(mensaje: string): string {
    const m = mensaje.toLowerCase();
    if (m.includes('invalid login credentials')) {
        return 'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.';
    }
    if (m.includes('email not confirmed')) {
        return 'Tu cuenta aún no está activa. Avisa a Javi Cebrián.';
    }
    if (m.includes('too many requests')) {
        return 'Demasiados intentos seguidos. Espera un minuto e inténtalo de nuevo.';
    }
    return 'No se ha podido iniciar sesión. Inténtalo de nuevo o contacta con Javi.';
}
