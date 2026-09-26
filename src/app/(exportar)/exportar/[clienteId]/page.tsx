import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonImprimir } from "@/components/BotonImprimir";
import { DetalleRutina } from "@/components/DetalleRutina";
import { ImagenRutina } from "@/components/ImagenRutina";
import { IconoMoniFit, NOMBRE_APP } from "@/components/Logo";
import { requerirAccesoCliente } from "@/lib/auth";
import { listarAsignaciones, listarPlanes, obtenerCliente, obtenerPlan } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import type { Macros } from "@/lib/nutricion";
import { OBJETIVOS } from "@/lib/objetivos";

export const metadata: Metadata = { title: "Plan mensual" };

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const fechaLarga = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" });
const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const diaSemana = (f: string) => DIAS[(new Date(`${f}T12:00:00`).getDay() + 6) % 7];
const resumen = (m: Macros) => `${m.kcal} kcal · P ${m.p} g · C ${m.c} g · G ${m.g} g`;

/** Plan mensual completo (nutrición de las 4 semanas + rutina activa) listo para imprimir o guardar como PDF. */
export default async function ExportarPlan({ params, searchParams }: PageProps<"/exportar/[clienteId]">) {
  const clienteId = Number((await params).clienteId);
  const usuario = await requerirAccesoCliente(clienteId);
  const consulta = await searchParams;
  const [cliente, planes, asignaciones] = await Promise.all([obtenerCliente(clienteId), listarPlanes(clienteId), listarAsignaciones(clienteId)]);
  if (!cliente) notFound();
  const hoyISO = hoy();
  const elegido =
    planes.find((p) => p.id === Number(consulta.plan)) ?? planes.find((p) => p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin) ?? planes[0];
  const registro = elegido ? await obtenerPlan(clienteId, elegido.id) : null;
  const rutina = asignaciones.find((a) => a.activa)?.rutina;
  const volver = usuario.rol === "admin" ? `/clientes/${clienteId}/nutricion` : "/portal/nutricion";

  return (
    <div className="mx-auto max-w-4xl px-6 py-8 print:max-w-none print:p-0">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-pink-100 bg-pink-50 p-4 print:hidden">
        <Link href={volver} className="enlace text-sm">← Volver</Link>
        <div className="flex flex-wrap items-center gap-2">
          {registro && (
            <a href={`/exportar/${clienteId}/csv?plan=${registro.id}`} className="boton-secundario">
              Descargar Excel (CSV)
            </a>
          )}
          <BotonImprimir>Descargar PDF / Imprimir</BotonImprimir>
        </div>
        <p className="w-full text-xs text-slate-500">
          Para PDF: en la ventana de impresión elige <strong>«Guardar como PDF»</strong> como destino.
        </p>
      </div>

      <header className="flex items-center justify-between gap-4 border-b-2 border-pink-500 pb-4">
        <div className="flex items-center gap-3">
          <IconoMoniFit className="size-12" />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-pink-600">{NOMBRE_APP} · Plan mensual</p>
            <h1 className="text-2xl font-bold text-slate-900">{cliente.nombre}</h1>
            <p className="text-sm text-slate-500">
              Objetivo: {OBJETIVOS[cliente.objetivo].nombre}
              {registro && ` · del ${fechaLarga(registro.plan.fecha_inicio)} al ${fechaLarga(registro.plan.fecha_fin)}`}
            </p>
          </div>
        </div>
      </header>

      {!registro ? (
        <p className="mt-8 text-sm text-slate-500">Todavía no hay un plan de nutrición para exportar.</p>
      ) : (
        <>
          <section className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Meta titulo="Día de entrenamiento" valor={resumen(registro.plan.objetivos.entreno)} />
            <Meta titulo="Día de descanso" valor={resumen(registro.plan.objetivos.descanso)} />
            <Meta titulo="Agua al día" valor={`${registro.plan.agua_litros} L`} />
            <Meta titulo="Comidas al día" valor={String(registro.plan.comidas_por_dia)} />
          </section>

          <section className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <div>
              <h2 className="font-semibold text-pink-700">Recomendaciones</h2>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                {registro.plan.recomendaciones.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            {registro.plan.restricciones.length > 0 && (
              <div>
                <h2 className="font-semibold text-pink-700">Restricciones aplicadas</h2>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
                  {registro.plan.restricciones.map((r) => <li key={r}>{r}</li>)}
                </ul>
              </div>
            )}
          </section>

          {registro.plan.semanas.map((s) => (
            <section key={s.numero} className="mt-8 break-before-page first-of-type:break-before-auto">
              <h2 className="text-lg font-bold text-slate-900">
                Semana {s.numero} <span className="text-sm font-normal text-slate-500">· {fechaCorta(s.dias[0].fecha)} – {fechaCorta(s.dias[6].fecha)}</span>
              </h2>
              <p className="mt-1 text-sm text-pink-800">{s.enfoque}</p>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 print:grid-cols-2">
                {s.dias.map((d) => (
                  <article key={d.fecha} className="break-inside-avoid rounded-xl border border-pink-100 p-3 text-xs">
                    <h3 className="flex justify-between font-semibold text-slate-800">
                      <span>{diaSemana(d.fecha)} {fechaCorta(d.fecha)}</span>
                      <span className={d.entreno ? "text-pink-700" : "text-slate-500"}>{d.entreno ? "Entrenamiento" : "Descanso"}</span>
                    </h3>
                    {d.comidas.map((c) => (
                      <div key={c.nombre} className="mt-1.5">
                        <p className="font-semibold uppercase tracking-wide text-slate-500">{c.nombre}</p>
                        <ul className="text-slate-700">
                          {c.items.map((i) => (
                            <li key={i.clave} className="flex justify-between gap-2">
                              <span>{i.nombre}</span>
                              <span className="shrink-0 tabular-nums text-slate-500">{i.gramos} g{i.medida ? ` (${i.medida})` : ""}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    <p className="mt-1.5 border-t border-pink-50 pt-1 text-slate-600">Total: {resumen(d.total)}</p>
                  </article>
                ))}
              </div>
              <div className="mt-3 break-inside-avoid rounded-xl bg-pink-50/60 p-3 text-xs">
                <h3 className="font-semibold text-slate-800">Lista de compras de la semana {s.numero}</h3>
                <ul className="mt-1 columns-2 gap-6 text-slate-700 sm:columns-3">
                  {s.compras.map((c) => (
                    <li key={c.nombre}>
                      {c.nombre}: {c.gramos >= 1000 ? `${(c.gramos / 1000).toFixed(1)} kg` : `${c.gramos} g`}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          ))}
        </>
      )}

      {rutina && (
        <section className="mt-8 break-before-page">
          <h2 className="text-lg font-bold text-slate-900">Rutina: {rutina.nombre}</h2>
          {rutina.descripcion && <p className="mt-1 text-sm text-slate-600">{rutina.descripcion}</p>}
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-[220px_minmax(0,1fr)] print:grid-cols-[200px_minmax(0,1fr)]">
            <ImagenRutina rutina={rutina} leyenda />
            <DetalleRutina items={rutina.items} />
          </div>
        </section>
      )}

      <footer className="mt-10 border-t border-pink-100 pt-3 text-center text-xs text-slate-400">
        Generado el {fechaLarga(hoyISO)} · {NOMBRE_APP}. Guía de alimentación y entrenamiento; no sustituye la valoración médica.
      </footer>
    </div>
  );
}

function Meta({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="rounded-xl border border-pink-100 p-3">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-0.5 font-semibold text-slate-900">{valor}</p>
    </div>
  );
}
