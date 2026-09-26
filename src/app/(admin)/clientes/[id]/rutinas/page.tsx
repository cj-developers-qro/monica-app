import Link from "next/link";
import { BotonAccion } from "@/components/BotonAccion";
import { DetalleRutina } from "@/components/DetalleRutina";
import { BotonEnviar } from "@/components/Formulario";
import { ImagenRutina } from "@/components/ImagenRutina";
import { InsigniaNivel, InsigniaObjetivo } from "@/components/InsigniaObjetivo";
import { TarjetaRutina } from "@/components/TarjetaRutina";
import { asignarRutina, eliminarAsignacion, finalizarAsignacion, personalizarRutina } from "@/app/acciones/clientes";
import { CLAVES_ALERTA } from "@/lib/cuestionario";
import { listarAsignaciones, listarRutinas, type RutinaConEjercicios } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { OBJETIVOS } from "@/lib/objetivos";
import { clienteDeRuta } from "../cliente";

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "medium" });

export default async function RutinasCliente({ params }: PageProps<"/clientes/[id]/rutinas">) {
  const cliente = await clienteDeRuta(params);
  const [asignaciones, catalogo] = await Promise.all([listarAsignaciones(cliente.id), listarRutinas()]);
  const activa = asignaciones.find((a) => a.activa);
  const historial = asignaciones.filter((a) => !a.activa);
  const recomendadas = catalogo.filter((r) => r.objetivo === cliente.objetivo);
  const otras = catalogo.filter((r) => r.objetivo !== cliente.objetivo);
  const objetivo = OBJETIVOS[cliente.objetivo];
  const precauciones = CLAVES_ALERTA.map((c) => cliente.onboarding[c]).filter((v) => v && !/^(no|ninguna?o?s?)\.?$/i.test(v));

  return (
    <div className="space-y-8">
      {precauciones.length > 0 && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <strong>⚠ Adapta los ejercicios a:</strong> {precauciones.join(" · ")}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Rutina activa</h2>
        {activa ? (
          <div className="tarjeta overflow-hidden">
            <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-[300px_minmax(0,1fr)]">
              <div className="mx-auto w-full max-w-xs"><ImagenRutina rutina={activa.rutina} leyenda /></div>
              <div className="min-w-0 space-y-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link href={`/rutinas/${activa.rutina.id}`} className="text-lg font-semibold text-slate-900 hover:text-pink-700">
                      {activa.rutina.nombre}
                    </Link>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <InsigniaObjetivo objetivo={activa.rutina.objetivo} />
                      <InsigniaNivel nivel={activa.rutina.nivel} />
                      <span>Desde {fechaCorta(activa.fecha_inicio)}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activa.rutina.cliente_id === cliente.id ? (
                      <Link href={`/rutinas/${activa.rutina.id}/editar`} className="boton">Editar rutina</Link>
                    ) : (
                      <BotonAccion accion={personalizarRutina.bind(null, cliente.id, activa.rutina.id)} className="boton">
                        Personalizar
                      </BotonAccion>
                    )}
                    <BotonAccion accion={finalizarAsignacion.bind(null, cliente.id, activa.id)} confirmar="¿Finalizar la rutina activa?">
                      Finalizar
                    </BotonAccion>
                  </div>
                </div>
                <Alineacion rutina={activa.rutina} objetivoCliente={cliente.objetivo} />
                {activa.notas && <p className="text-sm text-slate-600">{activa.notas}</p>}
                <DetalleRutina items={activa.rutina.items} />
              </div>
            </div>
          </div>
        ) : (
          <p className="tarjeta p-6 text-sm text-slate-500">
            {cliente.nombre} no tiene rutina activa. Asigna una de las recomendadas para {objetivo.nombre.toLowerCase()}.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Recomendadas para {objetivo.nombre.toLowerCase()}</h2>
          <p className="text-sm text-slate-500">
            <strong>Asignar</strong> usa la rutina del catálogo tal cual; <strong>Personalizar</strong> crea una copia solo para este cliente y abre el editor.
          </p>
        </div>
        <Opciones rutinas={recomendadas} clienteId={cliente.id} activaId={activa?.rutina.id} />
        {otras.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer select-none text-sm font-medium text-slate-600 hover:text-slate-900">
              Ver rutinas de otros objetivos ({otras.length})
            </summary>
            <div className="mt-3">
              <Opciones rutinas={otras} clienteId={cliente.id} activaId={activa?.rutina.id} />
            </div>
          </details>
        )}
      </section>

      {historial.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-900">Historial</h2>
          <ul className="tarjeta divide-y divide-slate-100">
            {historial.map((a) => (
              <li key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <div>
                  <Link href={`/rutinas/${a.rutina.id}`} className="font-medium text-slate-800 hover:text-pink-700">{a.rutina.nombre}</Link>
                  <p className="text-xs text-slate-500">
                    {fechaCorta(a.fecha_inicio)} → {a.fecha_fin ? fechaCorta(a.fecha_fin) : "—"} · {OBJETIVOS[a.rutina.objetivo].nombre}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={asignarRutina.bind(null, cliente.id)}>
                    <input type="hidden" name="rutina_id" value={a.rutina.id} />
                    <BotonEnviar className="boton-secundario">Reactivar</BotonEnviar>
                  </form>
                  <BotonAccion accion={eliminarAsignacion.bind(null, cliente.id, a.id)} confirmar="¿Quitar del historial?" className="boton-peligro">
                    Quitar
                  </BotonAccion>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Alineacion({ rutina, objetivoCliente }: { rutina: RutinaConEjercicios; objetivoCliente: keyof typeof OBJETIVOS }) {
  if (rutina.objetivo === objetivoCliente) {
    return <p className="text-sm font-medium text-emerald-700">✓ Alineada con el objetivo del cliente ({OBJETIVOS[objetivoCliente].nombre}).</p>;
  }
  return (
    <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
      ▲ Esta rutina está diseñada para <strong>{OBJETIVOS[rutina.objetivo].nombre.toLowerCase()}</strong>, pero el objetivo del cliente es{" "}
      <strong>{OBJETIVOS[objetivoCliente].nombre.toLowerCase()}</strong>.
    </p>
  );
}

function Opciones({ rutinas, clienteId, activaId }: { rutinas: RutinaConEjercicios[]; clienteId: number; activaId?: number }) {
  if (rutinas.length === 0) {
    return (
      <p className="tarjeta p-6 text-sm text-slate-500">
        No hay rutinas de catálogo para este objetivo. <Link href="/rutinas/nueva" className="enlace">Crea una</Link>.
      </p>
    );
  }
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {rutinas.map((r) => (
        <TarjetaRutina key={r.id} rutina={r}>
          {r.id === activaId ? (
            <span className="text-sm font-medium text-emerald-700">✓ Asignada</span>
          ) : (
            <form action={asignarRutina.bind(null, clienteId)} className="flex gap-2">
              <input type="hidden" name="rutina_id" value={r.id} />
              <input type="hidden" name="fecha_inicio" value={hoy()} />
              <BotonEnviar className="boton">Asignar</BotonEnviar>
            </form>
          )}
          <BotonAccion accion={personalizarRutina.bind(null, clienteId, r.id)}>Personalizar</BotonAccion>
        </TarjetaRutina>
      ))}
    </div>
  );
}
