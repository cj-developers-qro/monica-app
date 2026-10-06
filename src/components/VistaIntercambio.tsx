import Link from "next/link";
import { intercambiarAlimento } from "@/app/acciones/nutricion";
import { medidaCasera, opcionesIntercambio, type PlanNutricional, type Ubicacion } from "@/lib/nutricion";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const diaSemana = (f: string) => DIAS[(new Date(`${f}T12:00:00`).getDay() + 6) % 7];
const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });
const NUTRIENTE = { proteina: "p", lacteo: "p", carbohidrato: "c", fruta: "c", grasa: "g", verdura: null } as const;
const NOMBRE_NUTRIENTE = { p: "proteína", c: "carbohidratos", g: "grasa" } as const;

/** Elegir un alimento equivalente para sustituir uno del plan (cliente o administradora). */
export function VistaIntercambio({
  clienteId,
  planId,
  plan,
  onboarding,
  ubicacion,
  volver,
}: {
  clienteId: number;
  planId: number;
  plan: PlanNutricional;
  onboarding: Record<string, string>;
  ubicacion: Ubicacion;
  volver: string;
}) {
  const datos = opcionesIntercambio(plan, onboarding, ubicacion);
  if (!datos) {
    return (
      <div className="tarjeta p-6 text-sm text-slate-600">
        No encontramos ese alimento en el plan. <Link href={volver} className="enlace">Volver al plan</Link>
      </div>
    );
  }
  const { actual, comida, dia, opciones, vecesEnSemana, categoria } = datos;
  const nutriente = NUTRIENTE[categoria];
  const accion = intercambiarAlimento.bind(null, clienteId, planId);
  const ocultos = (
    <>
      <input type="hidden" name="s" value={ubicacion.semana} />
      <input type="hidden" name="d" value={ubicacion.dia} />
      <input type="hidden" name="c" value={ubicacion.comida} />
      <input type="hidden" name="i" value={ubicacion.item} />
    </>
  );

  return (
    <div className="space-y-5">
      <Link href={volver} className="enlace-volver">← Volver al plan</Link>
      <header className="tarjeta p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-pink-600">
          {comida.nombre} · {diaSemana(dia.fecha)} {fechaCorta(dia.fecha)}
        </p>
        <h1 className="mt-1 text-xl font-bold text-slate-900">
          Cambiar {actual.nombre} ({actual.gramos} g{medidaCasera(actual.clave, actual.gramos) ? ` · ${medidaCasera(actual.clave, actual.gramos)}` : ""})
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {nutriente
            ? `Las porciones están calculadas para darte la misma cantidad de ${NOMBRE_NUTRIENTE[nutriente]} (${actual[nutriente]} g).`
            : "Las verduras se cambian por la misma cantidad."}{" "}
          Solo aparecen alimentos permitidos para ti (sin tus alergias ni lo que no te gusta).
        </p>
      </header>

      {opciones.length === 0 ? (
        <p className="tarjeta p-6 text-sm text-slate-500">No hay otros alimentos de este tipo que encajen con tus restricciones.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {opciones.map((o) => {
            const menos = nutriente != null && actual[nutriente] > 0 && o[nutriente] < actual[nutriente] * 0.85;
            return (
              <li key={o.clave} className="tarjeta flex flex-col gap-3 p-4">
                <div>
                  <p className="font-medium text-slate-900">
                    {o.nombre}{" "}
                    {!o.sugerido && <span className="text-xs font-normal text-slate-400">· menos común a esta hora</span>}
                  </p>
                  <p className="text-sm text-slate-600">
                    {o.gramos} g{medidaCasera(o.clave, o.gramos) ? ` · ${medidaCasera(o.clave, o.gramos)}` : ""}
                  </p>
                  <p className="mt-1 text-xs tabular-nums text-slate-500">
                    {o.kcal} kcal · P {o.p} · C {o.c} · G {o.g}
                  </p>
                  {menos && nutriente && (
                    <p className="mt-1 text-xs text-amber-700">▲ Aporta menos {NOMBRE_NUTRIENTE[nutriente]} que el original (tope de porción).</p>
                  )}
                </div>
                <div className="mt-auto flex flex-wrap gap-2">
                  <form action={accion}>
                    {ocultos}
                    <input type="hidden" name="clave" value={o.clave} />
                    <input type="hidden" name="alcance" value="comida" />
                    <button type="submit" className="boton">
                      Cambiar solo aquí
                    </button>
                  </form>
                  {vecesEnSemana > 1 && (
                    <form action={accion}>
                      {ocultos}
                      <input type="hidden" name="clave" value={o.clave} />
                      <input type="hidden" name="alcance" value="semana" />
                      <button type="submit" className="boton-secundario">
                        En toda la semana ({vecesEnSemana})
                      </button>
                    </form>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
