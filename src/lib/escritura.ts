// Operaciones de escritura compartidas por varias acciones del servidor.
import { db } from "./db";

/** Copia una rutina con todos sus ejercicios. Debe llamarse dentro de una transacción. */
export function copiarRutina(rutinaId: number, nombre: string, clienteId: number | null): number {
  const r = db()
    .prepare(
      `INSERT INTO rutinas (nombre, objetivo, nivel, dias_semana, descripcion, cliente_id, origen_id)
       SELECT ?, objetivo, nivel, dias_semana, descripcion, ?, id FROM rutinas WHERE id = ?`,
    )
    .run(nombre, clienteId, rutinaId);
  const nuevaId = Number(r.lastInsertRowid);
  db().prepare(
    `INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, dia, orden, series, repeticiones, descanso_seg, notas)
     SELECT ?, ejercicio_id, dia, orden, series, repeticiones, descanso_seg, notas FROM rutina_ejercicios WHERE rutina_id = ?`,
  ).run(nuevaId, rutinaId);
  return nuevaId;
}

/** Ejecuta la función dentro de una transacción de SQLite. */
export function enTransaccion<T>(fn: () => T): T {
  db().exec("BEGIN");
  try {
    const resultado = fn();
    db().exec("COMMIT");
    return resultado;
  } catch (error) {
    db().exec("ROLLBACK");
    throw error;
  }
}
