// Consultas de lectura (capa de acceso a datos). Cada consulta verifica primero la sesión:
// las de catálogo y listado general son solo para la administradora; las de un expediente
// permiten a la administradora o al propio cliente. Así ninguna página puede mostrar datos
// ajenos aunque se olvide una verificación en la interfaz.
import { connection } from "next/server";
import { requerirAccesoCliente, requerirAdmin, type Usuario } from "./auth";
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
  video_url: string | null;
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
  /** null = sin acceso a la app; 1 = activo; 0 = desactivado. */
  acceso: number | null;
};

export async function listarClientes(): Promise<ResumenCliente[]> {
  await connection();
  await requerirAdmin();
  const filas = db()
    .prepare(
      `SELECT c.*,
         (SELECT peso_kg FROM composicion WHERE cliente_id = c.id ORDER BY fecha DESC, id DESC LIMIT 1) AS ultimo_peso,
         (SELECT grasa_pct FROM composicion WHERE cliente_id = c.id AND grasa_pct IS NOT NULL ORDER BY fecha DESC, id DESC LIMIT 1) AS ultima_grasa,
         (SELECT r.nombre FROM asignaciones a JOIN rutinas r ON r.id = a.rutina_id
            WHERE a.cliente_id = c.id AND a.activa = 1 ORDER BY a.fecha_inicio DESC LIMIT 1) AS rutina_activa,
         (SELECT activo FROM usuarios WHERE cliente_id = c.id) AS acceso
       FROM clientes c ORDER BY c.nombre`,
    )
    .all();
  return filas.map((f) => ({
    ...aCliente(f),
    ultimo_peso: f.ultimo_peso as number | null,
    ultima_grasa: f.ultima_grasa as number | null,
    rutina_activa: f.rutina_activa as string | null,
    acceso: f.acceso as number | null,
  }));
}

export async function obtenerCliente(id: number): Promise<Cliente | null> {
  await connection();
  await requerirAccesoCliente(id);
  const f = db().prepare("SELECT * FROM clientes WHERE id = ?").get(id);
  return f ? aCliente(f) : null;
}

export async function listarMediciones(clienteId: number): Promise<Medicion[]> {
  await connection();
  await requerirAccesoCliente(clienteId);
  return db()
    .prepare("SELECT * FROM mediciones WHERE cliente_id = ? ORDER BY fecha, id")
    .all(clienteId) as Medicion[];
}

export async function listarComposicion(clienteId: number): Promise<Composicion[]> {
  await connection();
  await requerirAccesoCliente(clienteId);
  return db()
    .prepare("SELECT * FROM composicion WHERE cliente_id = ? ORDER BY fecha, id")
    .all(clienteId) as Composicion[];
}

// --- Ejercicios -------------------------------------------------------------

export async function listarEjercicios(): Promise<(Ejercicio & { usos: number })[]> {
  await connection();
  await requerirAdmin();
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
  await requerirAdmin();
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
              e.musculos_principales AS e_mp, e.musculos_secundarios AS e_ms, e.descripcion AS e_descripcion, e.video_url AS e_video
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
        musculos_principales: f.e_mp, musculos_secundarios: f.e_ms, descripcion: f.e_descripcion, video_url: f.e_video,
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
  await requerirAdmin();
  const filtro = opciones.incluirPersonalizadas ? "" : "WHERE r.cliente_id IS NULL";
  const rutinas = db().prepare(`${SELECT_RUTINA} ${filtro} ORDER BY r.cliente_id IS NOT NULL, r.objetivo, r.nombre`).all() as Rutina[];
  return conItems(rutinas);
}

export async function obtenerRutina(id: number): Promise<RutinaConEjercicios | null> {
  await connection();
  await requerirAdmin();
  const r = db().prepare(`${SELECT_RUTINA} WHERE r.id = ?`).get(id) as Rutina | undefined;
  return r ? conItems([r])[0] : null;
}

