import Link from "next/link";
import { BotonAccion } from "@/components/BotonAccion";
import { DetalleRutina } from "@/components/DetalleRutina";
import { ImagenRutina } from "@/components/ImagenRutina";
import { InsigniaNivel, InsigniaObjetivo } from "@/components/InsigniaObjetivo";
import { duplicarRutina, eliminarRutina } from "@/app/acciones/rutinas";
import { OBJETIVOS } from "@/lib/objetivos";
import { rutinaDeRuta } from "./rutina";

export default async function VerRutina({ params }: PageProps<"/rutinas/[id]">) {
  const rutina = await rutinaDeRuta(params);
  const objetivo = OBJETIVOS[rutina.objetivo];
  const volver = rutina.cliente_id ? `/clientes/${rutina.cliente_id}/rutinas` : "/rutinas";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-3">
        <Link href={volver} className="enlace-volver">
          ← {rutina.cliente_id ? `Rutinas de ${rutina.cliente_nombre}` : "Catálogo de rutinas"}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{rutina.nombre}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              <InsigniaObjetivo objetivo={rutina.objetivo} />
              <InsigniaNivel nivel={rutina.nivel} />
              <span>{rutina.dias_semana} días por semana</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/rutinas/${rutina.id}/editar`} className="boton">Editar</Link>
            <BotonAccion accion={duplicarRutina.bind(null, rutina.id)}>Duplicar</BotonAccion>
            <BotonAccion
              accion={eliminarRutina.bind(null, rutina.id)}
              confirmar="¿Eliminar esta rutina? También se quitará del historial de los clientes que la tengan asignada."
              className="boton-peligro"
            >
              Eliminar
            </BotonAccion>
          </div>
        </div>
        {rutina.descripcion && <p className="max-w-3xl text-sm text-slate-600">{rutina.descripcion}</p>}
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <DetalleRutina items={rutina.items} />
        <aside className="space-y-4">
          <section className="tarjeta p-4">
            <h2 className="mb-2 text-sm font-semibold text-slate-900">Músculos trabajados</h2>
            <ImagenRutina rutina={rutina} leyenda />
            <a href={`/rutinas/${rutina.id}/imagen?descargar=1`} className="enlace mt-3 inline-block text-xs">
              Descargar imagen
            </a>
          </section>
          <section className="tarjeta p-4 text-sm">
            <h2 className="font-semibold text-slate-900">Alineación con el objetivo</h2>
            <p className="mt-1 text-xs text-slate-500">{objetivo.enfoque}</p>
            <p className="mt-2 text-xs text-slate-600">
              Recomendado: {objetivo.series} series · {objetivo.repeticiones} reps · descanso {objetivo.descanso}. Cardio: {objetivo.cardio}.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
