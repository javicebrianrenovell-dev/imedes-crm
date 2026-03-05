// src/types/crm.types.ts

export type Sector = 'PÚBLICO' | 'PRIVADO';

export type Area = 'CONSULTORÍA' | 'COMUNICACIÓN' | 'EA';

export type Situacion =
    | 'EN_PREVISION'
    | 'PENDIENTE_AGENDAR'
    | 'PENDIENTE_REUNION'
    | 'PENDIENTE_PROPUESTA'
    | 'PENDIENTE_LICITACION'
    | 'PROPUESTA_PRESENTADA'
    | 'PROPUESTA_EN_EJECUCION'
    | 'PROPUESTA_GANADA'
    | 'PROPUESTA_PERDIDA'
    | 'DESCARTADA';

export type ActividadTipo =
    | 'REUNION'
    | 'LLAMADA'
    | 'EMAIL'
    | 'PROPUESTA_ENVIADA'
    | 'SEGUIMIENTO'
    | 'VISITA'
    | 'NOTA_INTERNA';

export interface Responsable {
    id: string;
    nombre: string;
    apellidos?: string;
    email?: string;
    telefono?: string;
    color: string;
    activo: boolean;
    user_id?: string;
    created_at: string;
    updated_at: string;
}

export interface Cliente {
    id: string;
    nombre: string;
    sector: Sector;
    tipo?: string;
    provincia?: string;
    comunidad?: string;
    contacto_nombre?: string;
    contacto_email?: string;
    contacto_telefono?: string;
    contacto_cargo?: string;
    notas?: string;
    activo: boolean;
    created_at: string;
    updated_at: string;
    // Relaciones opcionales
    oportunidades?: Oportunidad[];
}

export interface Oportunidad {
    id: string;
    cliente_id: string;
    responsable_id?: string;
    nombre: string;
    descripcion?: string;
    area: Area;
    situacion: Situacion;
    presupuesto?: number;
    probabilidad_cierre?: number;
    fecha_ultima_reunion?: string;
    fecha_proxima_reunion?: string;
    fecha_presentacion?: string;
    fecha_cierre_previsto?: string;
    fecha_cierre_real?: string;
    motivo_perdida?: string;
    notas?: string;
    prioridad: 1 | 2 | 3;
    archivada: boolean;
    created_at: string;
    updated_at: string;
    // Relaciones opcionales (joins)
    cliente?: Cliente;
    responsable?: Responsable;
    actividades?: Actividad[];
}

export interface Actividad {
    id: string;
    oportunidad_id?: string;
    cliente_id?: string;
    responsable_id?: string;
    tipo: ActividadTipo;
    titulo: string;
    descripcion?: string;
    fecha: string;
    duracion_minutos?: number;
    resultado?: string;
    proximos_pasos?: string;
    completada: boolean;
    created_at: string;
    updated_at: string;
    // Relaciones opcionales
    responsable?: Responsable;
    oportunidad?: Oportunidad;
    cliente?: Cliente;
}

// KPIs Dashboard
export interface KPIGlobal {
    pipeline_total: number;
    importe_ganado: number;
    num_oportunidades_activas: number;
    num_clientes: number;
    tasa_conversion: number;
    num_proximas_reuniones: number;
}

export interface KPIResponsable {
    responsable_id: string;
    responsable: string;
    color: string;
    total_oportunidades: number;
    ganadas: number;
    presentadas: number;
    activas: number;
    pipeline_total: number;
    importe_ganado: number;
    tasa_conversion: number;
}

export interface KPIArea {
    area: Area;
    total_oportunidades: number;
    pipeline_total: number;
    ganadas: number;
    importe_ganado: number;
}

export interface KPISector {
    sector: Sector;
    num_clientes: number;
    total_oportunidades: number;
    pipeline_total: number;
    importe_ganado: number;
}

export interface FunnelItem {
    situacion: Situacion;
    num_oportunidades: number;
    importe_total: number;
}

export interface ProximaReunion {
    oportunidad_id: string;
    oportunidad: string;
    fecha_proxima_reunion: string;
    cliente: string;
    sector: Sector;
    responsable: string;
    responsable_color: string;
    situacion: Situacion;
    presupuesto?: number;
}

// Filtros
export interface OportunidadFiltros {
    search?: string;
    responsable_id?: string;
    area?: Area;
    situacion?: Situacion;
    sector?: Sector;
    prioridad?: number;
    archivada?: boolean;
    page?: number;
    perPage?: number;
}

export interface ClienteFiltros {
    search?: string;
    sector?: Sector;
    page?: number;
    perPage?: number;
}

export interface ActividadFiltros {
    responsable_id?: string;
    tipo?: ActividadTipo;
    cliente_id?: string;
    oportunidad_id?: string;
    page?: number;
    perPage?: number;
}