export async function listarAsignaciones(clienteId: number): Promise<Asignacion[]> {
  await connection();
  await requerirAccesoCliente(clienteId);
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
  await requerirAccesoCliente(clienteId);
  return db()
    .prepare("SELECT id, cliente_id, fecha_inicio, fecha_fin, notas, creado_en FROM planes_nutricion WHERE cliente_id = ? ORDER BY fecha_inicio DESC, id DESC")
    .all(clienteId) as Omit<RegistroPlan, "plan">[];
}

export async function obtenerPlan(clienteId: number, id: number): Promise<RegistroPlan | null> {
  await connection();
  await requerirAccesoCliente(clienteId);
  const f = db().prepare("SELECT * FROM planes_nutricion WHERE id = ? AND cliente_id = ?").get(id, clienteId);
  return f ? { ...(f as Omit<RegistroPlan, "plan">), plan: JSON.parse(String(f.plan)) } : null;
}

export async function listarSeguimiento(clienteId: number): Promise<Seguimiento[]> {
  await connection();
  await requerirAccesoCliente(clienteId);
  return db()
    .prepare("SELECT * FROM seguimiento_nutricion WHERE cliente_id = ? ORDER BY fecha, id")
    .all(clienteId) as Seguimiento[];
}

/**
 * Rutina para servir su imagen: la administradora puede ver cualquiera; un cliente, solo
 * las que tiene o tuvo asignadas.
 */
export async function obtenerRutinaVisible(id: number, usuario: Usuario): Promise<RutinaConEjercicios | null> {
  await connection();
  if (usuario.rol !== "admin") {
    const asignada = db().prepare("SELECT 1 FROM asignaciones WHERE rutina_id = ? AND cliente_id = ?").get(id, usuario.cliente_id);
    if (!asignada) return null;
  }
  const r = db().prepare(`${SELECT_RUTINA} WHERE r.id = ?`).get(id) as Rutina | undefined;
  return r ? conItems([r])[0] : null;
}

/** Datos de acceso del cliente (sin el hash de la contraseña). Solo la administradora. */
export async function obtenerAcceso(clienteId: number) {
  await connection();
  await requerirAdmin();
  return (
    (db()
      .prepare(
        "SELECT id, usuario, activo, debe_cambiar, ultimo_acceso, bloqueado_hasta, acepto_privacidad, telegram_vinculado_en FROM usuarios WHERE cliente_id = ?",
      )
      .get(clienteId) as
      | {
          id: number;
          usuario: string;
          activo: number;
          debe_cambiar: number;
          ultimo_acceso: string | null;
          bloqueado_hasta: string | null;
          acepto_privacidad: string | null;
          telegram_vinculado_en: string | null;
        }
      | undefined) ?? null
  );
}

// --- Avisos (Telegram) --------------------------------------------------------------

export type VinculoTelegram = { cliente_id: number; nombre: string; telegram_vinculado_en: string | null };

/** Clientes con acceso activo y si tienen Telegram vinculado. Solo la administradora. */
export async function listarVinculosTelegram(): Promise<VinculoTelegram[]> {
  await connection();
  await requerirAdmin();
  return db()
    .prepare(
      `SELECT c.id AS cliente_id, c.nombre, u.telegram_vinculado_en
       FROM usuarios u JOIN clientes c ON c.id = u.cliente_id
       WHERE u.rol = 'cliente' AND u.activo = 1 ORDER BY u.telegram_vinculado_en IS NULL, c.nombre`,
    )
    .all() as VinculoTelegram[];
}

export type RegistroAviso = { id: number; nombre: string | null; tipo: string; estado: string; error: string | null; creado_en: string };

/** Últimos avisos enviados. Solo la administradora. */
export async function listarAvisos(limite = 30): Promise<RegistroAviso[]> {
  await connection();
  await requerirAdmin();
  return db()
    .prepare(
      `SELECT n.id, u.nombre, n.tipo, n.estado, n.error, n.creado_en
       FROM notificaciones n LEFT JOIN usuarios u ON u.id = n.usuario_id ORDER BY n.id DESC LIMIT ?`,
    )
    .all(limite) as RegistroAviso[];
}

// --- Bitácora de entrenamiento ---------------------------------------------------------

