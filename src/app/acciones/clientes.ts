"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { CLAVES_ONBOARDING } from "@/lib/cuestionario";
import { esObjetivo } from "@/lib/objetivos";
import { entero, fecha, hoy, numero, texto, type EstadoFormulario } from "@/lib/formulario";
import { copiarRutina, enTransaccion } from "@/lib/escritura";

function leerCliente(fd: FormData) {
  const nombre = texto(fd, "nombre");
  const sexo = texto(fd, "sexo");
  const objetivo = texto(fd, "objetivo");
  if (!nombre) return { error: "El nombre es obligatorio." } as const;
  if (sexo !== "F" && sexo !== "M") return { error: "Selecciona el sexo." } as const;
  if (!esObjetivo(objetivo)) return { error: "Selecciona el objetivo principal." } as const;

  const onboarding: Record<string, string> = {};
  for (const clave of CLAVES_ONBOARDING) {
    const v = texto(fd, clave);
    if (v) onboarding[clave] = v;
  }
  return {
    datos: {
      nombre,
      sexo,
      objetivo,
      edad: numero(fd, "edad"),
      estatura_cm: numero(fd, "estatura_cm"),
      onboarding: JSON.stringify(onboarding),
    },
  } as const;
}

export async function crearCliente(_: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const r = leerCliente(fd);
  if ("error" in r) return { error: r.error };
  const { nombre, sexo, objetivo, edad, estatura_cm, onboarding } = r.datos;
  const peso = numero(fd, "peso_kg");

  const res = db()
    .prepare("INSERT INTO clientes (nombre, sexo, objetivo, edad, estatura_cm, onboarding) VALUES (?, ?, ?, ?, ?, ?)")
    .run(nombre, sexo, objetivo, edad, estatura_cm, onboarding);
  const id = Number(res.lastInsertRowid);

  // La biometría inicial se convierte en el primer registro de composición corporal.
  if (peso != null) {
    db().prepare("INSERT INTO composicion (cliente_id, fecha, peso_kg, estatura_cm, notas) VALUES (?, ?, ?, ?, ?)")
      .run(id, fecha(fd, "fecha"), peso, estatura_cm, "Registro inicial (onboarding)");
  }
  revalidatePath("/");
  redirect(`/clientes/${id}`);
}

export async function actualizarCliente(id: number, _: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const r = leerCliente(fd);
  if ("error" in r) return { error: r.error };
  const { nombre, sexo, objetivo, edad, estatura_cm, onboarding } = r.datos;
  db().prepare("UPDATE clientes SET nombre = ?, sexo = ?, objetivo = ?, edad = ?, estatura_cm = ?, onboarding = ? WHERE id = ?")
    .run(nombre, sexo, objetivo, edad, estatura_cm, onboarding, id);
  revalidatePath("/", "layout");
  redirect(`/clientes/${id}`);
}

export async function eliminarCliente(id: number) {
  await requerirAdmin();
  db().prepare("DELETE FROM clientes WHERE id = ?").run(id);
  revalidatePath("/", "layout");
  redirect("/");
}

// --- Antropometría ------------------------------------------------------------

const CAMPOS_MEDICION = [
  "brazo_izq", "brazo_der", "pierna_izq", "pierna_der", "pantorrilla_izq", "pantorrilla_der", "cintura", "cuello", "cadera",
] as const;

export async function registrarMedicion(clienteId: number, _: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const valores = CAMPOS_MEDICION.map((c) => numero(fd, c));
  if (valores.every((v) => v == null)) return { error: "Captura al menos una medida." };
  if (valores.some((v) => v != null && (v <= 0 || v > 250))) return { error: "Las medidas deben estar en centímetros (0–250)." };
  db().prepare(
    `INSERT INTO mediciones (cliente_id, fecha, ${CAMPOS_MEDICION.join(", ")}, notas)
     VALUES (?, ?, ${CAMPOS_MEDICION.map(() => "?").join(", ")}, ?)`,
  ).run(clienteId, fecha(fd, "fecha"), ...valores, texto(fd, "notas") || null);
  revalidatePath(`/clientes/${clienteId}`, "layout");
  return { ok: true };
}

