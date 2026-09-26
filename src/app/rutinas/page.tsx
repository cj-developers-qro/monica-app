import type { Metadata } from "next";
import Link from "next/link";
import { TarjetaRutina } from "@/components/TarjetaRutina";
import { listarRutinas } from "@/lib/datos";
import { esObjetivo, LISTA_OBJETIVOS, OBJETIVOS } from "@/lib/objetivos";

export const metadata: Metadata = { title: "Catálogo de rutinas" };

export default async function CatalogoRutinas({ searchParams }: PageProps<"/rutinas">) {
  const { objetivo } = await searchParams;
  const filtro = esObjetivo(objetivo) ? objetivo : null;
  const todas = await listarRutinas({ incluirPersonalizadas: true });
  const visibles = todas.filter((r) => !filtro || r.objetivo === filtro);
  const catalogo = visibles.filter((r) => r.cliente_id == null);
  const personalizadas = visibles.filter((r) => r.cliente_id != null);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catálogo de rutinas</h1>
          <p className="text-sm text-slate-500">Rutinas base alineadas a cada objetivo. Puedes editarlas, duplicarlas o crear nuevas.</p>
        </div>
        <Link href="/rutinas/nueva" className="boton">
          + Nueva rutina
        </Link>
      </header>

      <nav className="flex flex-wrap gap-2" aria-label="Filtrar por objetivo">
        <Filtro href="/rutinas" activo={!filtro}>
          Todas
        </Filtro>
        {LISTA_OBJETIVOS.map((o) => (
          <Filtro key={o} href={`/rutinas?objetivo=${o}`} activo={filtro === o}>
            {OBJETIVOS[o].nombre}
          </Filtro>
        ))}
      </nav>

      {filtro && (
        <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
          <strong className="text-slate-800">{OBJETIVOS[filtro].nombre}:</strong> {OBJETIVOS[filtro].enfoque}
        </p>
      )}

      <Rejilla rutinas={catalogo} vacio="No hay rutinas de catálogo para este objetivo." />

      {personalizadas.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Personalizadas para clientes</h2>
          <Rejilla rutinas={personalizadas} vacio="" />
        </section>
      )}
    </div>
  );
}

function Rejilla({ rutinas, vacio }: { rutinas: Awaited<ReturnType<typeof listarRutinas>>; vacio: string }) {
  if (rutinas.length === 0) return <p className="tarjeta p-8 text-center text-sm text-slate-500">{vacio}</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rutinas.map((r) => (
        <TarjetaRutina key={r.id} rutina={r} />
      ))}
    </div>
  );
}

function Filtro({ href, activo, children }: { href: string; activo: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={activo ? "page" : undefined}
      className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm text-slate-600 hover:bg-slate-50 aria-[current=page]:border-emerald-600 aria-[current=page]:bg-emerald-600 aria-[current=page]:text-white"
    >
      {children}
    </Link>
  );
}
