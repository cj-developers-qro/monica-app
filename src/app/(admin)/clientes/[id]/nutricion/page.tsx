import Link from "next/link";
import { BotonAccion } from "@/components/BotonAccion";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { SeguimientoNutricional } from "@/components/SeguimientoNutricional";
import { semanaActual, VistaPlanNutricional } from "@/components/VistaPlanNutricional";
import { eliminarPlan, generarPlanNutricional } from "@/app/acciones/nutricion";
import { listarComposicion, listarPlanes, listarSeguimiento, obtenerPlan, type Cliente } from "@/lib/datos";
import { hoy } from "@/lib/formulario";
import { sumarFecha } from "@/lib/nutricion";
import { clienteDeRuta } from "../cliente";

const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

export default async function Nutricion({ params, searchParams }: PageProps<"/clientes/[id]/nutricion">) {
  const cliente = await clienteDeRuta(params);
  const consulta = await searchParams;
  const [planes, seguimiento, composicion] = await Promise.all([
    listarPlanes(cliente.id),
    listarSeguimiento(cliente.id),
    listarComposicion(cliente.id),
  ]);
  const hoyISO = hoy();
  const pedido = Number(consulta.plan);
  // Por defecto se muestra el plan vigente hoy o, si no hay, el más reciente.
  const elegido = planes.find((p) => p.id === pedido) ?? planes.find((p) => p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin) ?? planes[0];
  const registro = elegido ? await obtenerPlan(cliente.id, elegido.id) : null;
  const siguienteInicio = planes[0] && planes[0].fecha_fin >= hoyISO ? sumarFecha(planes[0].fecha_fin, 1) : hoyISO;

  if (composicion.length === 0) {
    return (
      <div className="tarjeta p-8 text-center">
        <p className="font-medium text-slate-800">Para calcular el plan de nutrición se necesita el peso actual.</p>
        <Link href={`/clientes/${cliente.id}/composicion`} className="boton mt-4">Registrar composición corporal</Link>
      </div>
    );
  }

  const formularioGenerar = <FormularioGenerar cliente={cliente} fechaInicio={siguienteInicio} hayPlanes={planes.length > 0} />;

  if (!registro) {
    return (
      <section className="tarjeta p-5">
        <h2 className="text-base font-semibold text-slate-900">Generar el primer plan mensual</h2>
        <p className="mt-1 text-sm text-slate-500">
          Se calcula con el peso y % de grasa más recientes, el objetivo, los días de la rutina activa y las respuestas de nutrición del
          onboarding (alergias, aversiones, fruta favorita, comidas al día y facilidad para cocinar).
        </p>
        <div className="mt-4">{formularioGenerar}</div>
      </section>
    );
  }

  const numeroSemana = Math.min(4, Math.max(1, Number(consulta.semana) || semanaActual(registro.plan, hoyISO)));

  return (
    <div className="space-y-6">
      <VistaPlanNutricional
        plan={registro.plan}
        numeroSemana={numeroSemana}
        hrefSemana={(n) => `/clientes/${cliente.id}/nutricion?plan=${registro.id}&semana=${n}`}
        hrefIntercambio={(u) => `/clientes/${cliente.id}/nutricion/intercambio?plan=${registro.id}&s=${u.semana}&d=${u.dia}&c=${u.comida}&i=${u.item}`}
        notas={registro.notas}
        acciones={
          <Link href={`/exportar/${cliente.id}?plan=${registro.id}`} className="boton-secundario">
            Exportar plan
          </Link>
        }
      />

      <SeguimientoNutricional clienteId={cliente.id} planId={registro.id} seguimiento={seguimiento} puedeEliminar />

      <section className="grid grid-cols-1 gap-4 print:hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="tarjeta p-5">
          <h3 className="text-base font-semibold text-slate-900">Generar plan del siguiente mes</h3>
          <p className="mt-1 text-sm text-slate-500">Usa los datos más recientes y ajusta calorías según el peso y la adherencia del plan anterior.</p>
          <div className="mt-4">{formularioGenerar}</div>
        </div>
        <div className="tarjeta p-5">
          <h3 className="text-base font-semibold text-slate-900">Historial de planes</h3>
          <ul className="mt-3 divide-y divide-pink-50">
            {planes.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <Link href={`/clientes/${cliente.id}/nutricion?plan=${p.id}`} className={p.id === registro.id ? "font-semibold text-pink-700" : "text-slate-700 hover:text-pink-700"}>
                  {fechaCorta(p.fecha_inicio)} – {fechaCorta(p.fecha_fin)}
                  {p.fecha_inicio <= hoyISO && hoyISO <= p.fecha_fin && <span className="insignia-marca ml-2">vigente</span>}
                </Link>
                <BotonAccion accion={eliminarPlan.bind(null, cliente.id, p.id)} confirmar="¿Eliminar este plan de nutrición?" className="text-xs text-slate-400 hover:text-red-600">
                  Eliminar
                </BotonAccion>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function FormularioGenerar({ cliente, fechaInicio, hayPlanes }: { cliente: Cliente; fechaInicio: string; hayPlanes: boolean }) {
  const comidas = parseInt(cliente.onboarding.comidas_dia ?? "", 10);
  return (
    <Formulario accion={generarPlanNutricional.bind(null, cliente.id)}>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="etiqueta">Inicia el</span>
          <input type="date" name="fecha_inicio" defaultValue={fechaInicio} className="campo" />
        </label>
        <label>
          <span className="etiqueta">Comidas al día</span>
          <select name="comidas_dia" defaultValue={String(Math.min(6, Math.max(3, Number.isFinite(comidas) ? comidas : 4)))} className="campo">
            {[3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}
          </select>
        </label>
        <label>
          <span className="etiqueta">Ajuste manual (kcal)</span>
          <input type="number" name="ajuste_kcal" step={1} placeholder="0" className="campo" />
        </label>
        <label>
          <span className="etiqueta">Excluir además</span>
          <input name="excluir" placeholder="p. ej. atún, camote" className="campo" />
        </label>
        <label className="col-span-2">
          <span className="etiqueta">Notas del plan</span>
          <input name="notas" className="campo" />
        </label>
      </div>
      <div className="mt-4 flex justify-end">
        <BotonEnviar>{hayPlanes ? "Generar nuevo plan" : "Generar plan mensual"}</BotonEnviar>
      </div>
    </Formulario>
  );
}
