import { agruparPorDia, type ItemRutina } from "@/lib/datos";
import { nombreMusculo } from "@/lib/musculos";
import { enlaceVideo } from "@/lib/videos";

const descanso = (s: number) => (s === 0 ? "—" : s % 60 === 0 ? `${s / 60} min` : s > 60 ? `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")} min` : `${s} s`);

/** Plan de la rutina por día: ejercicio, músculos, series, repeticiones y descanso. */
export function DetalleRutina({ items }: { items: ItemRutina[] }) {
  return (
    <div className="space-y-4">
      {agruparPorDia(items).map(({ dia, items }) => (
        <section key={dia} className="tarjeta overflow-hidden">
          <h3 className="border-b border-pink-100 bg-pink-50/60 px-4 py-2 text-sm font-semibold text-slate-800">{dia}</h3>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-xs text-slate-500">
                <tr>
                  <th className="px-4 py-2 font-medium">Ejercicio</th>
                  <th className="px-2 py-2 text-center font-medium">Series</th>
                  <th className="px-2 py-2 text-center font-medium">Reps</th>
                  <th className="px-2 py-2 text-center font-medium">Descanso</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-t border-slate-100 align-top">
                    <td className="px-4 py-2">
                      <p className="font-medium text-slate-800">{i.ejercicio.nombre}</p>
                      <a
                        href={enlaceVideo(i.ejercicio).url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-pink-700 hover:underline print:hidden"
                      >
                        ▶ {enlaceVideo(i.ejercicio).propio ? "Ver video" : "Ver cómo se hace"}
                      </a>
                      <p className="text-xs text-slate-500">
                        {i.ejercicio.musculos_principales.map(nombreMusculo).join(", ")}
                        {i.notas && <span className="text-slate-600"> · {i.notas}</span>}
                      </p>
                    </td>
                    <td className="px-2 py-2 text-center tabular-nums">{i.series}</td>
                    <td className="px-2 py-2 text-center">{i.repeticiones}</td>
                    <td className="px-2 py-2 text-center tabular-nums">{descanso(i.descanso_seg)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
