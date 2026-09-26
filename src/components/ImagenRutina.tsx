import { DiagramaMusculos } from "./DiagramaMusculos";
import { combinarMusculos } from "@/lib/musculos";
import type { RutinaConEjercicios } from "@/lib/datos";

/** Imagen de la rutina: la imagen propia si se subió una; si no, el diagrama de músculos trabajados. */
export function ImagenRutina({ rutina, leyenda = false }: { rutina: RutinaConEjercicios; leyenda?: boolean }) {
  const { principales, secundarios } = combinarMusculos(rutina.items.map((i) => i.ejercicio));
  if (rutina.imagen) {
    return (
      <figure>
        {/* eslint-disable-next-line @next/next/no-img-element -- imagen servida por la ruta propia */}
        <img
          src={`/rutinas/${rutina.id}/imagen?v=${encodeURIComponent(rutina.actualizado_en)}`}
          alt={`Imagen de la rutina ${rutina.nombre}`}
          className="aspect-[420/385] w-full rounded-lg bg-slate-50 object-contain"
        />
        {leyenda && (
          <details className="mt-2 text-xs text-slate-600">
            <summary className="cursor-pointer select-none">Ver diagrama de músculos trabajados</summary>
            <DiagramaMusculos principales={principales} secundarios={secundarios} className="mt-2" />
          </details>
        )}
      </figure>
    );
  }
  return <DiagramaMusculos principales={principales} secundarios={secundarios} leyenda={leyenda} />;
}
