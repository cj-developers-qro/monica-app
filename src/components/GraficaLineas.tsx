"use client";

import { useEffect, useRef, useState } from "react";

export type Serie = { nombre: string; color: string; valores: (number | null)[] };

const ALTO = 260;
const M = { arriba: 16, derecha: 72, abajo: 30, izquierda: 44 };

function escalaBonita(min: number, max: number) {
  if (min === max) {
    min -= 1;
    max += 1;
  }
  const paso = Math.pow(10, Math.floor(Math.log10((max - min) / 4)));
  const multiplo = [1, 2, 2.5, 5, 10].map((k) => k * paso).find((p) => (max - min) / p <= 5) ?? paso * 10;
  const inicio = Math.floor(min / multiplo) * multiplo;
  const fin = Math.ceil(max / multiplo) * multiplo;
  const marcas: number[] = [];
  for (let v = inicio; v <= fin + multiplo / 2; v += multiplo) marcas.push(Math.round(v * 100) / 100);
  return { inicio, fin, marcas };
}

const formatoFecha = (f: string) =>
  new Date(`${f}T12:00:00`).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

/** Gráfica de líneas con una sola escala, etiquetas directas y tooltip con cursor. */
export function GraficaLineas({ fechas, series, unidad, titulo }: { fechas: string[]; series: Serie[]; unidad: string; titulo: string }) {
  const [activo, setActivo] = useState<number | null>(null);
  // Se dibuja al ancho real del contenedor para que el texto conserve su tamaño en píxeles.
  const contenedor = useRef<HTMLDivElement>(null);
  const [ancho, setAncho] = useState(640);
  useEffect(() => {
    const el = contenedor.current;
    if (!el) return;
    const observador = new ResizeObserver(([e]) => setAncho(Math.max(280, Math.round(e.contentRect.width))));
    observador.observe(el);
    return () => observador.disconnect();
  }, []);
  const valores = series.flatMap((s) => s.valores.filter((v): v is number => v != null));
  if (fechas.length === 0 || valores.length === 0) return null;

  const { inicio, fin, marcas } = escalaBonita(Math.min(...valores), Math.max(...valores));
  const tiempos = fechas.map((f) => Date.parse(f));
  const t0 = Math.min(...tiempos);
  const t1 = Math.max(...tiempos);
  const anchoUtil = ancho - M.izquierda - M.derecha;
  const altoUtil = ALTO - M.arriba - M.abajo;
  const x = (i: number) => M.izquierda + (t1 === t0 ? anchoUtil / 2 : ((tiempos[i] - t0) / (t1 - t0)) * anchoUtil);
  const y = (v: number) => M.arriba + (1 - (v - inicio) / (fin - inicio)) * altoUtil;

  const trazo = (s: Serie) =>
    s.valores
      .map((v, i) => (v == null ? null : `${x(i).toFixed(1)},${y(v).toFixed(1)}`))
      .filter(Boolean)
      .join(" L");

  function alMover(e: React.PointerEvent<SVGSVGElement>) {
    const caja = e.currentTarget.getBoundingClientRect();
    const px = ((e.clientX - caja.left) / caja.width) * ancho;
    let mejor = 0;
    fechas.forEach((_, i) => {
      if (Math.abs(x(i) - px) < Math.abs(x(mejor) - px)) mejor = i;
    });
    setActivo(mejor);
  }

  // Etiquetas directas al final de cada línea, separadas para que no se encimen.
  const etiquetas = series
    .map((s) => {
      const ultimo = s.valores.map((v, i) => [v, i] as const).filter(([v]) => v != null).pop();
      return ultimo ? { s, v: ultimo[0]!, yy: y(ultimo[0]!) } : null;
    })
    .filter((e): e is NonNullable<typeof e> => e != null)
    .sort((a, b) => a.yy - b.yy);
  for (let i = 1; i < etiquetas.length; i++) {
    if (etiquetas[i].yy - etiquetas[i - 1].yy < 14) etiquetas[i].yy = etiquetas[i - 1].yy + 14;
  }

  return (
    <figure>
      <figcaption className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800">{titulo}</span>
        {series.length > 1 && (
          <span className="flex flex-wrap gap-3 text-xs text-slate-600">
            {series.map((s) => (
              <span key={s.nombre} className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 rounded" style={{ background: s.color }} />
                {s.nombre}
              </span>
            ))}
          </span>
        )}
      </figcaption>
      <div ref={contenedor} className="relative">
        <svg
          viewBox={`0 0 ${ancho} ${ALTO}`}
          width={ancho}
          height={ALTO}
          className="block touch-none select-none"
          onPointerMove={alMover}
          onPointerLeave={() => setActivo(null)}
          role="img"
          aria-label={titulo}
        >
          {marcas.map((m) => (
            <g key={m}>
              <line x1={M.izquierda} x2={ancho - M.derecha} y1={y(m)} y2={y(m)} stroke="#e2e8f0" strokeWidth={1} />
              <text x={M.izquierda - 8} y={y(m)} dy="0.32em" textAnchor="end" fontSize={11} fill="#64748b">
                {m}
              </text>
            </g>
          ))}
          {fechas.map((f, i) =>
            fechas.length <= Math.floor(ancho / 90) || i === 0 || i === fechas.length - 1 || i % Math.ceil(fechas.length / Math.max(2, Math.floor(ancho / 110))) === 0 ? (
              <text key={f + i} x={x(i)} y={ALTO - 8} textAnchor="middle" fontSize={11} fill="#64748b">
                {formatoFecha(f)}
              </text>
            ) : null,
          )}
          {activo != null && (
            <line x1={x(activo)} x2={x(activo)} y1={M.arriba} y2={ALTO - M.abajo} stroke="#94a3b8" strokeDasharray="3 3" />
          )}
          {series.map((s) => (
            <g key={s.nombre}>
              <path d={`M${trazo(s)}`} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
              {s.valores.map((v, i) =>
                v == null ? null : (
                  <circle key={i} cx={x(i)} cy={y(v)} r={activo === i ? 5 : 4} fill={s.color} stroke="#ffffff" strokeWidth={2} />
                ),
              )}
            </g>
          ))}
          {etiquetas.map(({ s, v, yy }) => (
            <text key={s.nombre} x={ancho - M.derecha + 10} y={yy} dy="0.32em" fontSize={11} fill="#334155">
              {v} {unidad}
            </text>
          ))}
        </svg>
        {activo != null && (
          <div
            className="pointer-events-none absolute top-2 z-10 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg"
            style={{
              left: `${(x(activo) / ancho) * 100}%`,
              transform: x(activo) > ancho / 2 ? "translateX(calc(-100% - 12px))" : "translateX(12px)",
            }}
          >
            <p className="mb-1 font-semibold text-slate-800">{formatoFecha(fechas[activo])}</p>
            {series.map((s) => (
              <p key={s.nombre} className="flex items-center gap-2 text-slate-600">
                <span className="inline-block size-2 rounded-full" style={{ background: s.color }} />
                {s.nombre}: <span className="font-medium text-slate-900">{s.valores[activo] ?? "—"} {s.valores[activo] != null ? unidad : ""}</span>
              </p>
            ))}
          </div>
        )}
      </div>
      <details className="mt-2 text-xs text-slate-600">
        <summary className="cursor-pointer select-none">Ver como tabla</summary>
        <table className="mt-2 w-full text-left">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-1 pr-3 font-medium">Fecha</th>
              {series.map((s) => (
                <th key={s.nombre} className="py-1 pr-3 font-medium">
                  {s.nombre} ({unidad})
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fechas.map((f, i) => (
              <tr key={f + i} className="border-b border-slate-100">
                <td className="py-1 pr-3">{formatoFecha(f)}</td>
                {series.map((s) => (
                  <td key={s.nombre} className="py-1 pr-3 tabular-nums">
                    {s.valores[i] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
