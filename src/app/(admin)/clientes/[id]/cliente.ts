import { notFound } from "next/navigation";
import { obtenerCliente } from "@/lib/datos";

/** Carga el cliente de la ruta o responde 404. */
export async function clienteDeRuta(params: Promise<{ id: string }>) {
  const { id } = await params;
  const cliente = await obtenerCliente(Number(id));
  if (!cliente) notFound();
  return cliente;
}
