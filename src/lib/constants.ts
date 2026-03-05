// src/lib/constants.ts

import type { Situacion, Area } from '@/types';

export const SITUACION_CONFIG: Record<Situacion, { label: string; color: string; bgColor: string; textColor: string }> = {
    EN_PREVISION: { label: 'En previsión', color: '#94a3b8', bgColor: '#f1f5f9', textColor: '#475569' },
    PENDIENTE_AGENDAR: { label: 'Pendiente agendar', color: '#f59e0b', bgColor: '#fffbeb', textColor: '#92400e' },
    PENDIENTE_REUNION: { label: 'Pendiente reunión', color: '#f97316', bgColor: '#fff7ed', textColor: '#9a3412' },
    PENDIENTE_PROPUESTA: { label: 'Pendiente propuesta', color: '#a78bfa', bgColor: '#f5f3ff', textColor: '#5b21b6' },
    PENDIENTE_LICITACION: { label: 'Pendiente licitación', color: '#60a5fa', bgColor: '#eff6ff', textColor: '#1e40af' },
    PROPUESTA_PRESENTADA: { label: 'Propuesta presentada', color: '#3b82f6', bgColor: '#dbeafe', textColor: '#1e3a8a' },
    PROPUESTA_EN_EJECUCION: { label: 'En ejecución', color: '#8b5cf6', bgColor: '#ede9fe', textColor: '#4c1d95' },
    PROPUESTA_GANADA: { label: 'Ganada', color: '#10b981', bgColor: '#d1fae5', textColor: '#064e3b' },
    PROPUESTA_PERDIDA: { label: 'Perdida', color: '#ef4444', bgColor: '#fee2e2', textColor: '#7f1d1d' },
    DESCARTADA: { label: 'Descartada', color: '#6b7280', bgColor: '#f3f4f6', textColor: '#374151' },
};

export const AREA_CONFIG: Record<Area, { label: string; color: string; bgColor: string }> = {
    'CONSULTORÍA': { label: 'Consultoría', color: '#6366f1', bgColor: '#eef2ff' },
    'COMUNICACIÓN': { label: 'Comunicación', color: '#0ea5e9', bgColor: '#e0f2fe' },
    'EA': { label: 'Est. Ambiental', color: '#10b981', bgColor: '#d1fae5' },
};

export const SECTOR_CONFIG = {
    'PÚBLICO': { label: 'Público', color: '#6366f1', bgColor: '#eef2ff' },
    'PRIVADO': { label: 'Privado', color: '#f59e0b', bgColor: '#fffbeb' },
} as const;

export const PRIORIDAD_CONFIG = {
    1: { label: 'Alta', color: '#ef4444', icon: '🔴' },
    2: { label: 'Media', color: '#f59e0b', icon: '🟡' },
    3: { label: 'Baja', color: '#10b981', icon: '🟢' },
} as const;

export const ACTIVIDAD_TIPO_CONFIG = {
    REUNION: { label: 'Reunión', icon: 'Users' },
    LLAMADA: { label: 'Llamada', icon: 'Phone' },
    EMAIL: { label: 'Email', icon: 'Mail' },
    PROPUESTA_ENVIADA: { label: 'Propuesta enviada', icon: 'FileText' },
    SEGUIMIENTO: { label: 'Seguimiento', icon: 'Clock' },
    VISITA: { label: 'Visita', icon: 'MapPin' },
    NOTA_INTERNA: { label: 'Nota interna', icon: 'StickyNote' },
} as const;

// Orden del funnel de ventas (kanban y funnel chart)
export const FUNNEL_ORDER: Situacion[] = [
    'EN_PREVISION',
    'PENDIENTE_AGENDAR',
    'PENDIENTE_REUNION',
    'PENDIENTE_PROPUESTA',
    'PENDIENTE_LICITACION',
    'PROPUESTA_PRESENTADA',
    'PROPUESTA_EN_EJECUCION',
    'PROPUESTA_GANADA',
];

// Estados activos para el Kanban (excluye perdidas y descartadas)
export const KANBAN_SITUACIONES: Situacion[] = [
    'EN_PREVISION',
    'PENDIENTE_AGENDAR',
    'PENDIENTE_REUNION',
    'PENDIENTE_PROPUESTA',
    'PENDIENTE_LICITACION',
    'PROPUESTA_PRESENTADA',
    'PROPUESTA_EN_EJECUCION',
    'PROPUESTA_GANADA',
];

export const RESPONSABLE_COLORS: Record<string, string> = {
    'Javi': '#6366f1',
    'Emèrit': '#0ea5e9',
    'Kike': '#10b981',
    'Eva': '#f59e0b',
    'Andrea': '#ec4899',
};

export const PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;
export const DEFAULT_PER_PAGE = 25;
