import Link from "next/link";
import { BotonAccion } from "@/components/BotonAccion";
import { BotonImprimir } from "@/components/BotonImprimir";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { GraficaLineas } from "@/components/GraficaLineas";
import { eliminarPlan, eliminarSeguimiento, generarPlanNutricional, registrarSeguimiento } from "@/app/acciones/nutricion";
import { COLORES_SERIE } from "@/lib/colores";
import { listarComposicion, listarPlanes, listarSeguimiento, obtenerPlan, type Cliente } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { sumarFecha, type Macros, type PlanNutricional } from "@/lib/nutricion";
import { clienteDeRuta } from "../cliente";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const fechaLarga = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" });
const diaSemana = (f: string) => DIAS[(new Date(`${f}T12:00:00`).getDay() + 6) % 7];

export default async function Nutricion({ params, searchParams }: PageProps<"/clientes/[id]/nutricion">) {
  const cliente = await clienteDeRuta(params);
  const consulta = await searchParams;
  const [planes, seguimiento, composicion] = await Promise.all([
    listarPlanes(cliente.id),
    listarSeguimiento(cliente.id),
    listarComposicion(cliente.id),
  ]);
  const hoyISO = hoy();
  const pedido = Number(consulta.plan);
  // Por defecto se muestra el plan vigente hoy o, si no hay, el más reciente.
  const elegido = planes.find((p) => p.id === pedido) ?? planes.find((p) => p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin) ?? planes[0];
  const registro = elegido ? await obtenerPlan(cliente.id, elegido.id) : null;
  const siguienteInicio = planes[0] && planes[0].fecha_fin >= hoyISO ? sumarFecha(planes[0].fecha_fin, 1) : hoyISO;

  if (composicion.length === 0) {
    return (
      <div className="tarjeta p-8 text-center">
        <p className="font-medium text-slate-800">Para calcular el plan de nutrición se necesita el peso actual.</p>
        <Link href={`/clientes/${cliente.id}/composicion`} className="boton mt-4">Registrar composición corporal</Link>
      </div>
    );
  }

  const formularioGenerar = (
    <FormularioGenerar cliente={cliente} fechaInicio={siguienteInicio} hayPlanes={planes.length > 0} />
  );

  if (!registro) {
    return (
      <div className="space-y-4">
        <section className="tarjeta p-5">
          <h2 className="text-base font-semibold text-slate-900">Generar el primer plan mensual</h2>
          <p className="mt-1 text-sm text-slate-500">
            Se calcula con el peso y % de grasa más recientes, el objetivo, los días de la rutina activa y las respuestas de nutrición del
            onboarding (alergias, aversiones, fruta favorita, comidas al día y facilidad para cocinar).
          </p>
          <div className="mt-4">{formularioGenerar}</div>
        </section>
      </div>
    );
  }

  const plan = registro.plan;
  const numeroSemana = Math.min(4, Math.max(1, Number(consulta.semana) || semanaActual(plan, hoyISO)));
  const semana = plan.semanas[numeroSemana - 1];
  const seguimientoPlan = seguimiento.filter((s) => s.plan_id === registro.id);
  const adherencia = seguimientoPlan.length ? Math.round(seguimientoPlan.reduce((a, s) => a + s.adherencia, 0) / seguimientoPlan.length) : null;
  const base = `/clientes/${cliente.id}/nutricion?plan=${registro.id}`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Plan del {fechaLarga(plan.fecha_inicio)} al {fechaLarga(plan.fecha_fin)}
          </h2>
          <p className="text-sm text-slate-500">
            {plan.comidas_por_dia} comidas al día · {plan.dias_entreno.length ? `entrena ${plan.dias_entreno.map((d) => DIAS[d].slice(0, 3)).join(", ")}` : "sin rutina activa"}
            {registro.notas && ` · ${registro.notas}`}
          </p>
        </div>
        <BotonImprimir>Imprimir plan</BotonImprimir>
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
          {plan.calculo.motivo_ajuste && <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{plan.calculo.motivo_ajuste}</p>}
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
              href={`${base}&semana=${s.numero}`}
              aria-current={s.numero === numeroSemana ? "page" : undefined}
              className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 aria-[current=page]:border-emerald-600 aria-[current=page]:bg-emerald-600 aria-[current=page]:text-white"
            >
              Semana {s.numero} · {fechaCorta(s.dias[0].fecha)}–{fechaCorta(s.dias[6].fecha)}
            </Link>
          ))}
        </nav>
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          <strong>Semana {semana.numero}:</strong> {semana.enfoque}
        </p>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {semana.dias.map((d) => (
            <article key={d.fecha} className="tarjeta overflow-hidden break-inside-avoid">
              <header className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50 px-4 py-2">
                <h4 className="text-sm font-semibold text-slate-800">
                  {diaSemana(d.fecha)} {fechaCorta(d.fecha)}
                </h4>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${d.entreno ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                  {d.entreno ? "Entrenamiento" : "Descanso"}
                </span>
              </header>
              <div className="divide-y divide-slate-100">
                {d.comidas.map((c) => (
                  <div key={c.nombre} className="px-4 py-2.5">
                    <p className="flex items-baseline justify-between gap-2 text-xs">
                      <span className="font-semibold uppercase tracking-wide text-slate-500">{c.nombre}</span>
                      <span className="tabular-nums text-slate-500">{resumen(c.total)}</span>
                    </p>
                    <ul className="mt-1 space-y-0.5 text-sm text-slate-700">
                      {c.items.map((i) => (
                        <li key={i.clave} className="flex justify-between gap-3">
                          <span>{i.nombre}</span>
                          <span className="shrink-0 tabular-nums text-slate-500">
                            {i.gramos} g{i.medida && <span className="text-slate-400"> · {i.medida}</span>}
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

      <section className="space-y-4 print:hidden">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Seguimiento semanal</h3>
          {adherencia != null && (
            <p className="text-sm text-slate-600">
              Adherencia promedio a este plan: <strong className={adherencia >= 75 ? "text-emerald-700" : "text-amber-700"}>{adherencia} %</strong>
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="tarjeta p-5">
            <Formulario accion={registrarSeguimiento.bind(null, cliente.id, registro.id)} mensajeOk="Seguimiento registrado.">
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <label>
                  <span className="etiqueta">Fecha</span>
                  <input type="date" name="fecha" defaultValue={hoyISO} className="campo" />
                </label>
                <label>
                  <span className="etiqueta">Adherencia al plan (%) *</span>
                  <input type="number" name="adherencia" min={0} max={100} step={5} required className="campo" />
                </label>
                <label>
                  <span className="etiqueta">Agua promedio (L)</span>
                  <input type="number" name="agua_litros" min={0} max={10} step={0.1} className="campo" />
                </label>
                <label>
                  <span className="etiqueta">Energía (1–5)</span>
                  <input type="number" name="energia" min={1} max={5} className="campo" />
                </label>
                <label>
                  <span className="etiqueta">Hambre (1–5)</span>
                  <input type="number" name="hambre" min={1} max={5} className="campo" />
                </label>
                <label className="col-span-2 sm:col-span-1">
                  <span className="etiqueta">Notas</span>
                  <input name="notas" className="campo" />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-500">La adherencia y el cambio de peso ajustan automáticamente las calorías del siguiente plan.</p>
              <div className="mt-3 flex justify-end">
                <BotonEnviar>Registrar semana</BotonEnviar>
              </div>
            </Formulario>
          </section>
          <section className="tarjeta p-5">
            {seguimiento.length > 1 ? (
              <GraficaLineas
                titulo="Adherencia al plan"
                unidad="%"
                fechas={seguimiento.map((s) => s.fecha)}
                series={[{ nombre: "Adherencia", color: COLORES_SERIE[2], valores: seguimiento.map((s) => s.adherencia) }]}
              />
            ) : (
              <p className="text-sm text-slate-500">Registra al menos dos semanas para ver la tendencia de adherencia.</p>
            )}
          </section>
        </div>
        {seguimiento.length > 0 && (
          <div className="tarjeta overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  <th className="px-3 py-2 text-right font-medium">Adherencia</th>
                  <th className="px-3 py-2 text-right font-medium">Agua</th>
                  <th className="px-3 py-2 text-right font-medium">Energía</th>
                  <th className="px-3 py-2 text-right font-medium">Hambre</th>
                  <th className="px-3 py-2 font-medium">Notas</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...seguimiento].reverse().map((s) => (
                  <tr key={s.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 whitespace-nowrap">{fechaCorta(s.fecha)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.adherencia} %</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.agua_litros != null ? `${s.agua_litros} L` : "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.energia ?? "—"}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{s.hambre ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-600">{s.notas}</td>
                    <td className="px-3 py-2 text-right">
                      <BotonAccion accion={eliminarSeguimiento.bind(null, cliente.id, s.id)} confirmar="¿Eliminar este registro?" className="text-xs text-slate-400 hover:text-red-600">
                        Eliminar
                      </BotonAccion>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 print:hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="tarjeta p-5">
          <h3 className="text-base font-semibold text-slate-900">Generar plan del siguiente mes</h3>
          <p className="mt-1 text-sm text-slate-500">Usa los datos más recientes y ajusta calorías según el peso y la adherencia del plan anterior.</p>
          <div className="mt-4">{formularioGenerar}</div>
        </div>
        <div className="tarjeta p-5">
          <h3 className="text-base font-semibold text-slate-900">Historial de planes</h3>
          <ul className="mt-3 divide-y divide-slate-100">
            {planes.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={`/clientes/${cliente.id}/nutricion?plan=${p.id}`} className={p.id === registro.id ? "font-semibold text-emerald-700" : "text-slate-700 hover:text-emerald-700"}>
                  {fechaCorta(p.fecha_inicio)} – {fechaCorta(p.fecha_fin)}
                  {p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin && <span className="ml-2 text-xs text-emerald-700">vigente</span>}
                </Link>
                <BotonAccion accion={eliminarPlan.bind(null, cliente.id, p.id)} confirmar="¿Eliminar este plan de nutrición?" className="text-xs text-slate-400 hover:text-red-600">
                  Eliminar
                </BotonAccion>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function semanaActual(plan: PlanNutricional, hoyISO: string) {
  const i = plan.semanas.findIndex((s) => s.dias[0].fecha <= hoyISO && hoyISO <= s.dias[6].fecha);
  return i >= 0 ? i + 1 : 1;
}

const resumen = (m: Macros) => `${m.kcal} kcal · P ${m.p} · C ${m.c} · G ${m.g}`;

function FormularioGenerar({ cliente, fechaInicio, hayPlanes }: { cliente: Cliente; fechaInicio: string; hayPlanes: boolean }) {
  const comidas = parseInt(cliente.onboarding.comidas_dia ?? "", 10);
  return (
    <Formulario accion={generarPlanNutricional.bind(null, cliente.id)}>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="etiqueta">Inicia el</span>
          <input type="date" name="fecha_inicio" defaultValue={fechaInicio} className="campo" />
        </label>
        <label>
          <span className="etiqueta">Comidas al día</span>
          <select name="comidas_dia" defaultValue={String(Math.min(6, Math.max(3, Number.isFinite(comidas) ? comidas : 4)))} className="campo">
            {[3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>
          <span className="etiqueta">Ajuste manual (kcal)</span>
          <input type="number" name="ajuste_kcal" step={50} placeholder="0" className="campo" />
        </label>
        <label>
          <span className="etiqueta">Excluir además</span>
          <input name="excluir" placeholder="p. ej. atún, camote" className="campo" />
        </label>
        <label className="col-span-2">
          <span className="etiqueta">Notas del plan</span>
          <input name="notas" className="campo" />
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <BotonEnviar>{hayPlanes ? "Generar nuevo plan" : "Generar plan mensual"}</BotonEnviar>
      </div>
    </Formulario>
  );
}

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
