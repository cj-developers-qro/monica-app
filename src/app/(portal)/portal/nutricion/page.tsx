import type { Metadata } from "next";
import Link from "next/link";
import { SeguimientoNutricional } from "@/components/SeguimientoNutricional";
import { semanaActual, VistaPlanNutricional } from "@/components/VistaPlanNutricional";
import { requerirCliente } from "@/lib/auth";
import { listarPlanes, listarSeguimiento, obtenerPlan } from "@/lib/datos";
import { hoy } from "@/lib/formulario";

export const metadata: Metadata = { title: "Mi nutrición" };

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

export default async function MiNutricion({ searchParams }: PageProps<"/portal/nutricion">) {
  const { cliente_id } = await requerirCliente();
  const consulta = await searchParams;
  const [planes, seguimiento] = await Promise.all([listarPlanes(cliente_id), listarSeguimiento(cliente_id)]);
  const hoyISO = hoy();
  const elegido =
    planes.find((p) => p.id === Number(consulta.plan)) ?? planes.find((p) => p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin) ?? planes[0];
  // obtenerPlan vuelve a comprobar que el plan sea de este cliente.
  const registro = elegido ? await obtenerPlan(cliente_id, elegido.id) : null;

  if (!registro) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-slate-900">Mi nutrición</h1>
        <p className="tarjeta p-6 text-sm text-slate-500">Moni todavía no te genera un plan de nutrición.</p>
      </div>
    );
  }
  const numeroSemana = Math.min(4, Math.max(1, Number(consulta.semana) || semanaActual(registro.plan, hoyISO)));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900">Mi nutrición</h1>
        {planes.length > 1 && (
          <nav className="flex flex-wrap gap-2" aria-label="Mis planes">
            {planes.map((p) => (
              <Link key={p.id} href={`/portal/nutricion?plan=${p.id}`} aria-current={p.id === registro.id ? "page" : undefined} className="chip text-xs">
                {fechaCorta(p.fecha_inicio)}
              </Link>
            ))}
          </nav>
        )}
      </div>
      <VistaPlanNutricional
        plan={registro.plan}
        numeroSemana={numeroSemana}
        hrefSemana={(n) => `/portal/nutricion?plan=${registro.id}&semana=${n}`}
        hrefIntercambio={(u) => `/portal/nutricion/intercambio?plan=${registro.id}&s=${u.semana}&d=${u.dia}&c=${u.comida}&i=${u.item}`}
        acciones={
          <Link href={`/exportar/${cliente_id}?plan=${registro.id}`} className="boton">
            Exportar mi plan
          </Link>
        }
      />
      <SeguimientoNutricional clienteId={cliente_id} planId={registro.id} seguimiento={seguimiento} puedeEliminar={false} />
    </div>
  );
}
