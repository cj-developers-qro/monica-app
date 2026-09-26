import type { Metadata } from "next";
import Link from "next/link";
import { DiagramaMusculos } from "@/components/DiagramaMusculos";
import { listarEjercicios } from "@/lib/datos";
import { esMusculo, LISTA_MUSCULOS, MUSCULOS, nombreMusculo } from "@/lib/musculos";
import { TIPOS_EJERCICIO } from "@/lib/objetivos";

export const metadata: Metadata = { title: "Catálogo de ejercicios" };

export default async function CatalogoEjercicios({ searchParams }: PageProps<"/ejercicios">) {
  const { musculo } = await searchParams;
  const filtro = typeof musculo === "string" && esMusculo(musculo) ? musculo : null;
  const ejercicios = (await listarEjercicios()).filter(
    (e) => !filtro || e.musculos_principales.includes(filtro) || e.musculos_secundarios.includes(filtro),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de ejercicios</h1>
          <p className="text-sm text-slate-500">Base para armar las rutinas. Cada ejercicio define los músculos que se resaltan en la imagen.</p>
        </div>
        <Link href="/ejercicios/nuevo" className="boton">+ Nuevo ejercicio</Link>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por músculo">
        {[null, ...LISTA_MUSCULOS].map((m) => (
          <Link
            key={m ?? "todos"}
            href={m ? `/ejercicios?musculo=${m}` : "/ejercicios"}
            aria-current={filtro === m ? "page" : undefined}
            className="chip text-xs"
          >
            {m ? MUSCULOS[m] : "Todos"}
          </Link>
        ))}
      </nav>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ejercicios.map((e) => (
          <li key={e.id}>
            <Link href={`/ejercicios/${e.id}`} className="tarjeta flex h-full flex-col p-3 transition hover:border-pink-300 hover:shadow-md">
              <DiagramaMusculos principales={e.musculos_principales} secundarios={e.musculos_secundarios} leyenda={false} />
              <p className="mt-2 font-medium text-slate-900">{e.nombre}</p>
              <p className="text-xs text-slate-500">
                {TIPOS_EJERCICIO[e.tipo]} · {e.equipo || "Sin equipo"}
              </p>
              <p className="mt-1 text-xs text-slate-600">{e.musculos_principales.map(nombreMusculo).join(", ")}</p>
              <p className="mt-auto pt-2 text-xs text-slate-400">
                {e.usos ? `En ${e.usos} rutina${e.usos === 1 ? "" : "s"}` : "Sin usar"}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
