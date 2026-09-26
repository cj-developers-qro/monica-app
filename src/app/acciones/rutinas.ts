"use server";

import { randomUUID } from "node:crypto";
import { unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/auth";
import { db, DIRECTORIO_IMAGENES } from "@/lib/db";
import { copiarRutina, enTransaccion } from "@/lib/escritura";
import { esNivel, esObjetivo } from "@/lib/objetivos";
import { entero, texto, type EstadoFormulario } from "@/lib/formulario";

const TIPOS_IMAGEN: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" };
const MAX_IMAGEN = 4 * 1024 * 1024;

type ItemEntrada = {
  ejercicio_id: number;
  dia: string;
  series: number;
  repeticiones: string;
  descanso_seg: number;
  notas: string;
};

function leerItems(fd: FormData): ItemEntrada[] | string {
  let crudo: unknown;
  try {
    crudo = JSON.parse(texto(fd, "items") || "[]");
  } catch {
    return "No se pudo leer la lista de ejercicios.";
  }
  if (!Array.isArray(crudo) || crudo.length === 0) return "Agrega al menos un ejercicio a la rutina.";
  const existe = db().prepare("SELECT 1 FROM ejercicios WHERE id = ?");
  const items: ItemEntrada[] = [];
  for (const i of crudo as Record<string, unknown>[]) {
    const ejercicio_id = Number(i.ejercicio_id);
    if (!existe.get(ejercicio_id)) return "Uno de los ejercicios ya no existe en el catálogo.";
    const dia = String(i.dia ?? "").trim();
    if (!dia) return "Cada ejercicio debe pertenecer a un día.";
    items.push({
      ejercicio_id,
      dia,
      series: Math.min(20, Math.max(1, Math.round(Number(i.series) || 1))),
      repeticiones: String(i.repeticiones ?? "").trim() || "10",
      descanso_seg: Math.min(600, Math.max(0, Math.round(Number(i.descanso_seg) || 0))),
      notas: String(i.notas ?? "").trim(),
    });
  }
  return items;
}

async function guardarImagen(archivo: File): Promise<string> {
  const nombre = `${randomUUID()}.${TIPOS_IMAGEN[archivo.type]}`;
  await writeFile(path.join(/*turbopackIgnore: true*/ DIRECTORIO_IMAGENES, nombre), Buffer.from(await archivo.arrayBuffer()));
  return nombre;
}

async function borrarImagen(nombre: string | null) {
  if (nombre) await unlink(path.join(/*turbopackIgnore: true*/ DIRECTORIO_IMAGENES, path.basename(nombre))).catch(() => {});
}

export async function guardarRutina(id: number | null, _: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const nombre = texto(fd, "nombre");
  const objetivo = texto(fd, "objetivo");
  const nivel = texto(fd, "nivel");
  if (!nombre) return { error: "El nombre de la rutina es obligatorio." };
  if (!esObjetivo(objetivo)) return { error: "Selecciona el objetivo que trabaja la rutina." };
  if (!esNivel(nivel)) return { error: "Selecciona el nivel." };
  const items = leerItems(fd);
  if (typeof items === "string") return { error: items };

  const archivo = fd.get("imagen");
  const hayArchivo = archivo instanceof File && archivo.size > 0;
  if (hayArchivo && !TIPOS_IMAGEN[archivo.type]) return { error: "La imagen debe ser PNG, JPG o WebP." };
  if (hayArchivo && archivo.size > MAX_IMAGEN) return { error: "La imagen no puede pesar más de 4 MB." };

  const anterior = id
    ? (db().prepare("SELECT imagen FROM rutinas WHERE id = ?").get(id) as { imagen: string | null } | undefined)
    : undefined;
  if (id && !anterior) return { error: "La rutina ya no existe." };

  let imagen = anterior?.imagen ?? null;
  const reemplazar = hayArchivo || texto(fd, "quitar_imagen") === "1";
  if (reemplazar) {
    await borrarImagen(imagen);
    imagen = hayArchivo ? await guardarImagen(archivo) : null;
  }

  const campos = [nombre, objetivo, nivel, entero(fd, "dias_semana", 3), texto(fd, "descripcion"), imagen] as const;
  const rutinaId = enTransaccion(() => {
    let rid = id;
    if (rid) {
      db().prepare(
        `UPDATE rutinas SET nombre = ?, objetivo = ?, nivel = ?, dias_semana = ?, descripcion = ?, imagen = ?,
           actualizado_en = datetime('now') WHERE id = ?`,
      ).run(...campos, rid);
      db().prepare("DELETE FROM rutina_ejercicios WHERE rutina_id = ?").run(rid);
    } else {
      rid = Number(
        db().prepare("INSERT INTO rutinas (nombre, objetivo, nivel, dias_semana, descripcion, imagen) VALUES (?, ?, ?, ?, ?, ?)")
          .run(...campos).lastInsertRowid,
      );
    }
    const insertar = db().prepare(
      `INSERT INTO rutina_ejercicios (rutina_id, ejercicio_id, dia, orden, series, repeticiones, descanso_seg, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    items.forEach((i, orden) =>
      insertar.run(rid, i.ejercicio_id, i.dia, orden, i.series, i.repeticiones, i.descanso_seg, i.notas),
    );
    return rid;
  });

  revalidatePath("/", "layout");
  redirect(`/rutinas/${rutinaId}`);
}

export async function duplicarRutina(rutinaId: number) {
  await requerirAdmin();
  const base = db().prepare("SELECT nombre FROM rutinas WHERE id = ?").get(rutinaId) as { nombre: string } | undefined;
  if (!base) throw new Error("La rutina no existe.");
  const id = enTransaccion(() => copiarRutina(rutinaId, `Copia de ${base.nombre}`, null));
  revalidatePath("/rutinas");
  redirect(`/rutinas/${id}/editar`);
}

export async function eliminarRutina(rutinaId: number) {
  await requerirAdmin();
  const r = db().prepare("SELECT imagen, cliente_id FROM rutinas WHERE id = ?").get(rutinaId) as
    | { imagen: string | null; cliente_id: number | null }
    | undefined;
  if (!r) redirect("/rutinas");
  db().prepare("DELETE FROM rutinas WHERE id = ?").run(rutinaId);
  await borrarImagen(r.imagen);
  revalidatePath("/", "layout");
  redirect(r.cliente_id ? `/clientes/${r.cliente_id}/rutinas` : "/rutinas");
}
