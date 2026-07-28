-- =====================================================
-- IMEDES CRM — Schema SQL para Supabase (PostgreSQL)
-- Ejecutar en: SQL Editor de Supabase Studio
-- =====================================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- ENUM TYPES
-- =====================================================

CREATE TYPE sector_type AS ENUM ('PÚBLICO', 'PRIVADO');

CREATE TYPE area_type AS ENUM (
  'CONSULTORÍA',
  'COMUNICACIÓN',
  'EA'
);

CREATE TYPE situacion_type AS ENUM (
  'EN_PREVISION',
  'PENDIENTE_AGENDAR',
  'PENDIENTE_REUNION',
  'PENDIENTE_PROPUESTA',
  'PENDIENTE_LICITACION',
  'PROPUESTA_PRESENTADA',
  'PROPUESTA_EN_EJECUCION',
  'PROPUESTA_GANADA',
  'PROPUESTA_PERDIDA',
  'DESCARTADA'
);

CREATE TYPE actividad_tipo AS ENUM (
  'REUNION',
  'LLAMADA',
  'EMAIL',
  'PROPUESTA_ENVIADA',
  'SEGUIMIENTO',
  'VISITA',
  'NOTA_INTERNA'
);

-- =====================================================
-- TABLA: responsables
-- Equipo comercial interno de IMEDES
-- =====================================================

