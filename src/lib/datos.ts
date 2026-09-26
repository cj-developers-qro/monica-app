// Consultas de lectura. Todas esperan a connection() para que Next.js no las
// ejecute durante el prerenderizado (node:sqlite es síncrono).
import { connection } from "next/server";
import { db } from "./db";
import type { PlanNutricional } from "./nutricion";
import type { Nivel, Objetivo, TipoEjercicio } from "./objetivos";

export type Onboarding = Record<string, string>;

export type Cliente = {
  id: number;
  nombre: string;
  edad: number | null;
  sexo: "F" | "M";
  estatura_cm: number | null;
  objetivo: Objetivo;
  onboarding: Onboarding;
  creado_en: string;
};

export type Medicion = {
  id: number;
  cliente_id: number;
  fecha: string;
  brazo_izq: number | null;
  brazo_der: number | null;
  pierna_izq: number | null;
  pierna_der: number | null;
  pantorrilla_izq: number | null;
  pantorrilla_der: number | null;
  cintura: number | null;
  cuello: number | null;
  cadera: number | null;
  notas: string | null;
};

export type Composicion = {
  id: number;
  cliente_id: number;
  fecha: string;
  peso_kg: number;
  estatura_cm: number | null;
  grasa_pct: number | null;
  musculo_pct: number | null;
  grasa_visceral: number | null;
  notas: string | null;
};

export type Ejercicio = {
  id: number;
  nombre: string;
  tipo: TipoEjercicio;
  equipo: string;
  musculos_principales: string[];
  musculos_secundarios: string[];
  descripcion: string;
};

export type Rutina = {
  id: number;
  nombre: string;
  objetivo: Objetivo;
  nivel: Nivel;
  dias_semana: number;
  descripcion: string;
  cliente_id: number | null;
  cliente_nombre: string | null;
  origen_id: number | null;
  imagen: string | null;
  actualizado_en: string;
};

export type ItemRutina = {
  id: number;
  ejercicio_id: number;
  dia: string;
  orden: number;
  series: number;
  repeticiones: string;
  descanso_seg: number;
  notas: string;
  ejercicio: Ejercicio;
};

export type RutinaConEjercicios = Rutina & { items: ItemRutina[] };

export type Asignacion = {
  id: number;
  cliente_id: number;
  rutina_id: number;
  fecha_inicio: string;
  fecha_fin: string | null;
  activa: number;
  notas: string;
  rutina: RutinaConEjercicios;
};

type Fila = Record<string, unknown>;

function aCliente(f: Fila): Cliente {
  return { ...(f as Omit<Cliente, "onboarding">), onboarding: JSON.parse(String(f.onboarding || "{}")) };
}

function aEjercicio(f: Fila): Ejercicio {
  return {
    ...(f as Omit<Ejercicio, "musculos_principales" | "musculos_secundarios">),
    musculos_principales: JSON.parse(String(f.musculos_principales)),
    musculos_secundarios: JSON.parse(String(f.musculos_secundarios)),
  };
}

// --- Clientes ---------------------------------------------------------------

export type ResumenCliente = Cliente & {
  ultimo_peso: number | null;
  ultima_grasa: number | null;
  rutina_activa: string | null;
};

export async function listarClientes(): Promise<ResumenCliente[]> {
  await connection();
  const filas = db()
    .prepare(
      `SELECT c.*,
         (SELECT peso_kg FROM composicion WHERE cliente_id = c.id ORDER BY fecha DESC, id DESC LIMIT 1) AS ultimo_peso,
         (SELECT grasa_pct FROM composicion WHERE cliente_id = c.id AND grasa_pct IS NOT NULL ORDER BY fecha DESC, id DESC LIMIT 1) AS ultima_grasa,
         (SELECT r.nombre FROM asignaciones a JOIN rutinas r ON r.id = a.rutina_id
            WHERE a.cliente_id = c.id AND a.activa = 1 ORDER BY a.fecha_inicio DESC LIMIT 1) AS rutina_activa
       FROM clientes c ORDER BY c.nombre`,
    )
    .all();
  return filas.map((f) => ({
    ...aCliente(f),
    ultimo_peso: f.ultimo_peso as number | null,
    ultima_grasa: f.ultima_grasa as number | null,
    rutina_activa: f.rutina_activa as string | null,
  }));
}

export async function obtenerCliente(id: number): Promise<Cliente | null> {
  await connection();
  const f = db().prepare("SELECT * FROM clientes WHERE id = ?").get(id);
  return f ? aCliente(f) : null;
}

export async function listarMediciones(clienteId: number): Promise<Medicion[]> {
  await connection();
  return db()
    .prepare("SELECT * FROM mediciones WHERE cliente_id = ? ORDER BY fecha, id")
    .all(clienteId) as Medicion[];
}

export async function listarComposicion(clienteId: number): Promise<Composicion[]> {
  await connection();
  return db()
    .prepare("SELECT * FROM composicion WHERE cliente_id = ? ORDER BY fecha, id")
    .all(clienteId) as Composicion[];
}

// --- Ejercicios -------------------------------------------------------------

export async function listarEjercicios(): Promise<(Ejercicio & { usos: number })[]> {
  await connection();
  return db()
    .prepare(
      `SELECT e.*, (SELECT COUNT(DISTINCT rutina_id) FROM rutina_ejercicios WHERE ejercicio_id = e.id) AS usos
       FROM ejercicios e ORDER BY e.nombre`,
    )
    .all()
    .map((f) => ({ ...aEjercicio(f), usos: Number(f.usos) }));
}

export async function obtenerEjercicio(id: number): Promise<Ejercicio | null> {
  await connection();
  const f = db().prepare("SELECT * FROM ejercicios WHERE id = ?").get(id);
  return f ? aEjercicio(f) : null;
}

