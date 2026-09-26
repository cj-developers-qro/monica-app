import type { Metadata } from "next";
import { VistaRecomposicion } from "@/components/VistaRecomposicion";
import { requerirCliente } from "@/lib/auth";
import { listarComposicion, listarMediciones, obtenerCliente, type Medicion } from "@/lib/datos";

export const metadata: Metadata = { title: "Mi progreso" };

const CAMPOS: { clave: keyof Medicion; nombre: string }[] = [
  { clave: "cintura", nombre: "Cintura" },
  { clave: "cadera", nombre: "Cadera" },
  { clave: "cuello", nombre: "Cuello" },
  { clave: "brazo_izq", nombre: "Brazo izq." },
  { clave: "brazo_der", nombre: "Brazo der." },
  { clave: "pierna_izq", nombre: "Pierna izq." },
  { clave: "pierna_der", nombre: "Pierna der." },
  { clave: "pantorrilla_izq", nombre: "Pantorrilla izq." },
  { clave: "pantorrilla_der", nombre: "Pantorrilla der." },
];
const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" });

export default async function MiProgreso() {
  const { cliente_id } = await requerirCliente();
  const [cliente, composicion, mediciones] = await Promise.all([
    obtenerCliente(cliente_id),
    listarComposicion(cliente_id),
    listarMediciones(cliente_id),
  ]);
  if (!cliente) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Mi progreso</h1>
      <VistaRecomposicion objetivo={cliente.objetivo} composicion={composicion} />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Mis medidas (cm)</h2>
        {mediciones.length === 0 ? (
          <p className="tarjeta p-6 text-sm text-slate-500">Aún no hay medidas registradas.</p>
        ) : (
          <div className="tarjeta overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="bg-pink-50/60 text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Fecha</th>
                  {CAMPOS.map((c) => (
                    <th key={c.clave} className="px-2 py-2 text-right font-medium">{c.nombre}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...mediciones].reverse().map((m) => (
                  <tr key={m.id} className="border-t border-pink-50">
                    <td className="whitespace-nowrap px-4 py-2 text-slate-700">{fechaCorta(m.fecha)}</td>
                    {CAMPOS.map((c) => (
                      <td key={c.clave} className="px-2 py-2 text-right tabular-nums">{(m[c.clave] as number | null) ?? "—"}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
