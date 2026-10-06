"use server";

import { revalidatePath } from "next/cache";
import { requerirAccesoCliente } from "@/lib/auth";
import { db } from "@/lib/db";
import { enTransaccion } from "@/lib/escritura";
import { fecha, hoy, numero, texto, type EstadoFormulario } from "@/lib/formulario";

type ItemDia = { id: number; ejercicio_id: number; nombre: string; orden: number };

const enRango = (v: number | null, min: number, max: number) => v == null || (v >= min && v <= max);

/**
 * Registra una sesión de la bitácora. Los ejercicios del día se leen de la rutina en el servidor
 * (no se confía en el formulario) y la rutina debe estar asignada al cliente.
 */
export async function registrarSesion(
  clienteId: number,
  rutinaId: number,
  dia: string,
  _estado: EstadoFormulario,
  fd: FormData,
): Promise<EstadoFormulario> {
  const usuario = await requerirAccesoCliente(clienteId);
  const rutina = db()
    .prepare(
      `SELECT r.nombre FROM asignaciones a JOIN rutinas r ON r.id = a.rutina_id
       WHERE a.cliente_id = ? AND a.rutina_id = ? AND a.activa = 1`,
    )
    .get(clienteId, rutinaId) as { nombre: string } | undefined;
  if (!rutina) return { error: "Esa rutina ya no está asignada; recarga la página." };

  const items = db()
    .prepare(
      `SELECT re.id, re.ejercicio_id, e.nombre, re.orden FROM rutina_ejercicios re JOIN ejercicios e ON e.id = re.ejercicio_id
       WHERE re.rutina_id = ? AND re.dia = ? ORDER BY re.orden`,
    )
    .all(rutinaId, dia) as ItemDia[];
  if (items.length === 0) return { error: "Ese día no existe en la rutina; recarga la página." };

  const dia_ = fecha(fd, "fecha");
  if (dia_ > hoy()) return { error: "La fecha no puede ser futura." };
  const esfuerzo = numero(fd, "esfuerzo");
  if (!enRango(esfuerzo, 1, 5)) return { error: "El esfuerzo va del 1 al 5." };

  const registros = items.map((i) => ({
    ...i,
    completado: texto(fd, `hecho_${i.id}`) === "si",
    series: numero(fd, `series_${i.id}`),
    repeticiones: numero(fd, `reps_${i.id}`),
    peso: numero(fd, `peso_${i.id}`),
  }));
  for (const r of registros) {
    if (!enRango(r.series, 0, 20) || !enRango(r.repeticiones, 0, 300) || !enRango(r.peso, 0, 500)) {
      return { error: `Revisa los números de «${r.nombre}»: series hasta 20, repeticiones hasta 300 y peso hasta 500 kg.` };
    }
  }
  const hechos = registros.filter((r) => r.completado).length;
  if (hechos === 0) return { error: "Marca al menos un ejercicio como hecho." };

  enTransaccion(() => {
    const sesionId = Number(
      db()
        .prepare(
          `INSERT INTO sesiones_entrenamiento (cliente_id, rutina_id, dia, rutina_nombre, fecha, esfuerzo, notas, registrado_por)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(clienteId, rutinaId, dia, rutina.nombre, dia_, esfuerzo == null ? null : Math.round(esfuerzo), texto(fd, "notas") || null, usuario.id)
        .lastInsertRowid,
    );
    const insertar = db().prepare(
      `INSERT INTO sesion_ejercicios (sesion_id, ejercicio_id, ejercicio_nombre, orden, completado, series, repeticiones, peso_kg)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    for (const r of registros) {
      insertar.run(
        sesionId, r.ejercicio_id, r.nombre, r.orden, r.completado ? 1 : 0,
        r.series == null ? null : Math.round(r.series), r.repeticiones == null ? null : Math.round(r.repeticiones), r.peso,
      );
    }
  });
  revalidatePath("/", "layout");
  return { ok: true, mensaje: `Sesión registrada: ${hechos} de ${items.length} ejercicios. ¡Buen trabajo! 💪` };
}

/** Borra una sesión (por si se registró por error). La administradora o el propio cliente. */
export async function eliminarSesion(clienteId: number, sesionId: number): Promise<void> {
  await requerirAccesoCliente(clienteId);
  db().prepare("DELETE FROM sesiones_entrenamiento WHERE id = ? AND cliente_id = ?").run(sesionId, clienteId);
  revalidatePath("/", "layout");
}