export type EjercicioSesion = {
  ejercicio_id: number | null;
  ejercicio_nombre: string;
  completado: number;
  series: number | null;
  repeticiones: number | null;
  peso_kg: number | null;
};

export type SesionEntrenamiento = {
  id: number;
  dia: string;
  rutina_nombre: string;
  fecha: string;
  esfuerzo: number | null;
  notas: string | null;
  registrado_por_rol: string | null;
  ejercicios: EjercicioSesion[];
};

/** Sesiones registradas por el cliente, de la más reciente a la más antigua. */
export async function listarSesiones(clienteId: number, limite = 40): Promise<SesionEntrenamiento[]> {
  await connection();
  await requerirAccesoCliente(clienteId);
  const sesiones = db()
    .prepare(
      `SELECT s.id, s.dia, s.rutina_nombre, s.fecha, s.esfuerzo, s.notas, u.rol AS registrado_por_rol
       FROM sesiones_entrenamiento s LEFT JOIN usuarios u ON u.id = s.registrado_por
       WHERE s.cliente_id = ? ORDER BY s.fecha DESC, s.id DESC LIMIT ?`,
    )
    .all(clienteId, limite) as Omit<SesionEntrenamiento, "ejercicios">[];
  if (sesiones.length === 0) return [];
  const ejercicios = db()
    .prepare(
      `SELECT sesion_id, ejercicio_id, ejercicio_nombre, completado, series, repeticiones, peso_kg
       FROM sesion_ejercicios WHERE sesion_id IN (${sesiones.map(() => "?").join(",")}) ORDER BY sesion_id, orden`,
    )
    .all(...sesiones.map((s) => s.id)) as (EjercicioSesion & { sesion_id: number })[];
  return sesiones.map((s) => ({ ...s, ejercicios: ejercicios.filter((e) => e.sesion_id === s.id) }));
}

export type MarcaEjercicio = {
  ejercicio_id: number;
  ejercicio_nombre: string;
  sesiones: number;
  ultima_fecha: string;
  ultimo_series: number | null;
  ultimo_reps: number | null;
  ultimo_peso: number | null;
  primer_peso: number | null;
  mejor_peso: number | null;
};

/** Por ejercicio: lo último que se registró, la primera y la mejor carga (solo series completadas). */
export async function marcasPorEjercicio(clienteId: number): Promise<MarcaEjercicio[]> {
  await connection();
  await requerirAccesoCliente(clienteId);
  return db()
    .prepare(
      `WITH registros AS (
         SELECT e.ejercicio_id, e.ejercicio_nombre, e.series, e.repeticiones, e.peso_kg, s.fecha, s.id AS sesion_id,
                ROW_NUMBER() OVER (PARTITION BY e.ejercicio_id ORDER BY s.fecha DESC, s.id DESC) AS reciente,
                ROW_NUMBER() OVER (PARTITION BY e.ejercicio_id ORDER BY s.fecha ASC, s.id ASC) AS antiguo
         FROM sesion_ejercicios e JOIN sesiones_entrenamiento s ON s.id = e.sesion_id
         WHERE s.cliente_id = ? AND e.completado = 1 AND e.ejercicio_id IS NOT NULL
       )
       SELECT ejercicio_id,
              MAX(CASE WHEN reciente = 1 THEN ejercicio_nombre END) AS ejercicio_nombre,
              COUNT(*) AS sesiones,
              MAX(fecha) AS ultima_fecha,
              MAX(CASE WHEN reciente = 1 THEN series END) AS ultimo_series,
              MAX(CASE WHEN reciente = 1 THEN repeticiones END) AS ultimo_reps,
              MAX(CASE WHEN reciente = 1 THEN peso_kg END) AS ultimo_peso,
              MAX(CASE WHEN antiguo = 1 THEN peso_kg END) AS primer_peso,
              MAX(peso_kg) AS mejor_peso
       FROM registros GROUP BY ejercicio_id ORDER BY ejercicio_nombre`,
    )
    .all(clienteId) as MarcaEjercicio[];
}

// --- Panel "Hoy" de la administradora -----------------------------------------------------

