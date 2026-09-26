import { CLAVES_ALERTA, SECCIONES } from "@/lib/cuestionario";
import { OBJETIVOS } from "@/lib/objetivos";
import { clienteDeRuta } from "./cliente";

const SIN_DATO = /^(no|ninguna?o?s?|n\/a|-)\.?$/i;

export default async function PerfilClinico({ params }: PageProps<"/clientes/[id]">) {
  const cliente = await clienteDeRuta(params);
  const r = cliente.onboarding;
  const objetivo = OBJETIVOS[cliente.objetivo];
  const alertas = SECCIONES.flatMap((s) => s.preguntas)
    .filter((p) => CLAVES_ALERTA.includes(p.clave) && r[p.clave] && !SIN_DATO.test(r[p.clave]))
    .map((p) => ({ texto: p.texto, respuesta: r[p.clave] }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        {alertas.length > 0 && (
          <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-amber-900">
              <span aria-hidden>⚠</span> Consideraciones de salud para el entrenamiento
            </h2>
            <ul className="mt-2 space-y-1 text-sm text-amber-900">
              {alertas.map((a) => (
                <li key={a.texto}>
                  <span className="text-amber-700">{a.texto}</span> — <strong className="font-medium">{a.respuesta}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}
        {SECCIONES.filter((s) => !s.soloSexo || s.soloSexo === cliente.sexo).map((s) => (
          <section key={s.clave} className="tarjeta p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">{s.titulo}</h2>
            <dl className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
              {s.preguntas.map((p) => (
                <div key={p.clave} className={p.tipo === "parrafo" ? "sm:col-span-2" : ""}>
                  <dt className="text-xs text-slate-500">{p.texto}</dt>
                  <dd className="mt-0.5 whitespace-pre-line text-sm text-slate-800">{r[p.clave] || <span className="text-slate-400">Sin respuesta</span>}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
      <aside className="space-y-4">
        <section className="tarjeta p-5">
          <h2 className="text-sm font-semibold text-slate-900">Objetivo: {objetivo.nombre}</h2>
          <p className="mt-2 text-sm text-slate-600">{objetivo.enfoque}</p>
          <dl className="mt-4 space-y-2 text-sm">
            <Parametro nombre="Series" valor={objetivo.series} />
            <Parametro nombre="Repeticiones" valor={objetivo.repeticiones} />
            <Parametro nombre="Descanso" valor={objetivo.descanso} />
            <Parametro nombre="Cardio" valor={objetivo.cardio} />
          </dl>
        </section>
        <p className="px-1 text-xs text-slate-500">
          Alta: {new Date(cliente.creado_en + "Z").toLocaleDateString("es-MX", { dateStyle: "long" })}
        </p>
      </aside>
    </div>
  );
}

function Parametro({ nombre, valor }: { nombre: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
      <dt className="text-slate-500">{nombre}</dt>
      <dd className="text-right font-medium text-slate-800">{valor}</dd>
    </div>
  );
}
