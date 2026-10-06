import Link from "next/link";
import { BotonAccion } from "./BotonAccion";
import { BotonEnviar, Formulario } from "./Formulario";
import { eliminarSesion, registrarSesion } from "@/app/acciones/entrenamiento";
import { agruparPorDia, type MarcaEjercicio, type RutinaConEjercicios, type SesionEntrenamiento } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { enlaceVideo } from "@/lib/videos";

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const ESFUERZO = ["", "1 · Muy fácil", "2 · Fácil", "3 · Moderado", "4 · Difícil", "5 · Al límite"];
const kg = (v: number | null) => (v == null ? "—" : `${v} kg`);
const primerNumero = (t: string) => {
  const m = t.match(/\d+/);
  return m ? Number(m[0]) : undefined;
};

/** Día sugerido: el siguiente al último que se entrenó (en el orden de la rutina). */
export function diaSugerido(dias: string[], sesiones: SesionEntrenamiento[]) {
  const ultimo = sesiones[0]?.dia;
  const i = ultimo ? dias.indexOf(ultimo) : -1;
  return i >= 0 ? dias[(i + 1) % dias.length] : dias[0];
}

/**
 * Bitácora de entrenamiento: registrar la sesión del día (prellenada con la vez anterior),
 * historial y progreso por ejercicio. La usan el portal del cliente y el expediente de Moni.
 */