export type PendienteCliente = { cliente_id: number; nombre: string; detalle: string | null };
export type ActividadReciente = { cliente_id: number; nombre: string; tipo: "seguimiento" | "sesion"; fecha: string; detalle: string };

export type PanelHoy = {
  resumen: { clientes: number; sesionesSemana: number; seguimientosSemana: number; adherenciaPromedio: number | null };
  seguimientoPendiente: PendienteCliente[];
  medicionPendiente: PendienteCliente[];
  sinPlan: PendienteCliente[];
  planPorVencer: PendienteCliente[];
  sinRutina: PendienteCliente[];
  adherenciaBaja: PendienteCliente[];
  sinEntrenar: PendienteCliente[];
  accesoPendiente: PendienteCliente[];
  actividad: ActividadReciente[];
};

// Clientes que se atienden: sin acceso a la app o con acceso activo (excluye las bajas temporales).
const ACTIVOS = `WITH activos AS (
  SELECT c.id, c.nombre FROM clientes c LEFT JOIN usuarios u ON u.cliente_id = c.id
  WHERE u.id IS NULL OR u.activo = 1
), hoy AS (SELECT date('now', 'localtime') AS d)`;
const VIGENTE = `EXISTS (SELECT 1 FROM planes_nutricion p, hoy WHERE p.cliente_id = a.id AND p.fecha_inicio <= hoy.d AND p.fecha_fin >= hoy.d)`;

