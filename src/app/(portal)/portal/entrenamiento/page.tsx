import type { Metadata } from "next";
import { BitacoraEntrenamiento } from "@/components/BitacoraEntrenamiento";
import { requerirCliente } from "@/lib/auth";
import { listarAsignaciones, listarSesiones, marcasPorEjercicio } from "@/lib/datos";

export const metadata: Metadata = { title: "Mi entrenamiento" };

export default async function MiEntrenamiento({ searchParams }: PageProps<"/portal/entrenamiento">) {
  const { cliente_id } = await requerirCliente();
  const { dia } = await searchParams;
  const [asignaciones, sesiones, marcas] = await Promise.all([listarAsignaciones(cliente_id), listarSesiones(cliente_id), marcasPorEjercicio(cliente_id)]);
  const rutina = asignaciones.find((a) => a.activa)?.rutina ?? null;
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mi entrenamiento</h1>
        <p className="mt-1 text-sm text-slate-500">Registra cada sesión: así Moni ve tu constancia y cómo suben tus cargas.</p>
      </div>
      <BitacoraEntrenamiento
        clienteId={cliente_id}
        rutina={rutina}
        dia={typeof dia === "string" ? dia : null}
        hrefDia={(d) => `/portal/entrenamiento?dia=${encodeURIComponent(d)}`}
        sesiones={sesiones}
        marcas={marcas}
      />
    </div>
  );
}
