import { NIVELES, OBJETIVOS, type Nivel, type Objetivo } from "@/lib/objetivos";

export function InsigniaObjetivo({ objetivo }: { objetivo: Objetivo }) {
  const o = OBJETIVOS[objetivo];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${o.clase}`}>
      {o.nombre}
    </span>
  );
}

export function InsigniaNivel({ nivel }: { nivel: Nivel }) {
  return (
    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-200">
      {NIVELES[nivel]}
    </span>
  );
}
