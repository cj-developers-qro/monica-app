import { BotonAccion } from "@/components/BotonAccion";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { eliminarComposicion, registrarComposicion } from "@/app/acciones/clientes";
import { listarComposicion } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { serieRecomposicion } from "@/lib/recomposicion";
import { clienteDeRuta } from "../cliente";

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" });

export default async function ComposicionCorporal({ params }: PageProps<"/clientes/[id]/composicion">) {
  const cliente = await clienteDeRuta(params);
  const registros = await listarComposicion(cliente.id);
  const serie = serieRecomposicion(registros);
  const ultimaEstatura = [...registros].reverse().find((r) => r.estatura_cm)?.estatura_cm ?? cliente.estatura_cm;

  return (
    <div className="space-y-6">
      <section className="tarjeta p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-900">Nuevo registro de composición corporal</h2>
        <p className="mb-4 text-xs text-slate-500">Usa siempre el mismo equipo (báscula de bioimpedancia) y condiciones: en ayunas y a la misma hora.</p>
        <Formulario accion={registrarComposicion.bind(null, cliente.id)} mensajeOk="Registro guardado.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <label>
              <span className="etiqueta">Fecha</span>
              <input type="date" name="fecha" defaultValue={hoy()} className="campo" />
            </label>
            <label>
              <span className="etiqueta">Peso (kg) *</span>
              <input type="number" step="0.1" name="peso_kg" required className="campo" />
            </label>
            <label>
              <span className="etiqueta">Estatura (cm)</span>
              <input type="number" step="0.1" name="estatura_cm" defaultValue={ultimaEstatura ?? ""} className="campo" />
            </label>
            <label>
              <span className="etiqueta">% grasa corporal</span>
              <input type="number" step="0.1" name="grasa_pct" className="campo" />
            </label>
            <label>
              <span className="etiqueta">% masa muscular</span>
              <input type="number" step="0.1" name="musculo_pct" className="campo" />
            </label>
            <label>
              <span className="etiqueta">Grasa visceral (nivel)</span>
              <input type="number" step="0.5" name="grasa_visceral" className="campo" />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="etiqueta">Notas</span>
            <input name="notas" className="campo" />
          </label>
          <div className="mt-4 flex justify-end">
            <BotonEnviar>Guardar registro</BotonEnviar>
          </div>
        </Formulario>
      </section>

      {registros.length === 0 ? (
        <p className="tarjeta p-8 text-center text-sm text-slate-500">Sin registros de composición todavía.</p>
      ) : (
        <section className="tarjeta overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-pink-50/60 text-left text-xs text-slate-500">
              <tr>
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 text-right font-medium">Peso</th>
                <th className="px-3 py-2 text-right font-medium">IMC</th>
                <th className="px-3 py-2 text-right font-medium">% grasa</th>
                <th className="px-3 py-2 text-right font-medium">% músculo</th>
                <th className="px-3 py-2 text-right font-medium">Visceral</th>
                <th className="px-3 py-2 text-right font-medium">Masa grasa</th>
                <th className="px-3 py-2 text-right font-medium">Masa muscular</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {registros
                .map((r, i) => ({ r, p: serie[i] }))
                .reverse()
                .map(({ r, p }) => {
                  const estatura = r.estatura_cm ?? cliente.estatura_cm;
                  const imc = estatura ? r.peso_kg / (estatura / 100) ** 2 : null;
                  return (
                    <tr key={r.id} className="border-t border-slate-100">
                      <td className="px-4 py-2 whitespace-nowrap text-slate-700" title={r.notas ?? undefined}>
                        {fechaCorta(r.fecha)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.peso_kg} kg</td>
                      <td className="px-3 py-2 text-right tabular-nums">{imc ? imc.toFixed(1) : "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.grasa_pct ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.musculo_pct ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{r.grasa_visceral ?? "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{p.masaGrasa != null ? `${p.masaGrasa} kg` : "—"}</td>
                      <td className="px-3 py-2 text-right tabular-nums">{p.masaMuscular != null ? `${p.masaMuscular} kg` : "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <BotonAccion
                          accion={eliminarComposicion.bind(null, cliente.id, r.id)}
                          confirmar="¿Eliminar este registro?"
                          className="text-xs text-slate-400 hover:text-red-600"
                        >
                          Eliminar
                        </BotonAccion>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </section>
      )}
    </div>
  );
}
