import Link from "next/link";
import type { ReactNode } from "react";
import { medidaCasera, type Macros, type PlanNutricional } from "@/lib/nutricion";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const fechaLarga = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" });
const diaSemana = (f: string) => DIAS[(new Date(`${f}T12:00:00`).getDay() + 6) % 7];

/** Semana del plan que contiene la fecha dada (1–4); si no la contiene, la primera. */
export function semanaActual(plan: PlanNutricional, hoyISO: string) {
  const i = plan.semanas.findIndex((s) => s.dias[0].fecha <= hoyISO && hoyISO <= s.dias[6].fecha);
  return i >= 0 ? i + 1 : 1;
}

/**
 * Plan nutricional mensual: metas diarias, cómo se calculó, recomendaciones y el menú de la
 * semana elegida con su lista de compras. Lo usan el expediente y el portal del cliente.
 */
export function VistaPlanNutricional({
  plan,
  numeroSemana,
  hrefSemana,
  hrefIntercambio,
  notas,
  acciones,
}: {
  plan: PlanNutricional;
  numeroSemana: number;
  hrefSemana: (n: number) => string;
  /** Si se indica, cada alimento muestra el enlace "Cambiar" (intercambio por un equivalente). */
  hrefIntercambio?: (u: { semana: number; dia: number; comida: number; item: number }) => string;
  notas?: string;
  acciones?: ReactNode;
}) {
  const semana = plan.semanas[numeroSemana - 1];
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Plan del {fechaLarga(plan.fecha_inicio)} al {fechaLarga(plan.fecha_fin)}
          </h2>
          <p className="text-sm text-slate-500">
            {plan.comidas_por_dia} comidas al día · {plan.dias_entreno.length ? `entrena ${plan.dias_entreno.map((d) => DIAS[d].slice(0, 3)).join(", ")}` : "sin rutina activa"}
            {notas && ` · ${notas}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">{acciones}</div>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <Dato titulo="Día de entrenamiento" valor={`${plan.objetivos.entreno.kcal} kcal`} />
        <Dato titulo="Día de descanso" valor={`${plan.objetivos.descanso.kcal} kcal`} />
        <Dato titulo="Proteína" valor={`${plan.objetivos.entreno.p} g`} detalle={`${(plan.objetivos.entreno.p / plan.calculo.peso_kg).toFixed(1)} g/kg`} />
        <Dato titulo="Carbohidratos" valor={`${plan.objetivos.entreno.c} / ${plan.objetivos.descanso.c} g`} detalle="entreno / descanso" />
        <Dato titulo="Grasas" valor={`${plan.objetivos.entreno.g} g`} />
        <Dato titulo="Agua" valor={`${plan.agua_litros} L`} detalle="al día" />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="tarjeta p-5 text-sm">
          <h3 className="font-semibold text-slate-900">Cómo se calculó</h3>
          <dl className="mt-3 space-y-1.5 text-slate-600">
            <Fila nombre="Peso / % grasa" valor={`${plan.calculo.peso_kg} kg${plan.calculo.grasa_pct != null ? ` · ${plan.calculo.grasa_pct} %` : ""}`} />
            <Fila nombre="Metabolismo basal" valor={`${plan.calculo.tmb} kcal · ${plan.calculo.metodo}`} />
            <Fila nombre="Gasto total" valor={`${plan.calculo.gasto_total} kcal (factor ${plan.calculo.factor_actividad})`} />
            <Fila nombre="Ajuste por objetivo" valor={`${plan.calculo.ajuste_objetivo_pct > 0 ? "+" : ""}${plan.calculo.ajuste_objetivo_pct} %`} />
            {plan.calculo.ajuste_kcal !== 0 && <Fila nombre="Ajuste adicional" valor={`${plan.calculo.ajuste_kcal > 0 ? "+" : ""}${plan.calculo.ajuste_kcal} kcal`} />}
          </dl>
          {plan.calculo.motivo_ajuste && <p className="mt-3 rounded-lg bg-pink-50/60 px-3 py-2 text-xs text-slate-600">{plan.calculo.motivo_ajuste}</p>}
          {plan.restricciones.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Restricciones aplicadas</h4>
              <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-700">
                {plan.restricciones.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          )}
        </section>
        <section className="tarjeta p-5 text-sm">
          <h3 className="font-semibold text-slate-900">Recomendaciones</h3>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-slate-700">
            {plan.recomendaciones.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </section>
      </div>

      <section className="space-y-4">
        <nav className="flex flex-wrap gap-2 print:hidden" aria-label="Semanas del plan">
          {plan.semanas.map((s) => (
            <Link
              key={s.numero}
              href={hrefSemana(s.numero)}
              aria-current={s.numero === numeroSemana ? "page" : undefined}
              className="chip"
            >
              Semana {s.numero} · {fechaCorta(s.dias[0].fecha)}–{fechaCorta(s.dias[6].fecha)}
            </Link>
          ))}
        </nav>
        <p className="aviso-marca">
          <strong>Semana {semana.numero}:</strong> {semana.enfoque}
        </p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {semana.dias.map((d, di) => (
            <article key={d.fecha} id={`dia-${di}`} className="tarjeta scroll-mt-6 overflow-hidden break-inside-avoid">
              <header className="flex items-center justify-between gap-2 border-b border-pink-100 bg-pink-50/60 px-4 py-2">
                <h4 className="text-sm font-semibold text-slate-800">
                  {diaSemana(d.fecha)} {fechaCorta(d.fecha)}
                </h4>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.entreno ? "bg-pink-100 text-pink-800" : "bg-slate-100 text-slate-600"}`}>
                  {d.entreno ? "Entrenamiento" : "Descanso"}
                </span>
              </header>
              <div className="divide-y divide-slate-100">
                {d.comidas.map((c, ci) => (
                  <div key={c.nombre} className="px-4 py-2.5">
                    <p className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold uppercase tracking-wide text-slate-500">{c.nombre}</span>
                      <span className="tabular-nums text-slate-500">{resumen(c.total)}</span>
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                      {c.items.map((i, ii) => (
                        <li key={i.clave} className="flex justify-between gap-3">
                          <span>
                            {i.nombre}
                            {i.en_lugar_de && <span className="text-xs text-pink-700"> · en lugar de {i.en_lugar_de}</span>}
                            {hrefIntercambio && (
                              <Link
                                href={hrefIntercambio({ semana: numeroSemana - 1, dia: di, comida: ci, item: ii })}
                                className="ml-1.5 text-xs font-medium text-pink-700 hover:underline print:hidden"
                                aria-label={`Cambiar ${i.nombre}`}
                              >
                                ⇄ Cambiar
                              </Link>
                            )}
                          </span>
                          <span className="shrink-0 tabular-nums text-slate-500">
                            {i.gramos} g{medidaCasera(i.clave, i.gramos) && <span className="text-slate-400"> · {medidaCasera(i.clave, i.gramos)}</span>}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <footer className="border-t border-slate-100 px-4 py-2 text-xs text-slate-600">
                Total del día: <strong className="tabular-nums text-slate-800">{resumen(d.total)}</strong>
                <span className="text-slate-400"> · meta {(d.entreno ? plan.objetivos.entreno : plan.objetivos.descanso).kcal} kcal</span>
              </footer>
            </article>
          ))}
        </div>
        <details className="tarjeta p-5">
          <summary className="cursor-pointer select-none text-sm font-semibold text-slate-900">Lista de compras de la semana {semana.numero}</summary>
          <ul className="mt-3 grid gap-x-6 gap-y-1 text-sm text-slate-700 sm:grid-cols-2 lg:grid-cols-3">
            {semana.compras.map((c) => (
              <li key={c.nombre} className="flex justify-between gap-2 border-b border-slate-100 py-1">
                <span>{c.nombre}</span>
                <span className="shrink-0 tabular-nums text-slate-500">{c.gramos >= 1000 ? `${(c.gramos / 1000).toFixed(1)} kg` : `${c.gramos} g`}</span>
              </li>
            ))}
          </ul>
        </details>
      </section>
    </div>
  );
}

const resumen = (m: Macros) => `${m.kcal} kcal · P ${m.p} · C ${m.c} · G ${m.g}`;

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{valor}</p>
      {detalle && <p className="text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}

function Fila({ nombre, valor }: { nombre: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt>{nombre}</dt>
      <dd className="text-right font-medium text-slate-800">{valor}</dd>
    </div>
  );
}
