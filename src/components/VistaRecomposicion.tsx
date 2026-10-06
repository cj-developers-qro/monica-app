import Link from "next/link";
import { GraficaLineas } from "@/components/GraficaLineas";
import { COLORES_SERIE } from "@/lib/colores";
import type { Composicion } from "@/lib/datos";
import type { Objetivo } from "@/lib/objetivos";
import { diagnosticar, serieRecomposicion, type Estado } from "@/lib/recomposicion";

const fechaLarga = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
const fechaCorta = (f: string) => new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "long" });

const ESTILO_ESTADO: Record<Estado, { clase: string; icono: string; etiqueta: string }> = {
  logrado: { clase: "border-emerald-200 bg-emerald-50 text-emerald-900", icono: "✓", etiqueta: "Progreso positivo" },
  parcial: { clase: "border-amber-200 bg-amber-50 text-amber-900", icono: "!", etiqueta: "Progreso parcial" },
  sin_progreso: { clase: "border-red-200 bg-red-50 text-red-900", icono: "✕", etiqueta: "Sin progreso" },
  punto_partida: { clase: "border-pink-200 bg-pink-50 text-pink-900", icono: "📍", etiqueta: "Punto de partida" },
  sin_datos: { clase: "border-slate-200 bg-white text-slate-800", icono: "…", etiqueta: "Sin datos" },
};

/**
 * Dashboard de recomposición: diagnóstico, cambios en kilos y gráficas. Lo usan el expediente
 * (administradora) y el portal del cliente. `enlaceRegistro` solo se pasa a la administradora.
 */
export function VistaRecomposicion({
  objetivo,
  composicion,
  enlaceRegistro,
}: {
  objetivo: Objetivo;
  composicion: Composicion[];
  enlaceRegistro?: string;
}) {
  const serie = serieRecomposicion(composicion);
  const d = diagnosticar(serie, objetivo);
  const estilo = ESTILO_ESTADO[d.estado];
  const fechas = serie.map((p) => p.fecha);

  return (
    <div className="space-y-6">
      <section className={`rounded-2xl border p-5 ${estilo.clase}`}>
        <p className="text-xs font-medium uppercase tracking-wide opacity-80">
          <span aria-hidden className="mr-1">{estilo.icono}</span>
          {estilo.etiqueta}
        </p>
        <h2 className="mt-1 text-xl font-bold">{d.titulo}</h2>
        <p className="mt-1 text-sm">{d.detalle}</p>
        {d.alineadoConObjetivo && <p className="mt-2 text-sm font-medium">{d.alineadoConObjetivo}</p>}
        {d.estado === "sin_datos" && enlaceRegistro && (
          <Link href={enlaceRegistro} className="boton mt-4">
            Registrar composición corporal
          </Link>
        )}
      </section>

      {d.estado === "punto_partida" && d.inicio && (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Medida titulo="Peso" valor={`${d.inicio.peso} kg`} />
            <Medida titulo="Masa grasa" valor={`${d.inicio.masaGrasa} kg`} detalle={`${d.inicio.grasaPct} % de grasa`} />
            <Medida titulo="Masa muscular" valor={`${d.inicio.masaMuscular} kg`} detalle={`${d.inicio.musculoPct} % de músculo`} />
            <Medida titulo="Grasa visceral" valor={d.inicio.visceral != null ? String(d.inicio.visceral) : "—"} detalle="nivel" />
          </div>
          {d.siguienteMedicion && (
            <section className="tarjeta flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="text-sm text-slate-700">
                <p>
                  Medición del <strong>{fechaLarga(d.inicio.fecha)}</strong>. Siguiente medición sugerida:{" "}
                  <strong>
                    entre el {fechaCorta(d.siguienteMedicion.desde)} y el {fechaLarga(d.siguienteMedicion.hasta)}
                  </strong>
                  .
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Para comparar bien: misma báscula, en ayunas y a la misma hora. Con esa medición aparecerán el diagnóstico y las gráficas.
                </p>
              </div>
              {enlaceRegistro && (
                <Link href={enlaceRegistro} className="boton-secundario">
                  Registrar nueva medición
                </Link>
              )}
            </section>
          )}
        </>
      )}

      {d.estado !== "sin_datos" && d.estado !== "punto_partida" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Delta titulo="Cambio de peso" valor={d.deltaPeso} bueno={null} />
          <Delta titulo="Cambio de masa grasa" valor={d.deltaGrasa} bueno="baja" />
          <Delta titulo="Cambio de masa muscular" valor={d.deltaMusculo} bueno="sube" />
        </div>
      )}

      {serie.length > 1 && d.estado !== "punto_partida" && (
        <>
          <section className="tarjeta p-5">
            <GraficaLineas
              titulo="Masa grasa vs. masa muscular (kg)"
              unidad="kg"
              fechas={fechas}
              series={[
                { nombre: "Masa muscular", color: COLORES_SERIE[2], valores: serie.map((p) => p.masaMuscular) },
                { nombre: "Masa grasa", color: COLORES_SERIE[1], valores: serie.map((p) => p.masaGrasa) },
              ]}
            />
            <p className="mt-3 text-xs text-slate-500">
              La recomposición ocurre cuando las líneas se separan: la masa muscular sube mientras la masa grasa baja, aunque el peso cambie poco.
            </p>
          </section>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="tarjeta p-5">
              <GraficaLineas titulo="Peso corporal" unidad="kg" fechas={fechas} series={[{ nombre: "Peso", color: COLORES_SERIE[0], valores: serie.map((p) => p.peso) }]} />
            </section>
            <section className="tarjeta p-5">
              <GraficaLineas
                titulo="Porcentajes de composición"
                unidad="%"
                fechas={fechas}
                series={[
                  { nombre: "% músculo", color: COLORES_SERIE[2], valores: serie.map((p) => p.musculoPct) },
                  { nombre: "% grasa", color: COLORES_SERIE[1], valores: serie.map((p) => p.grasaPct) },
                ]}
              />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function Delta({ titulo, valor, bueno }: { titulo: string; valor: number | null; bueno: "sube" | "baja" | null }) {
  const favorable = valor == null || bueno == null || valor === 0 ? null : (valor < 0) === (bueno === "baja");
  return (
    <div className="tarjeta p-5">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
        {valor == null ? "—" : `${valor > 0 ? "+" : ""}${valor} kg`}
      </p>
      {favorable != null && (
        <p className={`mt-1 text-xs font-medium ${favorable ? "text-emerald-700" : "text-amber-700"}`}>
          {favorable ? "✓ A favor del objetivo" : "▲ En contra del objetivo"}
        </p>
      )}
    </div>
  );
}

function Medida({ titulo, valor, detalle }: { titulo: string; valor: string; detalle?: string }) {
  return (
    <div className="tarjeta p-5">
      <p className="text-xs text-slate-500">{titulo}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">{valor}</p>
      {detalle && <p className="mt-1 text-xs text-slate-500">{detalle}</p>}
    </div>
  );
}
