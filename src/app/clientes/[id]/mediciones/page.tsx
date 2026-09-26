import { BotonAccion } from "@/components/BotonAccion";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { GraficaLineas } from "@/components/GraficaLineas";
import { COLORES_SERIE } from "@/lib/colores";
import { eliminarMedicion, registrarMedicion } from "@/app/acciones/clientes";
import { listarMediciones, type Medicion } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { clienteDeRuta } from "../cliente";

const CAMPOS: { clave: keyof Medicion; nombre: string }[] = [
  { clave: "brazo_izq", nombre: "Brazo izq." },
  { clave: "brazo_der", nombre: "Brazo der." },
  { clave: "pierna_izq", nombre: "Pierna izq." },
  { clave: "pierna_der", nombre: "Pierna der." },
  { clave: "pantorrilla_izq", nombre: "Pantorrilla izq." },
  { clave: "pantorrilla_der", nombre: "Pantorrilla der." },
  { clave: "cintura", nombre: "Cintura" },
  { clave: "cuello", nombre: "Cuello" },
  { clave: "cadera", nombre: "Cadera" },
];

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" });

export default async function Antropometria({ params }: PageProps<"/clientes/[id]/mediciones">) {
  const cliente = await clienteDeRuta(params);
  const mediciones = await listarMediciones(cliente.id);
  const primera = mediciones[0];
  const ultima = mediciones[mediciones.length - 1];
  const icc = ultima?.cintura && ultima?.cadera ? ultima.cintura / ultima.cadera : null;
  const ice = ultima?.cintura && cliente.estatura_cm ? ultima.cintura / cliente.estatura_cm : null;
  const limiteIcc = cliente.sexo === "F" ? 0.85 : 0.9;

  return (
    <div className="space-y-6">
      <section className="tarjeta p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Registrar medidas con cinta métrica (cm)</h2>
        <Formulario accion={registrarMedicion.bind(null, cliente.id)} mensajeOk="Medidas registradas.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
            <label>
              <span className="etiqueta">Fecha</span>
              <input type="date" name="fecha" defaultValue={hoy()} className="campo" />
            </label>
            {CAMPOS.map((c) => (
              <label key={c.clave}>
                <span className="etiqueta">{c.nombre}</span>
                <input type="number" step="0.1" min={1} max={250} name={c.clave} className="campo" />
              </label>
            ))}
          </div>
          <label className="mt-3 block">
            <span className="etiqueta">Notas</span>
            <input name="notas" className="campo" />
          </label>
          <div className="mt-4 flex justify-end">
            <BotonEnviar>Guardar medidas</BotonEnviar>
          </div>
        </Formulario>
      </section>

      {mediciones.length === 0 ? (
        <p className="tarjeta p-8 text-center text-sm text-slate-500">Sin mediciones registradas todavía.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Indice
              titulo="Índice cintura / cadera"
              valor={icc}
              limite={limiteIcc}
              detalle={`Riesgo cardiometabólico elevado por encima de ${limiteIcc} (${cliente.sexo === "F" ? "mujeres" : "hombres"}, OMS).`}
            />
            <Indice
              titulo="Índice cintura / estatura"
              valor={ice}
              limite={0.5}
              detalle={cliente.estatura_cm ? "Lo deseable es mantenerlo por debajo de 0.5." : "Captura la estatura en el perfil para calcularlo."}
            />
          </div>

          {mediciones.length > 1 && (
            <section className="tarjeta p-5">
              <GraficaLineas
                titulo="Perímetros del tronco"
                unidad="cm"
                fechas={mediciones.map((m) => m.fecha)}
                series={[
                  { nombre: "Cintura", color: COLORES_SERIE[0], valores: mediciones.map((m) => m.cintura) },
                  { nombre: "Cadera", color: COLORES_SERIE[1], valores: mediciones.map((m) => m.cadera) },
                  { nombre: "Cuello", color: COLORES_SERIE[2], valores: mediciones.map((m) => m.cuello) },
                ]}
              />
            </section>
          )}

          <section className="tarjeta overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-slate-50 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  {CAMPOS.map((c) => (
                    <th key={c.clave} className="px-2 py-2 text-right font-medium">
                      {c.nombre}
                    </th>
                  ))}
                  <th />
                </tr>
              </thead>
              <tbody>
                {[...mediciones].reverse().map((m) => (
                  <tr key={m.id} className="border-t border-slate-100">
                    <td className="px-4 py-2 whitespace-nowrap text-slate-700" title={m.notas ?? undefined}>
                      {fechaCorta(m.fecha)}
                    </td>
                    {CAMPOS.map((c) => (
                      <td key={c.clave} className="px-2 py-2 text-right tabular-nums">
                        {(m[c.clave] as number | null) ?? "—"}
                      </td>
                    ))}
                    <td className="px-2 py-2 text-right">
                      <BotonAccion
                        accion={eliminarMedicion.bind(null, cliente.id, m.id)}
                        confirmar="¿Eliminar este registro de medidas?"
                        className="text-xs text-slate-400 hover:text-red-600"
                      >
                        Eliminar
                      </BotonAccion>
                    </td>
                  </tr>
                ))}
                {mediciones.length > 1 && (
                  <tr className="border-t-2 border-slate-200 bg-slate-50 font-medium">
                    <td className="px-4 py-2 text-xs text-slate-600">Cambio total</td>
                    {CAMPOS.map((c) => {
                      const a = primera[c.clave] as number | null;
                      const b = ultima[c.clave] as number | null;
                      const d = a != null && b != null ? Math.round((b - a) * 10) / 10 : null;
                      return (
                        <td key={c.clave} className="px-2 py-2 text-right tabular-nums text-slate-700">
                          {d == null ? "—" : `${d > 0 ? "+" : ""}${d}`}
                        </td>
                      );
                    })}
                    <td />
                  </tr>
                )}
              </tbody>
            </table>
          </section>
        </>
      )}
    </div>
  );
}

function Indice({ titulo, valor, limite, detalle }: { titulo: string; valor: number | null; limite: number; detalle: string }) {
  const alto = valor != null && valor >= limite;
  return (
    <div className="tarjeta p-5">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 flex items-baseline gap-2">
        <span className="text-3xl font-bold tabular-nums text-slate-900">{valor != null ? valor.toFixed(2) : "—"}</span>
        {valor != null && (
          <span className={`text-xs font-medium ${alto ? "text-amber-700" : "text-emerald-700"}`}>
            {alto ? "▲ Por encima del límite" : "✓ En rango saludable"}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-slate-500">{detalle}</p>
    </div>
  );
}