export async function eliminarMedicion(clienteId: number, id: number) {
  await requerirAdmin();
  db().prepare("DELETE FROM mediciones WHERE id = ? AND cliente_id = ?").run(id, clienteId);
  revalidatePath(`/clientes/${clienteId}`, "layout");
}

// --- Composición corporal ------------------------------------------------------

export async function registrarComposicion(clienteId: number, _: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const peso = numero(fd, "peso_kg");
  const grasa = numero(fd, "grasa_pct");
  const musculo = numero(fd, "musculo_pct");
  if (peso == null || peso <= 0 || peso > 400) return { error: "El peso es obligatorio (kg)." };
  for (const [nombre, v] of [["grasa", grasa], ["músculo", musculo]] as const) {
    if (v != null && (v <= 0 || v >= 100)) return { error: `El % de ${nombre} debe estar entre 0 y 100.` };
  }
  if (grasa != null && musculo != null && grasa + musculo > 100) {
    return { error: "La suma de % de grasa y % de músculo no puede superar 100." };
  }
  db().prepare(
    `INSERT INTO composicion (cliente_id, fecha, peso_kg, estatura_cm, grasa_pct, musculo_pct, grasa_visceral, notas)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(clienteId, fecha(fd, "fecha"), peso, numero(fd, "estatura_cm"), grasa, musculo, numero(fd, "grasa_visceral"), texto(fd, "notas") || null);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function eliminarComposicion(clienteId: number, id: number) {
  await requerirAdmin();
  db().prepare("DELETE FROM composicion WHERE id = ? AND cliente_id = ?").run(id, clienteId);
  revalidatePath("/", "layout");
}

// --- Rutinas del cliente --------------------------------------------------------

function activarRutina(clienteId: number, rutinaId: number, inicio: string, notas = "") {
  db().prepare("UPDATE asignaciones SET activa = 0, fecha_fin = ? WHERE cliente_id = ? AND activa = 1").run(inicio, clienteId);
  db().prepare("INSERT INTO asignaciones (cliente_id, rutina_id, fecha_inicio, notas) VALUES (?, ?, ?, ?)")
    .run(clienteId, rutinaId, inicio, notas);
}

export async function asignarRutina(clienteId: number, fd: FormData) {
  await requerirAdmin();
  const rutinaId = entero(fd, "rutina_id", 0);
  const existe = db().prepare("SELECT 1 FROM rutinas WHERE id = ?").get(rutinaId);
  if (!existe) throw new Error("La rutina no existe.");
  activarRutina(clienteId, rutinaId, fecha(fd, "fecha_inicio"), texto(fd, "notas"));
  revalidatePath("/", "layout");
}

/** Copia una rutina del catálogo como rutina propia del cliente, la activa y abre el editor. */
export async function personalizarRutina(clienteId: number, rutinaId: number) {
  await requerirAdmin();
  const cliente = db().prepare("SELECT nombre FROM clientes WHERE id = ?").get(clienteId) as { nombre: string } | undefined;
  const base = db().prepare("SELECT * FROM rutinas WHERE id = ?").get(rutinaId) as Record<string, string | number> | undefined;
  if (!cliente || !base) throw new Error("Cliente o rutina inexistente.");

  const nuevaId = enTransaccion(() => {
    const id = copiarRutina(rutinaId, `${base.nombre} · ${cliente.nombre.split(" ")[0]}`, clienteId);
    activarRutina(clienteId, id, hoy(), "Personalizada a partir del catálogo");
    return id;
  });
  revalidatePath("/", "layout");
  redirect(`/rutinas/${nuevaId}/editar`);
}

export async function finalizarAsignacion(clienteId: number, id: number) {
  await requerirAdmin();
  db().prepare("UPDATE asignaciones SET activa = 0, fecha_fin = date('now', 'localtime') WHERE id = ? AND cliente_id = ?").run(id, clienteId);
  revalidatePath("/", "layout");
}

export async function eliminarAsignacion(clienteId: number, id: number) {
  await requerirAdmin();
  db().prepare("DELETE FROM asignaciones WHERE id = ? AND cliente_id = ?").run(id, clienteId);
  revalidatePath("/", "layout");
}
