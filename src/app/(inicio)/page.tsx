import Link from "next/link";
import { InsigniaObjetivo } from "@/components/InsigniaObjetivo";
import { listarClientes } from "@/lib/datos";

export default async function Inicio() {
  const clientes = await listarClientes();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-500">{clientes.length} cliente{clientes.length === 1 ? "" : "s"} en seguimiento</p>
        </div>
        <Link href="/clientes/nuevo" className="boton">
          + Nuevo cliente (onboarding)
        </Link>
      </header>

      {clientes.length === 0 ? (
        <div className="tarjeta p-10 text-center">
          <p className="font-medium text-slate-800">Aún no hay clientes registrados.</p>
          <p className="mt-1 text-sm text-slate-500">Empieza con el cuestionario de onboarding de tu primer cliente.</p>
        </div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((c) => (
            <li key={c.id}>
              <Link href={`/clientes/${c.id}`} className="tarjeta block p-5 transition hover:border-emerald-300 hover:shadow-md">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{c.nombre}</p>
                  <span className="text-xs text-slate-500">
                    {c.sexo === "F" ? "Mujer" : "Hombre"}
                    {c.edad ? ` · ${c.edad} años` : ""}
                  </span>
                </div>
                <div className="mt-2">
                  <InsigniaObjetivo objetivo={c.objetivo} />
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <dt className="text-xs text-slate-500">Peso actual</dt>
                    <dd className="font-medium tabular-nums">{c.ultimo_peso != null ? `${c.ultimo_peso} kg` : "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500">% grasa</dt>
                    <dd className="font-medium tabular-nums">{c.ultima_grasa != null ? `${c.ultima_grasa} %` : "—"}</dd>
                  </div>
                </dl>
                <p className="mt-3 truncate text-xs text-slate-500">
                  Rutina: <span className="text-slate-700">{c.rutina_activa ?? "sin asignar"}</span>
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
