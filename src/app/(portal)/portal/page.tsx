import type { Metadata } from "next";
import Link from "next/link";
import { DetalleRutina } from "@/components/DetalleRutina";
import { ImagenRutina } from "@/components/ImagenRutina";
import { InsigniaNivel, InsigniaObjetivo } from "@/components/InsigniaObjetivo";
import { requerirCliente } from "@/lib/auth";
import { telegramActivo } from "@/lib/telegram";
import { listarAsignaciones, listarComposicion, listarPlanes, obtenerCliente } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { OBJETIVOS } from "@/lib/objetivos";
import { diagnosticar, serieRecomposicion } from "@/lib/recomposicion";

export const metadata: Metadata = { title: "Mi resumen" };

const fechaLarga = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { dateStyle: "long" });

export default async function MiResumen() {
  const { cliente_id, telegram_chat_id } = await requerirCliente();
  const [cliente, composicion, asignaciones, planes] = await Promise.all([
    obtenerCliente(cliente_id),
    listarComposicion(cliente_id),
    listarAsignaciones(cliente_id),
    listarPlanes(cliente_id),
  ]);
  if (!cliente) return null;
  const ultimo = composicion[composicion.length - 1];
  // Cada medida muestra su valor más reciente (no todos los registros traen % de grasa y músculo).
  const reciente = (campo: "grasa_pct" | "musculo_pct") => [...composicion].reverse().find((c) => c[campo] != null);
  const grasa = reciente("grasa_pct");
  const musculo = reciente("musculo_pct");
  const d = diagnosticar(serieRecomposicion(composicion), cliente.objetivo);
  const activa = asignaciones.find((a) => a.activa);
  const hoyISO = hoy();
  const planVigente = planes.find((p) => p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin) ?? planes[0];

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold text-slate-900">Hola, {cliente.nombre.split(" ")[0]}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          Tu objetivo: <InsigniaObjetivo objetivo={cliente.objetivo} />
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato titulo="Peso actual" valor={ultimo ? `${ultimo.peso_kg} kg` : "—"} detalle={ultimo ? fechaLarga(ultimo.fecha) : "Sin registros"} />
        <Dato titulo="% de grasa" valor={grasa ? `${grasa.grasa_pct} %` : "—"} detalle={grasa ? fechaLarga(grasa.fecha) : undefined} />
        <Dato titulo="% de músculo" valor={musculo ? `${musculo.musculo_pct} %` : "—"} detalle={musculo ? fechaLarga(musculo.fecha) : undefined} />
        <Dato
          titulo="Tu progreso"
          valor={d.estado === "sin_datos" ? "En espera" : d.estado === "logrado" ? "✓ Vas muy bien" : d.estado === "parcial" ? "Avance parcial" : "A reforzar"}
          detalle={d.estado === "sin_datos" ? "Se calcula con 2 mediciones" : d.titulo}
        />
      </section>

      {telegramActivo() && !telegram_chat_id && (
        <section className="tarjeta flex flex-wrap items-center justify-between gap-3 p-4">
          <p className="text-sm text-slate-700">
            📲 <strong>¿Quieres recibir los avisos de Moni en Telegram?</strong> Tu nuevo plan, tu nueva rutina y un recordatorio cada domingo.
          </p>
          <Link href="/cuenta#telegram" className="boton-secundario">
            Activar avisos
          </Link>
        </section>
      )}

      {planVigente && (
        <section className="aviso-marca flex flex-wrap items-center justify-between gap-3">
          <p>
            <strong>Tu plan de nutrición</strong> va del {fechaLarga(planVigente.fecha_inicio)} al {fechaLarga(planVigente.fecha_fin)}.
          </p>
          <div className="flex gap-2">
            <Link href="/portal/nutricion" className="boton">Ver mi menú</Link>
            <Link href={`/exportar/${cliente_id}?plan=${planVigente.id}`} className="boton-secundario">Exportar plan</Link>
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Mi rutina</h2>
        {activa ? (
          <div className="tarjeta grid grid-cols-1 gap-6 p-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <div className="mx-auto w-full max-w-xs">
              <ImagenRutina rutina={activa.rutina} leyenda />
            </div>
            <div className="min-w-0 space-y-4">
              <div>
                <p className="text-lg font-semibold text-slate-900">{activa.rutina.nombre}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  <InsigniaNivel nivel={activa.rutina.nivel} />
                  <span>{activa.rutina.dias_semana} días por semana · desde {fechaLarga(activa.fecha_inicio)}</span>
                </div>
                {activa.rutina.descripcion && <p className="mt-2 text-sm text-slate-600">{activa.rutina.descripcion}</p>}
              </div>
              <p className="text-xs text-slate-500">
                Recomendado para tu objetivo: {OBJETIVOS[cliente.objetivo].series} series · {OBJETIVOS[cliente.objetivo].repeticiones} repeticiones · descanso{" "}
                {OBJETIVOS[cliente.objetivo].descanso}.
              </p>
              <DetalleRutina items={activa.rutina.items} />
            </div>
          </div>
        ) : (
          <p className="tarjeta p-6 text-sm text-slate-500">Moni todavía no te asigna una rutina.</p>
        )}
      </section>
    </div>
  );
}

function Dato({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta p-4">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{valor}</p>
      {detalle && <p className="mt-0.5 text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}