export function BitacoraEntrenamiento({
  clienteId,
  rutina,
  dia,
  hrefDia,
  sesiones,
  marcas,
}: {
  clienteId: number;
  rutina: RutinaConEjercicios | null;
  dia: string | null;
  hrefDia: (dia: string) => string;
  sesiones: SesionEntrenamiento[];
  marcas: MarcaEjercicio[];
}) {
  const dias = rutina ? agruparPorDia(rutina.items) : [];
  const elegido = dias.find((d) => d.dia === dia) ?? dias.find((d) => d.dia === diaSugerido(dias.map((x) => x.dia), sesiones));
  const porEjercicio = new Map(marcas.map((m) => [m.ejercicio_id, m]));

  return (
    <div className="space-y-6">
      {!rutina || !elegido ? (
        <p className="tarjeta p-6 text-sm text-slate-500">Todavía no hay una rutina asignada; cuando Moni asigne una, aquí podrás registrar tus sesiones.</p>
      ) : (
        <section className="tarjeta p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-900">Registrar sesión</h2>
              <p className="text-xs text-slate-500">{rutina.nombre} · elige el día que entrenaste:</p>
            </div>
          </div>
          <nav className="mt-3 flex flex-wrap gap-2" aria-label="Días de la rutina">
            {dias.map((d) => (
              <Link key={d.dia} href={hrefDia(d.dia)} aria-current={d.dia === elegido.dia ? "page" : undefined} className="chip">
                {d.dia}
              </Link>
            ))}
          </nav>

          <Formulario
            accion={registrarSesion.bind(null, clienteId, rutina.id, elegido.dia)}
            className="mt-5 space-y-4"
            mensajeOk="Sesión registrada."
          >
            <div className="divide-y divide-pink-50 rounded-xl border border-pink-100">
              {elegido.items.map((i) => {
                const previo = porEjercicio.get(i.ejercicio_id);
                const video = enlaceVideo(i.ejercicio);
                return (
                  <div key={i.id} className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                    <label className="flex min-w-0 items-start gap-3">
                      <input type="checkbox" name={`hecho_${i.id}`} value="si" defaultChecked className="mt-1 size-5 shrink-0 accent-pink-600" />
                      <span className="min-w-0">
                        <span className="block font-medium text-slate-800">{i.ejercicio.nombre}</span>
                        <span className="block text-xs text-slate-500">
                          Plan: {i.series} × {i.repeticiones}
                          {previo && (
                            <>
                              {" · "}
                              <strong className="text-slate-600">
                                Última vez ({fechaCorta(previo.ultima_fecha)}): {previo.ultimo_series ?? "?"} × {previo.ultimo_reps ?? "?"}
                                {previo.ultimo_peso != null ? ` con ${previo.ultimo_peso} kg` : ""}
                              </strong>
                            </>
                          )}
                        </span>
                        <a href={video.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-pink-700 hover:underline">
                          ▶ {video.propio ? "Ver video" : "Ver cómo se hace"}
                        </a>
                      </span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:w-72">
                      <Numero etiqueta="Series" nombre={`series_${i.id}`} valor={previo?.ultimo_series ?? i.series} max={20} />
                      <Numero etiqueta="Reps" nombre={`reps_${i.id}`} valor={previo?.ultimo_reps ?? primerNumero(i.repeticiones)} max={300} />
                      <Numero etiqueta="Peso (kg)" nombre={`peso_${i.id}`} valor={previo?.ultimo_peso ?? undefined} max={500} decimales />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Desmarca lo que no hiciste. Reps = repeticiones por serie (o segundos si el ejercicio es por tiempo). Peso en kg por lado o
              total, como lo acostumbres; deja vacío si fue con tu peso corporal.
            </p>
            <div className="grid gap-3 sm:grid-cols-[10rem_12rem_minmax(0,1fr)]">
              <label>
                <span className="etiqueta">Fecha</span>
                <input type="date" name="fecha" defaultValue={hoy()} max={hoy()} className="campo" />
              </label>
              <label>
                <span className="etiqueta">¿Qué tan pesada se sintió?</span>
                <select name="esfuerzo" defaultValue="" className="campo">
                  <option value="">—</option>
                  {ESFUERZO.slice(1).map((t, n) => (
                    <option key={t} value={n + 1}>
                      {t}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="etiqueta">Notas</span>
                <input name="notas" placeholder="Ej. me molestó la rodilla en las zancadas" className="campo" />
              </label>
            </div>
            <BotonEnviar>Guardar sesión</BotonEnviar>
          </Formulario>
        </section>
      )}

      {marcas.length > 0 && (
        <section className="tarjeta overflow-x-auto">
          <h2 className="px-5 pt-5 text-base font-semibold text-slate-900">Progreso por ejercicio</h2>
          <p className="px-5 text-xs text-slate-500">Cargas registradas en las series completadas.</p>
          <table className="mt-3 w-full min-w-[620px] text-sm">
            <thead className="bg-pink-50/60 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Ejercicio</th>
                <th className="px-3 py-2 text-right font-medium">Sesiones</th>
                <th className="px-3 py-2 text-right font-medium">Primera carga</th>
                <th className="px-3 py-2 text-right font-medium">Última</th>
                <th className="px-3 py-2 text-right font-medium">Mejor</th>
                <th className="px-3 py-2 text-right font-medium">Avance</th>
              </tr>
            </thead>
            <tbody>
              {marcas.map((m) => {
                const avance = m.primer_peso != null && m.ultimo_peso != null ? Math.round((m.ultimo_peso - m.primer_peso) * 10) / 10 : null;
                return (
                  <tr key={m.ejercicio_id} className="border-t border-pink-50">
                    <td className="px-5 py-2 text-slate-800">{m.ejercicio_nombre}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{m.sesiones}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{kg(m.primer_peso)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{kg(m.ultimo_peso)}</td>
                    <td className="px-3 py-2 text-right tabular-nums font-medium">{kg(m.mejor_peso)}</td>
                    <td className={`px-3 py-2 text-right tabular-nums ${avance && avance > 0 ? "text-emerald-700" : "text-slate-500"}`}>
                      {avance == null ? "—" : `${avance > 0 ? "+" : ""}${avance} kg`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Historial</h2>
        {sesiones.length === 0 ? (
          <p className="tarjeta p-6 text-sm text-slate-500">Aún no hay sesiones registradas.</p>
        ) : (
          <ul className="space-y-2">
            {sesiones.map((s) => {
              const hechos = s.ejercicios.filter((e) => e.completado).length;
              return (
                <li key={s.id} className="tarjeta">
                  <details>
                    <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
                      <span>
                        <strong className="text-slate-800">{fechaCorta(s.fecha)}</strong> · {s.dia}
                        <span className="text-slate-500"> · {s.rutina_nombre}</span>
                      </span>
                      <span className="flex items-center gap-2 text-xs">
                        <span className="insignia-marca">
                          {hechos}/{s.ejercicios.length} ejercicios
                        </span>
                        {s.esfuerzo && <span className="text-slate-500">Esfuerzo {s.esfuerzo}/5</span>}
                        {s.registrado_por_rol === "admin" && <span className="text-slate-400">· registrada por Moni</span>}
                      </span>
                    </summary>
                    <div className="border-t border-pink-50 px-4 py-3">
                      <ul className="space-y-1 text-sm">
                        {s.ejercicios.map((e, n) => (
                          <li key={n} className={`flex justify-between gap-3 ${e.completado ? "text-slate-700" : "text-slate-400 line-through"}`}>
                            <span>{e.ejercicio_nombre}</span>
                            <span className="shrink-0 tabular-nums">
                              {e.series ?? "?"} × {e.repeticiones ?? "?"}
                              {e.peso_kg != null ? ` · ${e.peso_kg} kg` : ""}
                            </span>
                          </li>
                        ))}
                      </ul>
                      {s.notas && <p className="mt-2 text-xs text-slate-600">📝 {s.notas}</p>}
                      <div className="mt-3">
                        <BotonAccion
                          accion={eliminarSesion.bind(null, clienteId, s.id)}
                          confirmar="¿Borrar esta sesión de la bitácora?"
                          className="text-xs text-slate-400 hover:text-red-600"
                        >
                          Borrar sesión
                        </BotonAccion>
                      </div>
                    </div>
                  </details>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Numero({ etiqueta, nombre, valor, max, decimales }: { etiqueta: string; nombre: string; valor?: number; max: number; decimales?: boolean }) {
  return (
    <label>
      <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">{etiqueta}</span>
      <input
        type="number"
        inputMode={decimales ? "decimal" : "numeric"}
        name={nombre}
        min={0}
        max={max}
        step={decimales ? "any" : 1}
        defaultValue={valor}
        className="w-full rounded-lg border border-pink-200 px-2 py-1.5 text-sm tabular-nums"
      />
    </label>
  );
}
