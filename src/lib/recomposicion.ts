// Motor de recomposición: convierte los porcentajes de cada registro en kilos de grasa
// y de músculo, y contrasta el primer registro con el último para diagnosticar el progreso.
import type { Composicion } from "./datos";
import { OBJETIVOS, type Objetivo } from "./objetivos";

export type PuntoRecomposicion = {
  fecha: string;
  peso: number;
  masaGrasa: number | null;
  masaMuscular: number | null;
  grasaPct: number | null;
  musculoPct: number | null;
  visceral: number | null;
};

export type Estado = "logrado" | "parcial" | "sin_progreso" | "sin_datos";

export type Diagnostico = {
  estado: Estado;
  titulo: string;
  detalle: string;
  alineadoConObjetivo: string;
  deltaPeso: number | null;
  deltaGrasa: number | null;
  deltaMusculo: number | null;
  semanas: number | null;
};

const redondear = (n: number) => Math.round(n * 10) / 10;

export function serieRecomposicion(registros: Composicion[]): PuntoRecomposicion[] {
  return registros.map((r) => ({
    fecha: r.fecha,
    peso: r.peso_kg,
    masaGrasa: r.grasa_pct == null ? null : redondear((r.peso_kg * r.grasa_pct) / 100),
    masaMuscular: r.musculo_pct == null ? null : redondear((r.peso_kg * r.musculo_pct) / 100),
    grasaPct: r.grasa_pct,
    musculoPct: r.musculo_pct,
    visceral: r.grasa_visceral,
  }));
}

// Por debajo de este cambio (kg) se considera ruido de medición.
const UMBRAL_KG = 0.3;

export function diagnosticar(serie: PuntoRecomposicion[], objetivo: Objetivo): Diagnostico {
  const completos = serie.filter((p) => p.masaGrasa != null && p.masaMuscular != null);
  const vacio: Diagnostico = {
    estado: "sin_datos",
    titulo: "Aún no hay datos suficientes",
    detalle: "Registra al menos dos mediciones de composición corporal con % de grasa y % de músculo.",
    alineadoConObjetivo: "",
    deltaPeso: null,
    deltaGrasa: null,
    deltaMusculo: null,
    semanas: null,
  };
  if (completos.length < 2) return vacio;

  const inicio = completos[0];
  const fin = completos[completos.length - 1];
  const dPeso = redondear(fin.peso - inicio.peso);
  const dGrasa = redondear(fin.masaGrasa! - inicio.masaGrasa!);
  const dMusculo = redondear(fin.masaMuscular! - inicio.masaMuscular!);
  const dias = (Date.parse(fin.fecha) - Date.parse(inicio.fecha)) / 86_400_000;
  const semanas = Math.max(1, Math.round(dias / 7));

  const bajaGrasa = dGrasa <= -UMBRAL_KG;
  const subeGrasa = dGrasa >= UMBRAL_KG;
  const subeMusculo = dMusculo >= UMBRAL_KG;
  const bajaMusculo = dMusculo <= -UMBRAL_KG;

  let estado: Estado;
  let titulo: string;
  if (bajaGrasa && subeMusculo) {
    estado = "logrado";
    titulo = "Recomposición corporal lograda";
  } else if (bajaGrasa && !bajaMusculo) {
    estado = "logrado";
    titulo = "Pérdida de grasa preservando músculo";
  } else if (bajaGrasa && bajaMusculo) {
    estado = "parcial";
    titulo = "Pérdida de grasa con pérdida muscular";
  } else if (subeMusculo && !subeGrasa) {
    estado = "logrado";
    titulo = "Ganancia muscular limpia";
  } else if (subeMusculo && subeGrasa) {
    estado = "parcial";
    titulo = "Ganancia muscular con aumento de grasa";
  } else {
    estado = "sin_progreso";
    titulo = subeGrasa || bajaMusculo ? "Retroceso en composición corporal" : "Composición estable";
  }

  const fmt = (n: number) => `${n > 0 ? "+" : ""}${n} kg`;
  const detalle =
    `En ${semanas} semana${semanas === 1 ? "" : "s"}: peso ${fmt(dPeso)}, grasa ${fmt(dGrasa)}, músculo ${fmt(dMusculo)}.` +
    (Math.abs(dPeso) < 1 && bajaGrasa && subeMusculo ? " La báscula casi no cambió, pero la composición sí." : "");

  const cumple: Record<Objetivo, boolean> = {
    perdida_grasa: bajaGrasa && !bajaMusculo,
    ganancia_muscular: subeMusculo,
    recomposicion: bajaGrasa && !bajaMusculo,
    rendimiento: !bajaMusculo,
  };
  const alineadoConObjetivo = cumple[objetivo]
    ? `El progreso va alineado con el objetivo de ${OBJETIVOS[objetivo].nombre.toLowerCase()}.`
    : `El progreso aún no refleja el objetivo de ${OBJETIVOS[objetivo].nombre.toLowerCase()}; revisa la rutina y la alimentación.`;

  return { estado, titulo, detalle, alineadoConObjetivo, deltaPeso: dPeso, deltaGrasa: dGrasa, deltaMusculo: dMusculo, semanas };
}
