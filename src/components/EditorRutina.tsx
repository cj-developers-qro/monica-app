"use client";

import { useMemo, useState } from "react";
import { DiagramaMusculos } from "./DiagramaMusculos";
import { BotonEnviar, Formulario } from "./Formulario";
import type { Ejercicio, RutinaConEjercicios } from "@/lib/datos";
import type { EstadoFormulario } from "@/lib/formulario";
import { combinarMusculos, LISTA_MUSCULOS, MUSCULOS, nombreMusculo } from "@/lib/musculos";
import { LISTA_OBJETIVOS, NIVELES, OBJETIVOS, TIPOS_EJERCICIO, esObjetivo, type Objetivo } from "@/lib/objetivos";

type Fila = {
  clave: number;
  ejercicio_id: number;
  dia: string;
  series: number;
  repeticiones: string;
  descanso_seg: number;
  notas: string;
};

// Clave local para las filas del editor (solo se usa como key de React).
let contador = 0;
const nuevaClave = () => ++contador;

export function EditorRutina({
  accion,
  rutina,
  ejercicios,
}: {
  accion: (estado: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  rutina?: RutinaConEjercicios;
  ejercicios: Ejercicio[];
}) {
  const [objetivo, setObjetivo] = useState<Objetivo>(rutina?.objetivo ?? "recomposicion");
  const [filas, setFilas] = useState<Fila[]>(() =>
    (rutina?.items ?? []).map((i) => ({
      clave: nuevaClave(),
      ejercicio_id: i.ejercicio_id,
      dia: i.dia,
      series: i.series,
      repeticiones: i.repeticiones,
      descanso_seg: i.descanso_seg,
      notas: i.notas,
    })),
  );
  const [dias, setDias] = useState<string[]>(() => {
    const d = [...new Set(rutina?.items.map((i) => i.dia) ?? [])];
    return d.length ? d : ["Día A"];
  });
  const [filtroMusculo, setFiltroMusculo] = useState("");
  const [quitarImagen, setQuitarImagen] = useState(false);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);

  const porId = useMemo(() => new Map(ejercicios.map((e) => [e.id, e])), [ejercicios]);
  const disponibles = ejercicios.filter(
    (e) => !filtroMusculo || e.musculos_principales.includes(filtroMusculo) || e.musculos_secundarios.includes(filtroMusculo),
  );
  const musculos = combinarMusculos(filas.map((f) => porId.get(f.ejercicio_id)!).filter(Boolean));
  const ordenadas = dias.flatMap((d) => filas.filter((f) => f.dia === d));
  const parametros = OBJETIVOS[objetivo];

  const actualizar = (clave: number, cambios: Partial<Fila>) =>
    setFilas((fs) => fs.map((f) => (f.clave === clave ? { ...f, ...cambios } : f)));

  function agregar(dia: string, ejercicioId: number) {
    const e = porId.get(ejercicioId);
    if (!e) return;
    const cardio = e.tipo === "cardio";
    // Valores iniciales tomados de los parámetros del objetivo seleccionado.
    const reps = cardio ? "20 min" : parametros.repeticiones.split(" ")[0];
    const descanso = cardio ? 0 : Number(parametros.descanso.match(/\d+/)?.[0] ?? 60) * (parametros.descanso.includes("min") ? 60 : 1);
    setFilas((fs) => [
      ...fs,
      { clave: nuevaClave(), ejercicio_id: ejercicioId, dia, series: cardio ? 1 : Number(parametros.series[0]), repeticiones: reps, descanso_seg: descanso, notas: "" },
    ]);
  }

  function mover(clave: number, direccion: -1 | 1) {
    setFilas((fs) => {
      const fila = fs.find((f) => f.clave === clave)!;
      const delDia = fs.filter((f) => f.dia === fila.dia);
      const i = delDia.indexOf(fila);
      const otra = delDia[i + direccion];
      if (!otra) return fs;
      return fs.map((f) => (f === fila ? otra : f === otra ? fila : f));
    });
  }

  function renombrarDia(anterior: string, nuevo: string) {
    if (!nuevo.trim() || dias.includes(nuevo)) return;
    setDias((ds) => ds.map((d) => (d === anterior ? nuevo : d)));
    setFilas((fs) => fs.map((f) => (f.dia === anterior ? { ...f, dia: nuevo } : f)));
  }

  function agregarDia() {
    const letra = String.fromCharCode(65 + dias.length);
    let nombre = `Día ${letra}`;
    for (let n = 2; dias.includes(nombre); n++) nombre = `Día ${letra}${n}`;
    setDias((ds) => [...ds, nombre]);
  }

  function quitarDia(dia: string) {
    const n = filas.filter((f) => f.dia === dia).length;
    if (n > 0 && !window.confirm(`¿Quitar "${dia}" y sus ${n} ejercicios?`)) return;
    setDias((ds) => ds.filter((d) => d !== dia));
    setFilas((fs) => fs.filter((f) => f.dia !== dia));
  }

  const imagenActual = rutina?.imagen && !quitarImagen ? `/rutinas/${rutina.id}/imagen` : null;

  return (
    <Formulario accion={accion} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <input type="hidden" name="items" value={JSON.stringify(ordenadas.map(({ clave, ...f }) => (void clave, f)))} />
      <input type="hidden" name="quitar_imagen" value={quitarImagen ? "1" : ""} />

      <div className="min-w-0 space-y-6">
        <section className="tarjeta grid gap-4 p-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="etiqueta">Nombre de la rutina *</span>
            <input name="nombre" required defaultValue={rutina?.nombre} className="campo" />
          </label>
          <label>
            <span className="etiqueta">Objetivo que trabaja *</span>
            <select
              name="objetivo"
              value={objetivo}
              onChange={(e) => esObjetivo(e.target.value) && setObjetivo(e.target.value)}
              className="campo"
            >
              {LISTA_OBJETIVOS.map((o) => (
                <option key={o} value={o}>
                  {OBJETIVOS[o].nombre}
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label>
              <span className="etiqueta">Nivel *</span>
              <select name="nivel" defaultValue={rutina?.nivel ?? "principiante"} className="campo">
                {Object.entries(NIVELES).map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span className="etiqueta">Días por semana</span>
              <input name="dias_semana" type="number" min={1} max={7} defaultValue={rutina?.dias_semana ?? 3} className="campo" />
            </label>
          </div>
          <label className="sm:col-span-2">
            <span className="etiqueta">Descripción e indicaciones</span>
            <textarea name="descripcion" rows={2} defaultValue={rutina?.descripcion} className="campo" />
          </label>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-base font-semibold text-slate-900">Ejercicios por día</h2>
            <label className="text-sm">
              <span className="etiqueta">Filtrar el catálogo por músculo</span>
              <select value={filtroMusculo} onChange={(e) => setFiltroMusculo(e.target.value)} className="campo">
                <option value="">Todos los músculos</option>
                {LISTA_MUSCULOS.map((m) => (
                  <option key={m} value={m}>
                    {MUSCULOS[m]}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {dias.map((dia) => {
            const delDia = filas.filter((f) => f.dia === dia);
            return (
              <div key={dia} className="tarjeta overflow-hidden">
                <div className="flex items-center gap-2 border-b border-pink-100 bg-pink-50/60 px-4 py-2">
                  <input
                    aria-label="Nombre del día"
                    defaultValue={dia}
                    onBlur={(e) => (e.target.value.trim() && e.target.value !== dia ? renombrarDia(dia, e.target.value.trim()) : (e.target.value = dia))}
                    className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-sm font-semibold text-slate-800 hover:border-slate-300 focus:border-pink-500 focus:bg-white focus:outline-none"
                  />
                  <button type="button" onClick={() => quitarDia(dia)} className="text-xs text-slate-400 hover:text-red-600">
                    Quitar día
                  </button>
                </div>
                <ul className="divide-y divide-slate-100">
                  {delDia.map((f, i) => {
                    const e = porId.get(f.ejercicio_id);
                    return (
                      <li key={f.clave} className="grid gap-2 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-800">{e?.nombre ?? "Ejercicio eliminado"}</p>
                          <p className="truncate text-xs text-slate-500">{e?.musculos_principales.map(nombreMusculo).join(", ")}</p>
                          <input
                            aria-label="Notas"
                            placeholder="Notas (tempo, técnica, variante…)"
                            value={f.notas}
                            onChange={(ev) => actualizar(f.clave, { notas: ev.target.value })}
                            className="mt-1 w-full rounded border border-slate-200 px-2 py-1 text-xs"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <MiniCampo etiqueta="Series" ancho="w-14">
                            <input type="number" min={1} max={20} value={f.series} onChange={(ev) => actualizar(f.clave, { series: Number(ev.target.value) })} />
                          </MiniCampo>
                          <MiniCampo etiqueta="Reps" ancho="w-24">
                            <input value={f.repeticiones} onChange={(ev) => actualizar(f.clave, { repeticiones: ev.target.value })} />
                          </MiniCampo>
                          <MiniCampo etiqueta="Desc. (s)" ancho="w-16">
                            <input type="number" min={0} max={600} step={1} value={f.descanso_seg} onChange={(ev) => actualizar(f.clave, { descanso_seg: Number(ev.target.value) })} />
                          </MiniCampo>
                          <div className="flex flex-col">
                            <button type="button" disabled={i === 0} onClick={() => mover(f.clave, -1)} className="px-1 text-slate-400 hover:text-slate-800 disabled:opacity-30" aria-label="Subir">
                              ▲
                            </button>
                            <button type="button" disabled={i === delDia.length - 1} onClick={() => mover(f.clave, 1)} className="px-1 text-slate-400 hover:text-slate-800 disabled:opacity-30" aria-label="Bajar">
                              ▼
                            </button>
                          </div>
                          <button type="button" onClick={() => setFilas((fs) => fs.filter((x) => x.clave !== f.clave))} className="px-1 text-slate-400 hover:text-red-600" aria-label="Quitar ejercicio">
                            ✕
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
                <div className="border-t border-slate-100 px-4 py-3">
                  <select
                    aria-label={`Agregar ejercicio a ${dia}`}
                    value=""
                    onChange={(e) => agregar(dia, Number(e.target.value))}
                    className="campo text-slate-600"
                  >
                    <option value="">+ Agregar ejercicio del catálogo…</option>
                    {Object.entries(TIPOS_EJERCICIO).map(([tipo, nombre]) => {
                      const grupo = disponibles.filter((e) => e.tipo === tipo);
                      return grupo.length ? (
                        <optgroup key={tipo} label={nombre}>
                          {grupo.map((e) => (
                            <option key={e.id} value={e.id}>
                              {e.nombre} — {e.musculos_principales.map(nombreMusculo).join(", ")}
                            </option>
                          ))}
                        </optgroup>
                      ) : null;
                    })}
                  </select>
                </div>
              </div>
            );
          })}
          <button type="button" onClick={agregarDia} className="boton-secundario w-full border-dashed">
            + Agregar día
          </button>
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="tarjeta p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Músculos trabajados</h2>
          {filas.length ? (
            <DiagramaMusculos principales={musculos.principales} secundarios={musculos.secundarios} />
          ) : (
            <p className="text-xs text-slate-500">Agrega ejercicios para generar el diagrama.</p>
          )}
        </section>

        <section className="tarjeta p-4">
          <h2 className="text-sm font-semibold text-slate-900">Imagen propia (opcional)</h2>
          <p className="mt-1 text-xs text-slate-500">Si no subes una, la imagen de la rutina es el diagrama de músculos generado.</p>
          {(vistaPrevia ?? imagenActual) && (
            // eslint-disable-next-line @next/next/no-img-element -- vista previa local
            <img src={vistaPrevia ?? imagenActual!} alt="Imagen de la rutina" className="mt-3 max-h-48 w-full rounded-lg bg-slate-50 object-contain" />
          )}
          <input
            type="file"
            name="imagen"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const archivo = e.target.files?.[0];
              setVistaPrevia(archivo ? URL.createObjectURL(archivo) : null);
              if (archivo) setQuitarImagen(false);
            }}
            className="mt-3 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-slate-200"
          />
          {rutina?.imagen && !vistaPrevia && (
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" checked={quitarImagen} onChange={(e) => setQuitarImagen(e.target.checked)} />
              Quitar imagen propia y usar el diagrama
            </label>
          )}
        </section>

        <section className="tarjeta p-4 text-sm">
          <h2 className="font-semibold text-slate-900">Parámetros para {parametros.nombre.toLowerCase()}</h2>
          <p className="mt-1 text-xs text-slate-500">{parametros.enfoque}</p>
          <dl className="mt-3 space-y-1 text-xs">
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Series</dt><dd className="font-medium">{parametros.series}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Repeticiones</dt><dd className="text-right font-medium">{parametros.repeticiones}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Descanso</dt><dd className="font-medium">{parametros.descanso}</dd></div>
            <div className="flex justify-between gap-2"><dt className="text-slate-500">Cardio</dt><dd className="text-right font-medium">{parametros.cardio}</dd></div>
          </dl>
        </section>

        <BotonEnviar className="boton w-full">Guardar rutina</BotonEnviar>
      </aside>
    </Formulario>
  );
}

function MiniCampo({ etiqueta, ancho, children }: { etiqueta: string; ancho: string; children: React.ReactElement }) {
  return (
    <label className={`${ancho} shrink-0`}>
      <span className="block text-[10px] font-medium uppercase tracking-wide text-slate-500">{etiqueta}</span>
      <span className="block [&>input]:w-full [&>input]:rounded [&>input]:border [&>input]:border-slate-300 [&>input]:px-1.5 [&>input]:py-1 [&>input]:text-sm">
        {children}
      </span>
    </label>
  );
}
