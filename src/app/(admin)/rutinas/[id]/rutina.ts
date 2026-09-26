import { notFound } from "next/navigation";
import { obtenerRutina } from "@/lib/datos";

export async function rutinaDeRuta(params: Promise<{ id: string }>) {
  const { id } = await params;
  const rutina = await obtenerRutina(Number(id));
  if (!rutina) notFound();
  return rutina;
}
