import type { Metadata } from "next";
import { VistaIntercambio } from "@/components/VistaIntercambio";
import { requerirCliente } from "@/lib/auth";
import { obtenerCliente, obtenerPlan } from "@/lib/datos";
import { ubicacionDeConsulta } from "@/lib/formulario";

export const metadata: Metadata = { title: "Cambiar alimento" };

export default async function CambiarAlimento({ searchParams }: PageProps<"/portal/nutricion/intercambio">) {
  const { cliente_id } = await requerirCliente();
  const q = await searchParams;
  const planId = Number(q.plan);
  const [registro, cliente] = await Promise.all([obtenerPlan(cliente_id, planId), obtenerCliente(cliente_id)]);
  const u = ubicacionDeConsulta(q);
  const volver = `/portal/nutricion?plan=${planId}&semana=${u.semana + 1}`;
  if (!registro || !cliente) return <p className="tarjeta p-6 text-sm text-slate-500">No encontramos ese plan.</p>;
  return <VistaIntercambio clienteId={cliente_id} planId={planId} plan={registro.plan} onboarding={cliente.onboarding} ubicacion={u} volver={volver} />;
}
