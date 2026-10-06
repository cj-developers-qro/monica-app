import { VistaIntercambio } from "@/components/VistaIntercambio";
import { obtenerPlan } from "@/lib/datos";
import { ubicacionDeConsulta } from "@/lib/formulario";
import { clienteDeRuta } from "../../cliente";

export default async function CambiarAlimentoAdmin({ params, searchParams }: PageProps<"/clientes/[id]/nutricion/intercambio">) {
  const cliente = await clienteDeRuta(params);
  const q = await searchParams;
  const planId = Number(q.plan);
  const registro = await obtenerPlan(cliente.id, planId);
  const u = ubicacionDeConsulta(q);
  const volver = `/clientes/${cliente.id}/nutricion?plan=${planId}&semana=${u.semana + 1}`;
  if (!registro) return <p className="tarjeta p-6 text-sm text-slate-500">No encontramos ese plan.</p>;
  return <VistaIntercambio clienteId={cliente.id} planId={planId} plan={registro.plan} onboarding={cliente.onboarding} ubicacion={u} volver={volver} />;
}
