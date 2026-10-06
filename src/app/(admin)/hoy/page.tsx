import type { Metadata } from "next";
import Link from "next/link";
import { requerirAdmin } from "@/lib/auth";
import { panelHoy, type PendienteCliente } from "@/lib/datos";

export const metadata: Metadata = { title: "Hoy" };

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
const conFechas = (t: string | null) => t?.replace(/\d{4}-\d{2}-\d{2}/g, (f) => fechaCorta(f)) ?? null;

/** Pantalla de inicio de Moni: lo que requiere atención hoy y lo que pasó en la semana. */
export default async function Hoy() {
  const yo = await requerirAdmin();
  const p = await panelHoy();
  const fecha = new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" });
  const hoy = fecha.charAt(0).toUpperCase() + fecha.slice(1);
  const totalPendientes = [p.seguimientoPendiente, p.medicionPendiente, p.sinPlan, p.planPorVencer, p.sinRutina, p.adherenciaBaja, p.sinEntrenar]
    .reduce((n, l) => n + l.length, 0);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Hola, {yo.nombre.split(" ")[0]} 👋</h1>
          <p className="text-sm text-slate-500">{hoy}</p>
        </div>
        <Link href="/clientes/nuevo" className="boton">
          + Nuevo cliente
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato titulo="Clientes activos" valor={String(p.resumen.clientes)} />
        <Dato titulo="Entrenamientos esta semana" valor={String(p.resumen.sesionesSemana)} detalle="últimos 7 días" />
        <Dato titulo="Semanas registradas" valor={String(p.resumen.seguimientosSemana)} detalle="seguimientos, últimos 7 días" />
        <Dato
          titulo="Adherencia promedio"
          valor={p.resumen.adherenciaPromedio != null ? `${p.resumen.adherenciaPromedio} %` : "—"}
          detalle="últimas 4 semanas"
        />
      </section>

      {totalPendientes === 0 && p.accesoPendiente.length === 0 ? (
        <p className="tarjeta p-6 text-center text-sm text-emerald-700">✓ Todo al día: no hay pendientes con tus clientes.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Tarjeta
            icono="📝"
            titulo="No han registrado su semana"
            ayuda="Tienen plan vigente y ningún seguimiento en los últimos 7 días."
            lista={p.seguimientoPendiente}
            ruta="nutricion"
          />
          <Tarjeta
            icono="📏"
            titulo="Toca medición"
            ayuda="Más de 4 semanas sin medir composición (o nunca)."
            lista={p.medicionPendiente}
            ruta="composicion"
          />
          <Tarjeta icono="⏳" titulo="Plan de nutrición por vencer" ayuda="Termina en 5 días o menos y no hay uno siguiente." lista={p.planPorVencer} ruta="nutricion" />
          <Tarjeta icono="🥗" titulo="Sin plan de nutrición vigente" lista={p.sinPlan} ruta="nutricion" />
          <Tarjeta icono="🏋️" titulo="Sin rutina asignada" lista={p.sinRutina} ruta="rutinas" />
          <Tarjeta icono="⚠️" titulo="Adherencia baja" ayuda="Su último registro (últimas 3 semanas) fue menor a 60 %." lista={p.adherenciaBaja} ruta="nutricion" />
          <Tarjeta
            icono="💤"
            titulo="Dejaron de registrar entrenamientos"
            ayuda="Usaban la bitácora y llevan más de 7 días sin registrar."
            lista={p.sinEntrenar}
            ruta="entrenamiento"
          />
          <Tarjeta icono="🔑" titulo="Acceso a la app pendiente" lista={p.accesoPendiente} ruta="editar#acceso" />
        </div>
      )}

      <section className="tarjeta p-5">
        <h2 className="text-base font-semibold text-slate-900">Actividad de la semana</h2>
        {p.actividad.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">Todavía no hay registros esta semana.</p>
        ) : (
          <ul className="mt-3 divide-y divide-pink-50 text-sm">
            {p.actividad.map((a, n) => (
              <li key={n} className="flex flex-wrap items-baseline justify-between gap-2 py-2">
                <span>
                  {a.tipo === "sesion" ? "🏋️" : "📝"}{" "}
                  <Link href={`/clientes/${a.cliente_id}/${a.tipo === "sesion" ? "entrenamiento" : "nutricion"}`} className="font-medium text-slate-800 hover:text-pink-700">
                    {a.nombre}
                  </Link>{" "}
                  <span className="text-slate-600">· {a.detalle}</span>
                </span>
                <span className="text-xs text-slate-400">{fechaCorta(a.fecha)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tarjeta({ icono, titulo, ayuda, lista, ruta }: { icono: string; titulo: string; ayuda?: string; lista: PendienteCliente[]; ruta: string }) {
  if (lista.length === 0) return null;
  return (
    <section className="tarjeta p-5">
      <h2 className="flex items-center justify-between gap-2 text-sm font-semibold text-slate-900">
        <span>
          {icono} {titulo}
        </span>
        <span className="insignia-marca">{lista.length}</span>
      </h2>
      {ayuda && <p className="mt-0.5 text-xs text-slate-500">{ayuda}</p>}
      <ul className="mt-3 divide-y divide-pink-50 text-sm">
        {lista.slice(0, 8).map((c) => (
          <li key={c.cliente_id} className="flex items-baseline justify-between gap-3 py-1.5">
            <Link href={`/clientes/${c.cliente_id}/${ruta}`} className="font-medium text-slate-800 hover:text-pink-700">
              {c.nombre}
            </Link>
            {c.detalle && <span className="text-right text-xs text-slate-500">{conFechas(c.detalle)}</span>}
          </li>
        ))}
      </ul>
      {lista.length > 8 && <p className="mt-2 text-xs text-slate-500">y {lista.length - 8} más…</p>}
    </section>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-slate-900">{valor}</p>
      {detalle && <p className="text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}
