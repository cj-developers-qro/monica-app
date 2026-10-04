// Conexión a SQLite usando el módulo nativo de Node (node:sqlite), sin dependencias externas.
// El esquema se crea y el catálogo se siembra automáticamente la primera vez.
import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { EJERCICIOS_SEMILLA, RUTINAS_SEMILLA } from "./catalogo-semilla";

export const DIRECTORIO_DATOS = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
export const DIRECTORIO_IMAGENES = path.join(/*turbopackIgnore: true*/ DIRECTORIO_DATOS, "imagenes");

// El esquema vive en un archivo .sql; los cambios a bases existentes van en MIGRACIONES (abajo).
const ESQUEMA = readFileSync(path.join(process.cwd(), "src", "lib", "esquema.sql"), "utf8");

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

/**
 * Cambios de esquema para bases que ya existen (esquema.sql solo crea lo que falta).
 * Cada migración agrega una columna si todavía no está; se pueden añadir más al final.
 */
const MIGRACIONES: { tabla: string; columna: string; definicion: string }[] = [
  // Fecha y hora en que el cliente aceptó el aviso de privacidad (NULL = pendiente).
  { tabla: "usuarios", columna: "acepto_privacidad", definicion: "TEXT" },
  // Chat de Telegram donde la persona recibe avisos (NULL = no vinculado) y desde cuándo.
  { tabla: "usuarios", columna: "telegram_chat_id", definicion: "TEXT" },
  { tabla: "usuarios", columna: "telegram_vinculado_en", definicion: "TEXT" },
];

function migrar(db: DatabaseSync) {
  for (const { tabla, columna, definicion } of MIGRACIONES) {
    const columnas = db.prepare(`PRAGMA table_info(${tabla})`).all().map((c) => c.name);
    if (!columnas.includes(columna)) db.exec(`ALTER TABLE ${tabla} ADD COLUMN ${columna} ${definicion}`);
  }
}

function abrir() {
  mkdirSync(DIRECTORIO_IMAGENES, { recursive: true });
  const db = new DatabaseSync(path.join(/*turbopackIgnore: true*/ DIRECTORIO_DATOS, "app-deportiva.db"), { timeout: 5000 });
  db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
  db.exec(ESQUEMA);
  migrar(db);
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