CREATE TABLE IF NOT EXISTS responsables (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  apellidos   TEXT,
  email       TEXT UNIQUE,
  telefono    TEXT,
  color       TEXT DEFAULT '#6366f1',
  activo      BOOLEAN DEFAULT TRUE,
  user_id     UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_responsables_user_id ON responsables(user_id);

-- =====================================================
-- TABLA: clientes
-- =====================================================

CREATE TABLE IF NOT EXISTS clientes (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre              TEXT NOT NULL,
  sector              sector_type NOT NULL DEFAULT 'PÚBLICO',
  tipo                TEXT,
  provincia           TEXT DEFAULT 'Valencia',
  comunidad           TEXT DEFAULT 'Comunitat Valenciana',
  contacto_nombre     TEXT,
  contacto_email      TEXT,
  contacto_telefono   TEXT,
  contacto_cargo      TEXT,
  notas               TEXT,
  activo              BOOLEAN DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_sector ON clientes(sector);
CREATE INDEX IF NOT EXISTS idx_clientes_nombre ON clientes USING gin(nombre gin_trgm_ops);

-- =====================================================
-- TABLA: oportunidades
-- =====================================================

CREATE TABLE IF NOT EXISTS oportunidades (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cliente_id            UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  responsable_id        UUID REFERENCES responsables(id) ON DELETE SET NULL,
  nombre                TEXT NOT NULL,
  descripcion           TEXT,
  area                  area_type NOT NULL,
  situacion             situacion_type NOT NULL DEFAULT 'PENDIENTE_AGENDAR',
  presupuesto           NUMERIC(12, 2),
  probabilidad_cierre   INTEGER CHECK (probabilidad_cierre BETWEEN 0 AND 100),
  fecha_ultima_reunion  DATE,
  fecha_proxima_reunion DATE,
  fecha_presentacion    DATE,
  fecha_cierre_previsto DATE,
  fecha_cierre_real     DATE,
  motivo_perdida        TEXT,
  notas                 TEXT,
  prioridad             INTEGER DEFAULT 2 CHECK (prioridad BETWEEN 1 AND 3),
  archivada             BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_oportunidades_cliente ON oportunidades(cliente_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_responsable ON oportunidades(responsable_id);
CREATE INDEX IF NOT EXISTS idx_oportunidades_situacion ON oportunidades(situacion);
CREATE INDEX IF NOT EXISTS idx_oportunidades_area ON oportunidades(area);
CREATE INDEX IF NOT EXISTS idx_oportunidades_fecha_proxima ON oportunidades(fecha_proxima_reunion);
CREATE INDEX IF NOT EXISTS idx_oportunidades_nombre ON oportunidades USING gin(nombre gin_trgm_ops);

-- =====================================================
-- TABLA: actividades
-- =====================================================

CREATE TABLE IF NOT EXISTS actividades (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  oportunidad_id   UUID REFERENCES oportunidades(id) ON DELETE CASCADE,
  cliente_id       UUID REFERENCES clientes(id) ON DELETE CASCADE,
  responsable_id   UUID REFERENCES responsables(id) ON DELETE SET NULL,
  tipo             actividad_tipo NOT NULL,
  titulo           TEXT NOT NULL,
  descripcion      TEXT,
  fecha            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duracion_minutos INTEGER,
  resultado        TEXT,
  proximos_pasos   TEXT,
  completada       BOOLEAN DEFAULT FALSE,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_actividades_oportunidad ON actividades(oportunidad_id);
CREATE INDEX IF NOT EXISTS idx_actividades_responsable ON actividades(responsable_id);
CREATE INDEX IF NOT EXISTS idx_actividades_fecha ON actividades(fecha DESC);
CREATE INDEX IF NOT EXISTS idx_actividades_tipo ON actividades(tipo);

-- =====================================================
-- TABLA: etiquetas
-- =====================================================

CREATE TABLE IF NOT EXISTS etiquetas (
  id     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL UNIQUE,
  color  TEXT DEFAULT '#6366f1'
);

CREATE TABLE IF NOT EXISTS oportunidades_etiquetas (
  oportunidad_id UUID REFERENCES oportunidades(id) ON DELETE CASCADE,
  etiqueta_id    UUID REFERENCES etiquetas(id) ON DELETE CASCADE,
  PRIMARY KEY (oportunidad_id, etiqueta_id)
);

-- =====================================================
-- TRIGGERS: updated_at automático
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_responsables_updated ON responsables;
CREATE TRIGGER trg_responsables_updated BEFORE UPDATE ON responsables
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_clientes_updated ON clientes;
CREATE TRIGGER trg_clientes_updated BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_oportunidades_updated ON oportunidades;
CREATE TRIGGER trg_oportunidades_updated BEFORE UPDATE ON oportunidades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trg_actividades_updated ON actividades;
CREATE TRIGGER trg_actividades_updated BEFORE UPDATE ON actividades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- VISTAS para KPIs y Dashboard
-- =====================================================

CREATE OR REPLACE VIEW vista_kpi_responsable AS
SELECT
  r.id AS responsable_id,
  r.nombre AS responsable,
  r.color,
  COUNT(o.id) AS total_oportunidades,
  COUNT(o.id) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA') AS ganadas,
  COUNT(o.id) FILTER (WHERE o.situacion = 'PROPUESTA_PRESENTADA') AS presentadas,
  COUNT(o.id) FILTER (WHERE o.situacion NOT IN ('PROPUESTA_GANADA','PROPUESTA_PERDIDA','DESCARTADA')) AS activas,
  COALESCE(SUM(o.presupuesto) FILTER (WHERE o.situacion NOT IN ('PROPUESTA_PERDIDA','DESCARTADA')), 0) AS pipeline_total,
  COALESCE(SUM(o.presupuesto) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA'), 0) AS importe_ganado,
  ROUND(
    COUNT(o.id) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA')::NUMERIC /
    NULLIF(COUNT(o.id) FILTER (WHERE o.situacion IN ('PROPUESTA_GANADA','PROPUESTA_PERDIDA')), 0) * 100, 1
  ) AS tasa_conversion
FROM responsables r
LEFT JOIN oportunidades o ON o.responsable_id = r.id AND o.archivada = FALSE
WHERE r.activo   -- refundación 28-jul-2026: sin esto los técnicos dados de baja seguían pintando barras a cero
GROUP BY r.id, r.nombre, r.color;

-- Pipeline por producto de catálogo. Alimenta la gráfica del dashboard desde la
-- refundación del 28-jul-2026: con un responsable único (IMEDES), el eje que
-- aporta información es el producto, no la persona.
CREATE OR REPLACE VIEW vista_kpi_producto AS
SELECT
  COALESCE(o.producto_catalogo, 'sin-clasificar') AS producto_clave,
  CASE COALESCE(o.producto_catalogo, 'sin-clasificar')
    WHEN 'conecta-mayores-privado'   THEN 'Conecta empresas'
    WHEN 'conecta-mayores-municipal' THEN 'Conecta ayto.'
    WHEN 'campanya-municipal-14500'  THEN 'Se Nota'
    WHEN 'campanya-ambiental-25000'  THEN 'C. ambientales'
    WHEN 'catalogo-campanas'         THEN 'Catalogo'
    WHEN 'recogida-a-la-carta'       THEN 'Recogida'
    WHEN 'diagnostico-poligonos'     THEN 'Poligonos'
    WHEN 'areas-industriales'        THEN 'A. industriales'
    WHEN 'nou-bim'                   THEN 'Nou BIM'
    WHEN 'visor-dana'                THEN 'Visor DANA'
    WHEN 'a-medida'                  THEN 'A medida'
    WHEN 'licitacion'                THEN 'Licitacion'
    ELSE 'Sin clasificar'
  END AS producto,
  CASE COALESCE(o.producto_catalogo, 'sin-clasificar')
    WHEN 'conecta-mayores-privado'   THEN '#70ab37'
    WHEN 'conecta-mayores-municipal' THEN '#8fc75a'
    WHEN 'campanya-municipal-14500'  THEN '#6366f1'
    WHEN 'campanya-ambiental-25000'  THEN '#0ea5e9'
    WHEN 'catalogo-campanas'         THEN '#8b5cf6'
    WHEN 'recogida-a-la-carta'       THEN '#14b8a6'
    WHEN 'diagnostico-poligonos'     THEN '#f59e0b'
    WHEN 'areas-industriales'        THEN '#ec4899'
    WHEN 'nou-bim'                   THEN '#06b6d4'
    WHEN 'visor-dana'                THEN '#3b82f6'
    WHEN 'a-medida'                  THEN '#94a3b8'
    WHEN 'licitacion'                THEN '#64748b'
    ELSE '#cbd5e1'
  END AS color,
  COUNT(*) AS total_oportunidades,
  COUNT(*) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA') AS ganadas,
  COUNT(*) FILTER (WHERE o.situacion = 'PROPUESTA_PRESENTADA') AS presentadas,
  COUNT(*) FILTER (WHERE o.situacion NOT IN ('PROPUESTA_GANADA','PROPUESTA_PERDIDA','DESCARTADA')) AS activas,
  COALESCE(SUM(o.presupuesto) FILTER (WHERE o.situacion NOT IN ('PROPUESTA_PERDIDA','DESCARTADA')), 0) AS pipeline_total,
  COALESCE(SUM(o.presupuesto) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA'), 0) AS importe_ganado
FROM oportunidades o
WHERE NOT o.archivada
GROUP BY 1, 2, 3
ORDER BY pipeline_total DESC;

CREATE OR REPLACE VIEW vista_kpi_sector AS
SELECT
  c.sector,
  COUNT(DISTINCT c.id) AS num_clientes,
  COUNT(o.id) AS total_oportunidades,
  COALESCE(SUM(o.presupuesto), 0) AS pipeline_total,
  COALESCE(SUM(o.presupuesto) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA'), 0) AS importe_ganado
FROM clientes c
LEFT JOIN oportunidades o ON o.cliente_id = c.id AND o.archivada = FALSE
GROUP BY c.sector;

CREATE OR REPLACE VIEW vista_kpi_area AS
SELECT
  o.area,
  COUNT(o.id) AS total_oportunidades,
  COALESCE(SUM(o.presupuesto), 0) AS pipeline_total,
  COUNT(o.id) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA') AS ganadas,
  COALESCE(SUM(o.presupuesto) FILTER (WHERE o.situacion = 'PROPUESTA_GANADA'), 0) AS importe_ganado
FROM oportunidades o
WHERE o.archivada = FALSE
GROUP BY o.area;

CREATE OR REPLACE VIEW vista_funnel AS
SELECT
  situacion,
  COUNT(*) AS num_oportunidades,
  COALESCE(SUM(presupuesto), 0) AS importe_total
FROM oportunidades
WHERE archivada = FALSE
GROUP BY situacion
ORDER BY
  CASE situacion
    WHEN 'EN_PREVISION' THEN 1
    WHEN 'PENDIENTE_AGENDAR' THEN 2
    WHEN 'PENDIENTE_REUNION' THEN 3
    WHEN 'PENDIENTE_PROPUESTA' THEN 4
    WHEN 'PENDIENTE_LICITACION' THEN 5
    WHEN 'PROPUESTA_PRESENTADA' THEN 6
    WHEN 'PROPUESTA_EN_EJECUCION' THEN 7
    WHEN 'PROPUESTA_GANADA' THEN 8
    WHEN 'PROPUESTA_PERDIDA' THEN 9
    WHEN 'DESCARTADA' THEN 10
  END;

CREATE OR REPLACE VIEW vista_proximas_reuniones AS
SELECT
  o.id AS oportunidad_id,
  o.nombre AS oportunidad,
  o.fecha_proxima_reunion,
  c.nombre AS cliente,
  c.sector,
  r.nombre AS responsable,
  r.color AS responsable_color,
  o.situacion,
  o.presupuesto
FROM oportunidades o
JOIN clientes c ON c.id = o.cliente_id
LEFT JOIN responsables r ON r.id = o.responsable_id
WHERE o.fecha_proxima_reunion BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 days'
  AND o.archivada = FALSE
ORDER BY o.fecha_proxima_reunion ASC;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE responsables ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE etiquetas ENABLE ROW LEVEL SECURITY;
ALTER TABLE oportunidades_etiquetas ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura (usuarios autenticados ven todo)
DROP POLICY IF EXISTS "Authenticated users can read" ON responsables;
CREATE POLICY "Authenticated users can read" ON responsables FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can read" ON clientes;
CREATE POLICY "Authenticated users can read" ON clientes FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can read" ON oportunidades;
CREATE POLICY "Authenticated users can read" ON oportunidades FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can read" ON actividades;
CREATE POLICY "Authenticated users can read" ON actividades FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can read" ON etiquetas;
CREATE POLICY "Authenticated users can read" ON etiquetas FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can read" ON oportunidades_etiquetas;
CREATE POLICY "Authenticated users can read" ON oportunidades_etiquetas FOR SELECT TO authenticated USING (true);

-- Políticas de escritura (clientes)
DROP POLICY IF EXISTS "Authenticated users can insert" ON clientes;
CREATE POLICY "Authenticated users can insert" ON clientes FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON clientes;
CREATE POLICY "Authenticated users can update" ON clientes FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON clientes;
CREATE POLICY "Authenticated users can delete" ON clientes FOR DELETE TO authenticated USING (true);

-- Políticas de escritura (oportunidades)
DROP POLICY IF EXISTS "Authenticated users can insert" ON oportunidades;
CREATE POLICY "Authenticated users can insert" ON oportunidades FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON oportunidades;
CREATE POLICY "Authenticated users can update" ON oportunidades FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON oportunidades;
CREATE POLICY "Authenticated users can delete" ON oportunidades FOR DELETE TO authenticated USING (true);

-- Políticas de escritura (actividades)
DROP POLICY IF EXISTS "Authenticated users can insert" ON actividades;
CREATE POLICY "Authenticated users can insert" ON actividades FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON actividades;
CREATE POLICY "Authenticated users can update" ON actividades FOR UPDATE TO authenticated USING (true);
DROP POLICY IF EXISTS "Authenticated users can delete" ON actividades;
CREATE POLICY "Authenticated users can delete" ON actividades FOR DELETE TO authenticated USING (true);

-- Políticas de escritura (responsables)
DROP POLICY IF EXISTS "Authenticated users can insert" ON responsables;
CREATE POLICY "Authenticated users can insert" ON responsables FOR INSERT TO authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "Authenticated users can update" ON responsables;
CREATE POLICY "Authenticated users can update" ON responsables FOR UPDATE TO authenticated USING (true);

-- =====================================================
-- DATOS INICIALES (SEED)
-- =====================================================

INSERT INTO responsables (nombre, email, color) VALUES
  ('Javi',   'javi@imedes.es',   '#6366f1'),
  ('Emèrit', 'emerit@imedes.es', '#0ea5e9'),
  ('Kike',   'kike@imedes.es',   '#10b981'),
  ('Eva',    'eva@imedes.es',    '#f59e0b'),
  ('Andrea', 'andrea@imedes.es', '#ec4899')
ON CONFLICT (email) DO NOTHING;

INSERT INTO etiquetas (nombre, color) VALUES
  ('DANA', '#ef4444'),
  ('Licitación', '#f59e0b'),
  ('Prioritario', '#6366f1'),
  ('Costa', '#0ea5e9'),
  ('Infraestructura Verde', '#10b981')
ON CONFLICT (nombre) DO NOTHING;
