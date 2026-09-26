"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { esMusculo } from "@/lib/musculos";
import { TIPOS_EJERCICIO } from "@/lib/objetivos";
import { texto, type EstadoFormulario } from "@/lib/formulario";

export async function guardarEjercicio(id: number | null, _: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const nombre = texto(fd, "nombre");
  const tipo = texto(fd, "tipo");
  const principales = fd.getAll("principales").map(String).filter(esMusculo);
  const secundarios = fd.getAll("secundarios").map(String).filter((m) => esMusculo(m) && !principales.includes(m));
  if (!nombre) return { error: "El nombre del ejercicio es obligatorio." };
  if (!(tipo in TIPOS_EJERCICIO)) return { error: "Selecciona el tipo de ejercicio." };
  if (principales.length === 0) return { error: "Marca al menos un músculo principal." };

  const valores = [nombre, tipo, texto(fd, "equipo"), JSON.stringify(principales), JSON.stringify(secundarios), texto(fd, "descripcion")];
  if (id) {
    db().prepare(
      `UPDATE ejercicios SET nombre = ?, tipo = ?, equipo = ?, musculos_principales = ?, musculos_secundarios = ?, descripcion = ?
       WHERE id = ?`,
    ).run(...valores, id);
  } else {
    db().prepare(
      `INSERT INTO ejercicios (nombre, tipo, equipo, musculos_principales, musculos_secundarios, descripcion)
       VALUES (?, ?, ?, ?, ?, ?)`,
    ).run(...valores);
  }
  revalidatePath("/", "layout");
  redirect("/ejercicios");
}

export async function eliminarEjercicio(id: number, _estado: EstadoFormulario): Promise<EstadoFormulario> {
  const uso = db().prepare("SELECT COUNT(DISTINCT rutina_id) AS n FROM rutina_ejercicios WHERE ejercicio_id = ?").get(id) as { n: number };
  if (uso.n > 0) {
    return { error: `No se puede eliminar: se usa en ${uso.n} rutina${uso.n === 1 ? "" : "s"}. Quítalo de ellas primero.` };
  }
  db().prepare("DELETE FROM ejercicios WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect("/ejercicios");
}
