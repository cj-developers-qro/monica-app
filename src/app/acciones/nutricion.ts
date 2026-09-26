"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requerirAccesoCliente, requerirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { entero, fecha, numero, texto, type EstadoFormulario } from "@/lib/formulario";
import { ajusteAdaptativo, generarPlan } from "@/lib/nutricion";
import { esObjetivo } from "@/lib/objetivos";

type Fila = Record<string, unknown>;

export async function generarPlanNutricional(clienteId: number, _estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const cliente = db().prepare("SELECT * FROM clientes WHERE id = ?").get(clienteId) as Fila | undefined;
  if (!cliente || !esObjetivo(cliente.objetivo)) return { error: "El cliente no existe." };

  const composicion = db()
    .prepare("SELECT fecha, peso_kg, grasa_pct, estatura_cm FROM composicion WHERE cliente_id = ? ORDER BY fecha DESC, id DESC")
    .all(clienteId) as { fecha: string; peso_kg: number; grasa_pct: number | null; estatura_cm: number | null }[];
  if (composicion.length === 0) return { error: "Registra al menos un peso en Composición corporal para calcular el plan." };
  const actual = composicion[0];
  // El % de grasa solo se usa si es reciente (últimos 60 días), para no calcular con datos viejos.
  const grasa = composicion.find((c) => c.grasa_pct != null && Date.parse(actual.fecha) - Date.parse(c.fecha) <= 60 * 86_400_000);

  const rutina = db()
    .prepare(
      `SELECT r.dias_semana FROM asignaciones a JOIN rutinas r ON r.id = a.rutina_id
       WHERE a.cliente_id = ? AND a.activa = 1 ORDER BY a.fecha_inicio DESC LIMIT 1`,
    )
    .get(clienteId) as { dias_semana: number } | undefined;

  // Ajuste automático a partir del plan anterior: evolución del peso y adherencia registrada.
  const anterior = db()
    .prepare("SELECT id, fecha_inicio FROM planes_nutricion WHERE cliente_id = ? ORDER BY fecha_inicio DESC, id DESC LIMIT 1")
    .get(clienteId) as { id: number; fecha_inicio: string } | undefined;
  let adaptativo: { kcal: number; motivo: string | null } = { kcal: 0, motivo: null };
  if (anterior) {
    const pesos = composicion
      .filter((c) => c.fecha >= anterior.fecha_inicio)
      .reverse()
      .map((c) => ({ fecha: c.fecha, peso: c.peso_kg }));
    const { promedio } = db()
      .prepare("SELECT AVG(adherencia) AS promedio FROM seguimiento_nutricion WHERE plan_id = ?")
      .get(anterior.id) as { promedio: number | null };
    adaptativo = ajusteAdaptativo(cliente.objetivo, pesos, promedio);
  }
  const manual = numero(fd, "ajuste_kcal") ?? 0;
  if (Math.abs(manual) > 1000) return { error: "El ajuste manual debe estar entre −1000 y +1000 kcal." };
  const motivos = [adaptativo.motivo, manual ? `Ajuste manual: ${manual > 0 ? "+" : ""}${manual} kcal.` : null].filter(Boolean);

  const onboarding = JSON.parse(String(cliente.onboarding || "{}")) as Record<string, string>;
  const comidasDeclaradas = parseInt(onboarding.comidas_dia ?? "", 10);
  const plan = generarPlan({
    sexo: cliente.sexo as "F" | "M",
    edad: cliente.edad as number | null,
    estatura_cm: actual.estatura_cm ?? (cliente.estatura_cm as number | null),
    peso_kg: actual.peso_kg,
    grasa_pct: grasa?.grasa_pct ?? null,
    objetivo: cliente.objetivo,
    dias_entrenamiento: rutina?.dias_semana ?? 0,
    onboarding,
    fecha_inicio: fecha(fd, "fecha_inicio"),
    comidas_dia: entero(fd, "comidas_dia", Number.isFinite(comidasDeclaradas) ? comidasDeclaradas : 4),
    ajuste_kcal: adaptativo.kcal + manual,
    motivo_ajuste: motivos.length ? motivos.join(" ") : null,
    excluir: texto(fd, "excluir"),
  });

  const r = db()
    .prepare("INSERT INTO planes_nutricion (cliente_id, fecha_inicio, fecha_fin, plan, notas) VALUES (?, ?, ?, ?, ?)")
    .run(clienteId, plan.fecha_inicio, plan.fecha_fin, JSON.stringify(plan), texto(fd, "notas"));
  revalidatePath(`/clientes/${clienteId}`, "layout");
  redirect(`/clientes/${clienteId}/nutricion?plan=${r.lastInsertRowid}`);
}

export async function eliminarPlan(clienteId: number, id: number) {
  await requerirAdmin();
  db().prepare("DELETE FROM planes_nutricion WHERE id = ? AND cliente_id = ?").run(id, clienteId);
  revalidatePath(`/clientes/${clienteId}`, "layout");
  redirect(`/clientes/${clienteId}/nutricion`);
}

export async function registrarSeguimiento(clienteId: number, planId: number | null, _estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  // La administradora o el propio cliente desde su portal.
  await requerirAccesoCliente(clienteId);
  if (planId != null && !db().prepare("SELECT 1 FROM planes_nutricion WHERE id = ? AND cliente_id = ?").get(planId, clienteId)) {
    return { error: "El plan no pertenece a este cliente." };
  }
  const adherencia = numero(fd, "adherencia");
  if (adherencia == null || adherencia < 0 || adherencia > 100) return { error: "La adherencia debe ser un porcentaje entre 0 y 100." };
  const escala = (clave: string) => {
    const v = numero(fd, clave);
    return v == null ? null : Math.min(5, Math.max(1, Math.round(v)));
  };
  db()
    .prepare(
      `INSERT INTO seguimiento_nutricion (cliente_id, plan_id, fecha, adherencia, agua_litros, energia, hambre, notas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(clienteId, planId, fecha(fd, "fecha"), Math.round(adherencia), numero(fd, "agua_litros"), escala("energia"), escala("hambre"), texto(fd, "notas") || null);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function eliminarSeguimiento(clienteId: number, id: number) {
  await requerirAdmin();
  db().prepare("DELETE FROM seguimiento_nutricion WHERE id = ? AND cliente_id = ?").run(id, clienteId);
  revalidatePath(`/clientes/${clienteId}`, "layout");
}
