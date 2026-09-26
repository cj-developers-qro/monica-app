// Objetivos del cliente y los parámetros de entrenamiento que cada uno exige.
// Las rutinas se etiquetan con un objetivo para poder recomendarlas y detectar desalineaciones.

export const OBJETIVOS = {
  perdida_grasa: {
    nombre: "Pérdida de grasa",
    series: "3–4",
    repeticiones: "12–15",
    descanso: "30–60 s",
    cardio: "3–5 sesiones por semana (HIIT + cardio de baja intensidad)",
    enfoque: "Circuitos y superseries con densidad alta para elevar el gasto calórico sin perder masa muscular.",
    clase: "bg-orange-100 text-orange-800 ring-orange-200",
  },
  ganancia_muscular: {
    nombre: "Ganancia muscular",
    series: "3–5",
    repeticiones: "6–12",
    descanso: "60–120 s",
    cardio: "1–2 sesiones por semana de baja intensidad",
    enfoque: "Volumen progresivo por grupo muscular (10–20 series semanales) con sobrecarga progresiva.",
    clase: "bg-sky-100 text-sky-800 ring-sky-200",
  },
  recomposicion: {
    nombre: "Recomposición corporal",
    series: "3–4",
    repeticiones: "8–12",
    descanso: "60–90 s",
    cardio: "2–3 sesiones por semana de baja intensidad",
    enfoque: "Fuerza de cuerpo completo con sobrecarga progresiva y cardio moderado para bajar grasa ganando músculo.",
    clase: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  },
  rendimiento: {
    nombre: "Rendimiento",
    series: "3–6",
    repeticiones: "3–6 (fuerza) / 5–10 (potencia)",
    descanso: "2–3 min",
    cardio: "Intervalos específicos del deporte",
    enfoque: "Fuerza máxima, potencia y acondicionamiento con ejercicios multiarticulares y pliometría.",
    clase: "bg-violet-100 text-violet-800 ring-violet-200",
  },
} as const;

export type Objetivo = keyof typeof OBJETIVOS;

export const LISTA_OBJETIVOS = Object.keys(OBJETIVOS) as Objetivo[];

export function esObjetivo(valor: unknown): valor is Objetivo {
  return typeof valor === "string" && valor in OBJETIVOS;
}

export const NIVELES = {
  principiante: "Principiante",
  intermedio: "Intermedio",
  avanzado: "Avanzado",
} as const;

export type Nivel = keyof typeof NIVELES;

export function esNivel(valor: unknown): valor is Nivel {
  return typeof valor === "string" && valor in NIVELES;
}

export const TIPOS_EJERCICIO = {
  fuerza: "Fuerza",
  cardio: "Cardio",
  core: "Core",
  pliometria: "Pliometría",
  movilidad: "Movilidad",
} as const;

export type TipoEjercicio = keyof typeof TIPOS_EJERCICIO;
