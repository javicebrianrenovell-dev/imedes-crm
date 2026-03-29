'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Briefcase, Users, LayoutDashboard, CalendarDays, Activity, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { searchGlobal, type SearchResult } from '@/actions/search';

interface QuickAction {
    label: string;
    href: string;
    icon: React.ElementType;
    description: string;
}

const QUICK_ACTIONS: QuickAction[] = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, description: 'Ver KPIs y gráficas' },
    { label: 'Nueva oportunidad', href: '/oportunidades/nueva', icon: Briefcase, description: 'Crear una oportunidad' },
    { label: 'Clientes', href: '/clientes', icon: Users, description: 'Listado de clientes' },
    { label: 'Actividades', href: '/actividades', icon: Activity, description: 'Historial de actividades' },
    { label: 'Reuniones', href: '/reuniones', icon: CalendarDays, description: 'Próximas reuniones' },
];

interface CommandPaletteProps {
    open: boolean;
    onClose: () => void;
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (open) {
            setQuery('');
            setResults([]);
            setSelected(0);
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [open]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            setLoading(false);
            return;
        }
        setLoading(true);
        const timer = setTimeout(async () => {
            const data = await searchGlobal(query);
            setResults(data);
            setLoading(false);
            setSelected(0);
        }, 250);
        return () => clearTimeout(timer);
    }, [query]);

    const navigate = useCallback((href: string) => {
        router.push(href);
        onClose();
    }, [router, onClose]);

    const items = query ? results : QUICK_ACTIONS;
    const total = items.length;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, total - 1)); }
        if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (query && results[selected]) navigate(results[selected].href);
            else if (!query && QUICK_ACTIONS[selected]) navigate(QUICK_ACTIONS[selected].href);
        }
        if (e.key === 'Escape') onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[18vh] px-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in-up">
                {/* Input */}
                <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
                    {loading ? (
                        <Loader2 className="h-4 w-4 text-slate-400 flex-shrink-0 animate-spin" />
                    ) : (
                        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
                    )}
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Buscar oportunidades, clientes..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none bg-transparent"
                    />
                    <kbd className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5 font-mono">Esc</kbd>
                </div>

                {/* Results */}
                <div className="max-h-80 overflow-y-auto">
                    {!query && (
                        <div className="p-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-1.5">Acciones rápidas</p>
                            {QUICK_ACTIONS.map((action, i) => (
                                <button
                                    key={action.href}
                                    onClick={() => navigate(action.href)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
                                        selected === i ? 'bg-green-50' : 'hover:bg-slate-50'
                                    )}
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                        selected === i ? 'bg-green-100' : 'bg-slate-100'
                                    )}>
                                        <action.icon className={cn('h-4 w-4', selected === i ? 'text-green-600' : 'text-slate-400')} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-900">{action.label}</p>
                                        <p className="text-xs text-slate-400">{action.description}</p>
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}

                    {query && !loading && results.length === 0 && (
                        <div className="px-4 py-8 text-center">
                            <p className="text-sm text-slate-400">Sin resultados para <span className="font-medium text-slate-600">"{query}"</span></p>
                        </div>
                    )}

                    {query && results.length > 0 && (
                        <div className="p-2">
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-3 py-1.5">Resultados</p>
                            {results.map((r, i) => (
                                <button
                                    key={r.id}
                                    onClick={() => navigate(r.href)}
                                    className={cn(
                                        'w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-colors',
                                        selected === i ? 'bg-green-50' : 'hover:bg-slate-50'
                                    )}
                                >
                                    <div className={cn(
                                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                        selected === i ? 'bg-green-100' : 'bg-slate-100'
                                    )}>
                                        {r.type === 'oportunidad' ? (
                                            <Briefcase className={cn('h-4 w-4', selected === i ? 'text-green-600' : 'text-indigo-400')} />
                                        ) : (
                                            <Users className={cn('h-4 w-4', selected === i ? 'text-green-600' : 'text-sky-400')} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-900 truncate">{r.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{r.subtitle}</p>
                                    </div>
                                    <ArrowRight className="h-3.5 w-3.5 text-slate-300 flex-shrink-0" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center gap-3 px-4 py-2 border-t border-slate-100 bg-slate-50">
                    <span className="text-xs text-slate-400">
                        <kbd className="font-mono border border-slate-200 rounded px-1 bg-white">↑↓</kbd> navegar
                    </span>
                    <span className="text-xs text-slate-400">
                        <kbd className="font-mono border border-slate-200 rounded px-1 bg-white">↵</kbd> ir
                    </span>
                    <span className="text-xs text-slate-400 ml-auto">
                        <kbd className="font-mono border border-slate-200 rounded px-1 bg-white">⌘K</kbd> para cerrar
                    </span>
                </div>
            </div>
        </div>
    );
}
