import { BotonAccion } from "@/components/BotonAccion";
import { FormularioCliente } from "@/components/FormularioCliente";
import { SeccionAcceso } from "@/components/SeccionAcceso";
import { actualizarCliente, eliminarCliente } from "@/app/acciones/clientes";
import { clienteDeRuta } from "../cliente";

export default async function EditarCliente({ params }: PageProps<"/clientes/[id]/editar">) {
  const cliente = await clienteDeRuta(params);
  return (
    <div className="space-y-6">
      <SeccionAcceso clienteId={cliente.id} nombre={cliente.nombre} />
      <FormularioCliente accion={actualizarCliente.bind(null, cliente.id)} cliente={cliente} />
      <section className="rounded-2xl border border-red-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-red-800">Eliminar cliente (baja definitiva)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Se borran su perfil, mediciones, composición, rutinas personalizadas, planes de nutrición y su acceso. Si solo quieres que deje de
          entrar, usa «Desactivar acceso».
        </p>
        <div className="mt-3">
          <BotonAccion
            accion={eliminarCliente.bind(null, cliente.id)}
            confirmar={`¿Eliminar a ${cliente.nombre} y todo su historial? Esta acción no se puede deshacer.`}
            className="boton-peligro"
          >
            Eliminar cliente
          </BotonAccion>
        </div>
      </section>
    </div>
  );
}
