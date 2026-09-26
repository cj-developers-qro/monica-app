import { BotonAccion } from "./BotonAccion";
import { BotonEnviar, Formulario } from "./Formulario";
import { GraficaLineas } from "./GraficaLineas";
import { eliminarSeguimiento, registrarSeguimiento } from "@/app/acciones/nutricion";
import { COLORES_SERIE } from "@/lib/colores";
import type { Seguimiento } from "@/lib/datos";
import { hoy } from "@/lib/formulario";

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

/**
 * Registro semanal de adherencia al plan (formulario, gráfica e historial). El cliente lo llena
 * desde su portal; la administradora además puede eliminar registros.
 */
export function SeguimientoNutricional({
  clienteId,
  planId,
  seguimiento,
  puedeEliminar,
}: {
  clienteId: number;
  planId: number;
  seguimiento: Seguimiento[];
  puedeEliminar: boolean;
}) {
  const hoyISO = hoy();
  const delPlan = seguimiento.filter((s) => s.plan_id === planId);
  const adherencia = delPlan.length ? Math.round(delPlan.reduce((a, s) => a + s.adherencia, 0) / delPlan.length) : null;
  return (
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
            <Formulario accion={registrarSeguimiento.bind(null, clienteId, planId)} mensajeOk="Seguimiento registrado.">
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
              <thead className="bg-pink-50/60 text-left text-xs text-slate-500">
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
                      {puedeEliminar && (<BotonAccion accion={eliminarSeguimiento.bind(null, clienteId, s.id)} confirmar="¿Eliminar este registro?" className="text-xs text-slate-400 hover:text-red-600">
                        Eliminar
                      </BotonAccion>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
  );
}
