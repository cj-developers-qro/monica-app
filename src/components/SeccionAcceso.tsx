import { PanelAcceso } from "./PanelAcceso";
import { obtenerAcceso } from "@/lib/datos";

/** Carga el acceso del cliente (solo la administradora) y muestra el panel para administrarlo. */
export async function SeccionAcceso({ clienteId, nombre }: { clienteId: number; nombre: string }) {
  const acceso = await obtenerAcceso(clienteId);
  return (
    <PanelAcceso
      clienteId={clienteId}
      nombre={nombre}
      acceso={
        acceso && {
          usuario: acceso.usuario,
          activo: acceso.activo,
          debe_cambiar: acceso.debe_cambiar,
          ultimo_acceso: acceso.ultimo_acceso,
          acepto_privacidad: acceso.acepto_privacidad,
          telegram_vinculado_en: acceso.telegram_vinculado_en,
        }
      }
    />
  );
}