/** Pendientes y actividad reciente para la pantalla "Hoy". Solo la administradora. */
export async function panelHoy(): Promise<PanelHoy> {
  await connection();
  await requerirAdmin();
  const lista = (sql: string) => db().prepare(`${ACTIVOS} ${sql}`).all() as PendienteCliente[];

  const resumen = db()
    .prepare(
      `${ACTIVOS} SELECT
         (SELECT COUNT(*) FROM activos) AS clientes,
         (SELECT COUNT(*) FROM sesiones_entrenamiento, hoy WHERE fecha >= date(hoy.d, '-6 days')) AS sesionesSemana,
         (SELECT COUNT(*) FROM seguimiento_nutricion, hoy WHERE fecha >= date(hoy.d, '-6 days')) AS seguimientosSemana,
         (SELECT ROUND(AVG(adherencia)) FROM seguimiento_nutricion, hoy WHERE fecha >= date(hoy.d, '-27 days')) AS adherenciaPromedio`,
    )
    .get() as PanelHoy["resumen"];

  return {
    resumen,
    seguimientoPendiente: lista(
      `SELECT a.id AS cliente_id, a.nombre,
         (SELECT 'Último registro: ' || MAX(s.fecha) FROM seguimiento_nutricion s WHERE s.cliente_id = a.id) AS detalle
       FROM activos a, hoy WHERE ${VIGENTE}
         AND NOT EXISTS (SELECT 1 FROM seguimiento_nutricion s WHERE s.cliente_id = a.id AND s.fecha >= date(hoy.d, '-6 days'))
       ORDER BY a.nombre`,
    ),
    medicionPendiente: lista(
      `SELECT a.id AS cliente_id, a.nombre,
         CASE WHEN m.ultima IS NULL THEN 'Sin medición de composición'
              ELSE 'Última medición hace ' || CAST(julianday(hoy.d) - julianday(m.ultima) AS INTEGER) || ' días' END AS detalle
       FROM activos a CROSS JOIN hoy
       LEFT JOIN (SELECT cliente_id, MAX(fecha) AS ultima FROM composicion WHERE grasa_pct IS NOT NULL GROUP BY cliente_id) m ON m.cliente_id = a.id
       WHERE m.ultima IS NULL OR m.ultima < date(hoy.d, '-28 days')
       ORDER BY m.ultima IS NOT NULL, m.ultima, a.nombre`,
    ),
    sinPlan: lista(
      `SELECT a.id AS cliente_id, a.nombre,
         (SELECT 'Su último plan terminó el ' || MAX(p.fecha_fin) FROM planes_nutricion p WHERE p.cliente_id = a.id) AS detalle
       FROM activos a, hoy WHERE NOT ${VIGENTE}
         AND NOT EXISTS (SELECT 1 FROM planes_nutricion p WHERE p.cliente_id = a.id AND p.fecha_inicio > hoy.d)
       ORDER BY a.nombre`,
    ),
    planPorVencer: lista(
      `SELECT a.id AS cliente_id, a.nombre, 'Termina el ' || p.fecha_fin AS detalle
       FROM activos a CROSS JOIN hoy JOIN planes_nutricion p ON p.cliente_id = a.id
       WHERE p.fecha_inicio <= hoy.d AND p.fecha_fin >= hoy.d AND p.fecha_fin <= date(hoy.d, '+5 days')
         AND NOT EXISTS (SELECT 1 FROM planes_nutricion q WHERE q.cliente_id = a.id AND q.fecha_inicio > p.fecha_fin)
       ORDER BY p.fecha_fin`,
    ),
    sinRutina: lista(
      `SELECT a.id AS cliente_id, a.nombre, NULL AS detalle FROM activos a
       WHERE NOT EXISTS (SELECT 1 FROM asignaciones s WHERE s.cliente_id = a.id AND s.activa = 1) ORDER BY a.nombre`,
    ),
    adherenciaBaja: lista(
      `SELECT a.id AS cliente_id, a.nombre, 'Última semana: ' || s.adherencia || ' %' AS detalle
       FROM activos a CROSS JOIN hoy JOIN seguimiento_nutricion s ON s.cliente_id = a.id
       WHERE s.id = (SELECT id FROM seguimiento_nutricion WHERE cliente_id = a.id ORDER BY fecha DESC, id DESC LIMIT 1)
         AND s.fecha >= date(hoy.d, '-20 days') AND s.adherencia < 60
       ORDER BY s.adherencia`,
    ),
    sinEntrenar: lista(
      `SELECT a.id AS cliente_id, a.nombre,
         'Última sesión hace ' || CAST(julianday(hoy.d) - julianday(MAX(e.fecha)) AS INTEGER) || ' días' AS detalle
       FROM activos a CROSS JOIN hoy JOIN sesiones_entrenamiento e ON e.cliente_id = a.id
       GROUP BY a.id HAVING MAX(e.fecha) < date(hoy.d, '-7 days') ORDER BY MAX(e.fecha)`,
    ),
    accesoPendiente: lista(
      `SELECT a.id AS cliente_id, a.nombre,
         CASE WHEN u.id IS NULL THEN 'Sin acceso a la app'
              WHEN u.debe_cambiar = 1 THEN 'Aún no entra por primera vez'
              ELSE 'No ha aceptado el aviso de privacidad' END AS detalle
       FROM activos a LEFT JOIN usuarios u ON u.cliente_id = a.id
       WHERE u.id IS NULL OR u.debe_cambiar = 1 OR u.acepto_privacidad IS NULL ORDER BY a.nombre`,
    ),
    actividad: db()
      .prepare(
        `${ACTIVOS}
         SELECT * FROM (
           SELECT a.id AS cliente_id, a.nombre, 'seguimiento' AS tipo, s.fecha, 'Registró su semana: ' || s.adherencia || ' % de adherencia' AS detalle, s.id AS orden
           FROM seguimiento_nutricion s JOIN activos a ON a.id = s.cliente_id, hoy WHERE s.fecha >= date(hoy.d, '-6 days')
           UNION ALL
           SELECT a.id, a.nombre, 'sesion', e.fecha,
             'Entrenó ' || e.dia || ' (' || (SELECT SUM(completado) FROM sesion_ejercicios WHERE sesion_id = e.id) || '/' ||
             (SELECT COUNT(*) FROM sesion_ejercicios WHERE sesion_id = e.id) || ' ejercicios)', e.id
           FROM sesiones_entrenamiento e JOIN activos a ON a.id = e.cliente_id, hoy WHERE e.fecha >= date(hoy.d, '-6 days')
         ) ORDER BY fecha DESC, orden DESC LIMIT 15`,
      )
      .all() as ActividadReciente[],
  };
}
