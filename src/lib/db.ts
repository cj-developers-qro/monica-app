// Conexión a SQLite usando el módulo nativo de Node (node:sqlite), sin dependencias externas.
// El esquema se crea y el catálogo se siembra automáticamente la primera vez.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { EJERCICIOS_SEMILLA, RUTINAS_SEMILLA } from "./catalogo-semilla";

export const DIRECTORIO_DATOS = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const DIRECTORIO_IMAGENES = path.join(/*turbopackIgnore: true*/ DIRECTORIO_DATOS, "imagenes");

const ESQUEMA = `
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

CREATE INDEX IF NOT EXISTS idx_planes_cliente ON planes_nutricion(cliente_id, fecha_inicio);
CREATE INDEX IF NOT EXISTS idx_seguimiento_cliente ON seguimiento_nutricion(cliente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_mediciones_cliente ON mediciones(cliente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_composicion_cliente ON composicion(cliente_id, fecha);
CREATE INDEX IF NOT EXISTS idx_rutina_ejercicios ON rutina_ejercicios(rutina_id, orden);
CREATE INDEX IF NOT EXISTS idx_asignaciones_cliente ON asignaciones(cliente_id, activa);
`;

function sembrarCatalogo(db: DatabaseSync) {
  const hay = db.prepare("SELECT COUNT(*) AS n FROM ejercicios").get() as { n: number };
  if (hay.n > 0) return;

  const insertarEjercicio = db.prepare(
    `INSERT INTO ejercicios (nombre, tipo, equipo, musculos_principales, musculos_secundarios, descripcion)
     VALUES (?, ?, ?, ?, ?, ?)`,
  );
  const insertarRutina = db.prepare(
    `INSERT INTO rutinas (nombre, objetivo, nivel, dias_semana, descripcion) VALUES (?, ?, ?, ?, ?)`,
  );
  const insertarItem = db.prepare(
    `INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, dia, orden, series, repeticiones, descanso_seg)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  );

  db.exec("BEGIN");
  try {
    const ids = new Map<string, number>();
    for (const e of EJERCICIOS_SEMILLA) {
      const r = insertarEjercicio.run(
        e.nombre, e.tipo, e.equipo, JSON.stringify(e.principales), JSON.stringify(e.secundarios), e.descripcion,
      );
      ids.set(e.clave, Number(r.lastInsertRowid));
    }
    for (const rutina of RUTINAS_SEMILLA) {
      const r = insertarRutina.run(rutina.nombre, rutina.objetivo, rutina.nivel, rutina.dias_semana, rutina.descripcion);
      const rutinaId = Number(r.lastInsertRowid);
      let orden = 0;
      for (const { dia, items } of rutina.dias) {
        for (const [clave, series, reps, descanso] of items) {
          const ejercicioId = ids.get(clave);
          if (!ejercicioId) throw new Error(`Ejercicio semilla desconocido: ${clave}`);
          insertarItem.run(rutinaId, ejercicioId, dia, orden++, series, reps, descanso);
        }
      }
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

function abrir() {
  mkdirSync(DIRECTORIO_IMAGENES, { recursive: true });
  const db = new DatabaseSync(path.join(/*turbopackIgnore: true*/ DIRECTORIO_DATOS, "app-deportiva.db"), { timeout: 5000 });
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(ESQUEMA);
  sembrarCatalogo(db);
  return db;
}

// La conexión se abre en el primer uso (no al importar el módulo, para no tocar la base durante el build)
// y se guarda en globalThis para reutilizarla entre recargas en desarrollo.
const global = globalThis as unknown as { __dbDeportiva?: DatabaseSync };

export function db(): DatabaseSync {
  global.__dbDeportiva ??= abrir();
  return global.__dbDeportiva;
}
