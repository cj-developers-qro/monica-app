"use client";

import { useState } from "react";
import { DiagramaMusculos } from "./DiagramaMusculos";
import { BotonEnviar, Formulario } from "./Formulario";
import type { Ejercicio } from "@/lib/datos";
import type { EstadoFormulario } from "@/lib/formulario";
import { LISTA_MUSCULOS, MUSCULOS } from "@/lib/musculos";
import { TIPOS_EJERCICIO } from "@/lib/objetivos";

type Rol = "principal" | "secundario" | "";

export function FormularioEjercicio({
  accion,
  ejercicio,
}: {
  accion: (estado: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  ejercicio?: Ejercicio;
}) {
  const [roles, setRoles] = useState<Record<string, Rol>>(() => {
    const r: Record<string, Rol> = {};
    ejercicio?.musculos_principales.forEach((m) => (r[m] = "principal"));
    ejercicio?.musculos_secundarios.forEach((m) => (r[m] = "secundario"));
    return r;
  });
  const principales = LISTA_MUSCULOS.filter((m) => roles[m] === "principal");
  const secundarios = LISTA_MUSCULOS.filter((m) => roles[m] === "secundario");

  return (
    <Formulario accion={accion} className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-6">
        <section className="tarjeta grid gap-4 p-5 sm:grid-cols-2">
          <label className="sm:col-span-2">
            <span className="etiqueta">Nombre *</span>
            <input name="nombre" required defaultValue={ejercicio?.nombre} className="campo" />
          </label>
          <label>
            <span className="etiqueta">Tipo *</span>
            <select name="tipo" defaultValue={ejercicio?.tipo ?? "fuerza"} className="campo">
              {Object.entries(TIPOS_EJERCICIO).map(([v, t]) => (
                <option key={v} value={v}>{t}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="etiqueta">Equipo</span>
            <input name="equipo" defaultValue={ejercicio?.equipo} placeholder="Barra, mancuernas, peso corporal…" className="campo" />
          </label>
          <label className="sm:col-span-2">
            <span className="etiqueta">Técnica / indicaciones</span>
            <textarea name="descripcion" rows={3} defaultValue={ejercicio?.descripcion} className="campo" />
          </label>
        </section>

        <fieldset className="tarjeta p-5">
          <legend className="sr-only">Músculos trabajados</legend>
          <h2 className="text-sm font-semibold text-slate-900">Músculos trabajados *</h2>
          <p className="mb-4 text-xs text-slate-500">El diagrama de la derecha se genera a partir de esta selección.</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {LISTA_MUSCULOS.map((m) => (
              <div key={m} className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <span className="text-sm text-slate-700">{MUSCULOS[m]}</span>
                <div className="flex overflow-hidden rounded-md border border-slate-300 text-xs">
                  {(["", "secundario", "principal"] as const).map((rol) => (
                    <label
                      key={rol}
                      className="cursor-pointer px-2 py-1 text-slate-500 has-[:checked]:bg-slate-800 has-[:checked]:text-white [&:not(:first-child)]:border-l [&:not(:first-child)]:border-slate-300"
                    >
                      <input
                        type="radio"
                        className="sr-only"
                        name={`rol_${m}`}
                        checked={(roles[m] ?? "") === rol}
                        onChange={() => setRoles((r) => ({ ...r, [m]: rol }))}
                      />
                      {rol === "" ? "—" : rol === "principal" ? "Principal" : "Secund."}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          {principales.map((m) => <input key={m} type="hidden" name="principales" value={m} />)}
          {secundarios.map((m) => <input key={m} type="hidden" name="secundarios" value={m} />)}
        </fieldset>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <section className="tarjeta p-4">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Imagen del ejercicio</h2>
          <DiagramaMusculos principales={principales} secundarios={secundarios} />
        </section>
        <BotonEnviar className="boton w-full">Guardar ejercicio</BotonEnviar>
      </aside>
    </Formulario>
  );
}
