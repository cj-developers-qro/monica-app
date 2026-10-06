import { BitacoraEntrenamiento } from "@/components/BitacoraEntrenamiento";
import { listarAsignaciones, listarSesiones, marcasPorEjercicio } from "@/lib/datos";
import { clienteDeRuta } from "../cliente";

export default async function Entrenamiento({ params, searchParams }: PageProps<"/clientes/[id]/entrenamiento">) {
  const cliente = await clienteDeRuta(params);
  const { dia } = await searchParams;
  const [asignaciones, sesiones, marcas] = await Promise.all([listarAsignaciones(cliente.id), listarSesiones(cliente.id), marcasPorEjercicio(cliente.id)]);
  const rutina = asignaciones.find((a) => a.activa)?.rutina ?? null;
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        Lo que {cliente.nombre.split(" ")[0]} registra desde su portal aparece aquí. También puedes registrar tú la sesión, por ejemplo si entrenó contigo.
      </p>
      <BitacoraEntrenamiento
        clienteId={cliente.id}
        rutina={rutina}
        dia={typeof dia === "string" ? dia : null}
        hrefDia={(d) => `/clientes/${cliente.id}/entrenamiento?dia=${encodeURIComponent(d)}`}
        sesiones={sesiones}
        marcas={marcas}
      />
    </div>
  );
}
