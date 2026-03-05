// src/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Situacion } from '@/types';
import { SITUACION_CONFIG } from './constants';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
    if (amount === null || amount === undefined) return '—';
    return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
    if (!date) return '—';
    try {
        return format(new Date(date), 'dd/MM/yyyy', { locale: es });
    } catch {
        return '—';
    }
}

export function formatDateShort(date: string | Date | null | undefined): string {
    if (!date) return '—';
    try {
        return format(new Date(date), 'dd MMM', { locale: es });
    } catch {
        return '—';
    }
}

export function formatRelativeDate(date: string | Date | null | undefined): string {
    if (!date) return '—';
    try {
        const d = new Date(date);
        if (isToday(d)) return 'Hoy';
        if (isTomorrow(d)) return 'Mañana';
        if (isThisWeek(d, { locale: es })) return format(d, 'EEEE', { locale: es });
        return formatDistanceToNow(d, { addSuffix: true, locale: es });
    } catch {
        return '—';
    }
}

export function formatDateTime(date: string | Date | null | undefined): string {
    if (!date) return '—';
    try {
        return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch {
        return '—';
    }
}

export function getSituacionConfig(situacion: Situacion) {
    return SITUACION_CONFIG[situacion] ?? SITUACION_CONFIG['EN_PREVISION'];
}

export function getInitials(name: string): string {
    return name
        .split(' ')
        .map(w => w[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
}
