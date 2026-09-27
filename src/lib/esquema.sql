-- Esquema de la base de datos (lo aplica src/lib/db.ts al abrir la base, también desde los scripts).
-- Todas las sentencias son idempotentes: se ejecutan cada vez que se abre la base.

CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  edad INTEGER,
  sexo TEXT NOT NULL CHECK (sexo IN ('F', 'M')),
  estatura_cm REAL,
  objetivo TEXT NOT NULL,
  onboarding TEXT NOT NULL DEFAULT '{}',
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS mediciones (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  brazo_izq REAL, brazo_der REAL,
  pierna_izq REAL, pierna_der REAL,
  pantorrilla_izq REAL, pantorrilla_der REAL,
  cintura REAL, cuello REAL, cadera REAL,
  notas TEXT
);

CREATE TABLE IF NOT EXISTS composicion (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha TEXT NOT NULL,
  peso_kg REAL NOT NULL,
  estatura_cm REAL,
  grasa_pct REAL,
  musculo_pct REAL,
  grasa_visceral REAL,
  notas TEXT
);

CREATE TABLE IF NOT EXISTS ejercicios (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  tipo TEXT NOT NULL,
  equipo TEXT NOT NULL DEFAULT '',
  musculos_principales TEXT NOT NULL DEFAULT '[]',
  musculos_secundarios TEXT NOT NULL DEFAULT '[]',
  descripcion TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS rutinas (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  objetivo TEXT NOT NULL,
  nivel TEXT NOT NULL,
  dias_semana INTEGER NOT NULL DEFAULT 3,
  descripcion TEXT NOT NULL DEFAULT '',
  -- NULL = rutina del catálogo; con valor = rutina personalizada para ese cliente.
  cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
  origen_id INTEGER REFERENCES rutinas(id) ON DELETE SET NULL,
  -- Imagen propia opcional; si no hay, se genera el diagrama de músculos trabajados.
  imagen TEXT,
  actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rutina_ejercicios (
  id INTEGER PRIMARY KEY,
  rutina_id INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
  ejercicio_id INTEGER NOT NULL REFERENCES ejercicios(id) ON DELETE RESTRICT,
  dia TEXT NOT NULL,
  orden INTEGER NOT NULL,
  series INTEGER NOT NULL DEFAULT 3,
  repeticiones TEXT NOT NULL DEFAULT '10',
  descanso_seg INTEGER NOT NULL DEFAULT 60,
  notas TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS asignaciones (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  rutina_id INTEGER NOT NULL REFERENCES rutinas(id) ON DELETE CASCADE,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT,
  activa INTEGER NOT NULL DEFAULT 1,
  notas TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS planes_nutricion (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  fecha_inicio TEXT NOT NULL,
  fecha_fin TEXT NOT NULL,
  -- Documento JSON con el cálculo, los objetivos diarios y el menú de las 4 semanas.
  plan TEXT NOT NULL,
  notas TEXT NOT NULL DEFAULT '',
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS seguimiento_nutricion (
  id INTEGER PRIMARY KEY,
  cliente_id INTEGER NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES planes_nutricion(id) ON DELETE SET NULL,
  fecha TEXT NOT NULL,
  adherencia INTEGER NOT NULL,
  agua_litros REAL,
  energia INTEGER,
  hambre INTEGER,
  notas TEXT
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY,
  usuario TEXT NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL CHECK (rol IN ('admin', 'cliente')),
  -- Solo para rol cliente: el expediente al que tiene acceso.
  cliente_id INTEGER UNIQUE REFERENCES clientes(id) ON DELETE CASCADE,
  hash TEXT NOT NULL,
  debe_cambiar INTEGER NOT NULL DEFAULT 0,
  activo INTEGER NOT NULL DEFAULT 1,
  intentos_fallidos INTEGER NOT NULL DEFAULT 0,
  bloqueado_hasta TEXT,
  ultimo_acceso TEXT,
  creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sesiones (
  -- Se guarda el SHA-256 del token; el token solo vive en la cookie del navegador.
  token_hash TEXT PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  expira TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_planes_cliente ON planes_nutricion(cliente_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_seguimiento_cliente ON seguimiento_nutricion(cliente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_mediciones_cliente ON mediciones(cliente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_composicion_cliente ON composicion(cliente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_rutina_ejercicios ON rutina_ejercicios(rutina_id, orden);
CREATE INDEX IF NOT EXISTS idx_asignaciones_cliente ON asignaciones(cliente_id, activa);
