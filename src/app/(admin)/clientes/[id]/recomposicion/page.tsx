import { VistaRecomposicion } from "@/components/VistaRecomposicion";
import { listarComposicion } from "@/lib/datos";
import { clienteDeRuta } from "../cliente";

export default async function Recomposicion({ params }: PageProps<"/clientes/[id]/recomposicion">) {
  const cliente = await clienteDeRuta(params);
  return (
    <VistaRecomposicion
      objetivo={cliente.objetivo}
      composicion={await listarComposicion(cliente.id)}
      enlaceRegistro={`/clientes/${cliente.id}/composicion`}
    />
  );
}
