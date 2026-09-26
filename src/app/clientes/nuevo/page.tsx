import type { Metadata } from "next";
import { FormularioCliente } from "@/components/FormularioCliente";
import { crearCliente } from "@/app/acciones/clientes";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default function NuevoCliente() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Onboarding de nuevo cliente</h1>
        <p className="text-sm text-slate-500">
          Las respuestas forman el perfil clínico. El peso inicial se guarda como primer registro de composición corporal.
        </p>
      </header>
      <FormularioCliente accion={crearCliente} />
    </div>
  );
}