// --- Rutinas ----------------------------------------------------------------

const SELECT_RUTINA = `SELECT r.*, c.nombre AS cliente_nombre FROM rutinas r LEFT JOIN clientes c ON c.id = r.cliente_id`;

function itemsDeRutinas(ids: number[]): Map<number, ItemRutina[]> {
  const mapa = new Map<number, ItemRutina[]>(ids.map((id) => [id, []]));
  if (ids.length === 0) return mapa;
  const filas = db()
    .prepare(
      `SELECT re.id, re.rutina_id, re.ejercicio_id, re.dia, re.orden, re.series, re.repeticiones, re.descanso_seg, re.notas,
              e.id AS e_id, e.nombre AS e_nombre, e.tipo AS e_tipo, e.equipo AS e_equipo,
              e.musculos_principales AS e_mp, e.musculos_secundarios AS e_ms, e.descripcion AS e_descripcion
       FROM rutina_ejercicios re JOIN ejercicios e ON e.id = re.ejercicio_id
       WHERE re.rutina_id IN (${ids.map(() => "?").join(",")})
       ORDER BY re.rutina_id, re.orden`,
    )
    .all(...ids);
  for (const f of filas) {
    mapa.get(Number(f.rutina_id))!.push({
      id: Number(f.id),
      ejercicio_id: Number(f.ejercicio_id),
      dia: String(f.dia),
      orden: Number(f.orden),
      series: Number(f.series),
      repeticiones: String(f.repeticiones),
      descanso_seg: Number(f.descanso_seg),
      notas: String(f.notas),
      ejercicio: aEjercicio({
        id: f.e_id, nombre: f.e_nombre, tipo: f.e_tipo, equipo: f.e_equipo,
        musculos_principales: f.e_mp, musculos_secundarios: f.e_ms, descripcion: f.e_descripcion,
      }),
    });
  }
  return mapa;
}

function conItems(rutinas: Rutina[]): RutinaConEjercicios[] {
  const items = itemsDeRutinas(rutinas.map((r) => r.id));
  return rutinas.map((r) => ({ ...r, items: items.get(r.id) ?? [] }));
}

/** Rutinas del catálogo (sin cliente) y, si se pide, también las personalizadas. */
export async function listarRutinas(opciones: { incluirPersonalizadas?: boolean } = {}): Promise<RutinaConEjercicios[]> {
  await connection();
  const filtro = opciones.incluirPersonalizadas ? "" : "WHERE r.cliente_id IS NULL";
  const rutinas = db().prepare(`${SELECT_RUTINA} ${filtro} ORDER BY r.cliente_id IS NOT NULL, r.objetivo, r.nombre`).all() as Rutina[];
  return conItems(rutinas);
}

export async function obtenerRutina(id: number): Promise<RutinaConEjercicios | null> {
  await connection();
  const r = db().prepare(`${SELECT_RUTINA} WHERE r.id = ?`).get(id) as Rutina | undefined;
  return r ? conItems([r])[0] : null;
}

export async function listarAsignaciones(clienteId: number): Promise<Asignacion[]> {
  await connection();
  const filas = db()
    .prepare("SELECT * FROM asignaciones WHERE cliente_id = ? ORDER BY activa DESC, fecha_inicio DESC, id DESC")
    .all(clienteId) as Omit<Asignacion, "rutina">[];
  const ids = [...new Set(filas.map((a) => a.rutina_id))];
  const rutinas = ids.length
    ? conItems(db().prepare(`${SELECT_RUTINA} WHERE r.id IN (${ids.map(() => "?").join(",")})`).all(...ids) as Rutina[])
    : [];
  const porId = new Map(rutinas.map((r) => [r.id, r]));
  return filas.map((a) => ({ ...a, rutina: porId.get(a.rutina_id)! }));
}

/** Agrupa los ejercicios de una rutina por día respetando el orden. */
export function agruparPorDia(items: ItemRutina[]) {
  const dias = new Map<string, ItemRutina[]>();
  for (const item of items) {
    const lista = dias.get(item.dia);
    if (lista) lista.push(item);
    else dias.set(item.dia, [item]);
  }
  return [...dias].map(([dia, items]) => ({ dia, items }));
}

// --- Nutrición --------------------------------------------------------------

export type RegistroPlan = {
  id: number;
  cliente_id: number;
  fecha_inicio: string;
  fecha_fin: string;
  notas: string;
  creado_en: string;
  plan: PlanNutricional;
};

export type Seguimiento = {
  id: number;
  cliente_id: number;
  plan_id: number | null;
  fecha: string;
  adherencia: number;
  agua_litros: number | null;
  energia: number | null;
  hambre: number | null;
  notas: string | null;
};

export async function listarPlanes(clienteId: number): Promise<Omit<RegistroPlan, "plan">[]> {
  await connection();
  return db()
    .prepare("SELECT id, cliente_id, fecha_inicio, fecha_fin, notas, creado_en FROM planes_nutricion WHERE cliente_id = ? ORDER BY fecha_inicio DESC, id DESC")
    .all(clienteId) as Omit<RegistroPlan, "plan">[];
}

export async function obtenerPlan(clienteId: number, id: number): Promise<RegistroPlan | null> {
  await connection();
  const f = db().prepare("SELECT * FROM planes_nutricion WHERE id = ? AND cliente_id = ?").get(id, clienteId);
  return f ? { ...(f as Omit<RegistroPlan, "plan">), plan: JSON.parse(String(f.plan)) } : null;
}

export async function listarSeguimiento(clienteId: number): Promise<Seguimiento[]> {
  await connection();
  return db()
    .prepare("SELECT * FROM seguimiento_nutricion WHERE cliente_id = ? ORDER BY fecha, id")
    .all(clienteId) as Seguimiento[];
}
