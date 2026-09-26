import Link from "next/link";
import type { ReactNode } from "react";
import { ImagenRutina } from "./ImagenRutina";
import { InsigniaNivel, InsigniaObjetivo } from "./InsigniaObjetivo";
import { agruparPorDia, type RutinaConEjercicios } from "@/lib/datos";

export function TarjetaRutina({ rutina, children }: { rutina: RutinaConEjercicios; children?: ReactNode }) {
  const dias = agruparPorDia(rutina.items);
  return (
    <article className="tarjeta flex flex-col overflow-hidden">
      <Link href={`/rutinas/${rutina.id}`} className="block border-b border-slate-100 p-3 transition hover:bg-slate-50">
        <ImagenRutina rutina={rutina} />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Link href={`/rutinas/${rutina.id}`} className="font-semibold text-slate-900 hover:text-emerald-700">
          {rutina.nombre}
        </Link>
        <div className="flex flex-wrap gap-1.5">
          <InsigniaObjetivo objetivo={rutina.objetivo} />
          <InsigniaNivel nivel={rutina.nivel} />
        </div>
        <p className="text-xs text-slate-500">
          {rutina.dias_semana} días/semana · {dias.length} sesiones distintas · {rutina.items.length} ejercicios
        </p>
        {rutina.cliente_nombre && <p className="text-xs text-slate-500">Personalizada para {rutina.cliente_nombre}</p>}
        {children && <div className="mt-auto flex flex-wrap gap-2 pt-2">{children}</div>}
      </div>
    </article>
  );
}
