"use client";

import { useState } from "react";
import { BotonEnviar, Formulario } from "./Formulario";
import { SECCIONES, type Pregunta } from "@/lib/cuestionario";
import { LISTA_OBJETIVOS, OBJETIVOS } from "@/lib/objetivos";
import type { Cliente } from "@/lib/datos";
import type { EstadoFormulario } from "@/lib/formulario";

/** Cuestionario de onboarding (alta) o edición del perfil clínico del cliente. */
export function FormularioCliente({
  accion,
  cliente,
}: {
  accion: (estado: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;
  cliente?: Cliente;
}) {
  const [sexo, setSexo] = useState<string>(cliente?.sexo ?? "");
  const respuestas = cliente?.onboarding ?? {};
  let numero = 1;

  return (
    <Formulario accion={accion} className="space-y-6">
      <Seccion numero={numero++} titulo="Datos personales y biometría inicial">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="sm:col-span-2">
            <span className="etiqueta">Nombre completo *</span>
            <input name="nombre" required defaultValue={cliente?.nombre} className="campo" />
          </label>
          <label>
            <span className="etiqueta">Edad</span>
            <input name="edad" type="number" min={10} max={100} defaultValue={cliente?.edad ?? ""} className="campo" />
          </label>
          <label>
            <span className="etiqueta">Sexo *</span>
            <select name="sexo" required value={sexo} onChange={(e) => setSexo(e.target.value)} className="campo">
              <option value="" disabled>
                Selecciona…
              </option>
              <option value="F">Mujer</option>
              <option value="M">Hombre</option>
            </select>
          </label>
          {!cliente && (
            <label>
              <span className="etiqueta">Peso actual (kg)</span>
              <input name="peso_kg" type="number" step="0.1" min={20} max={400} className="campo" />
            </label>
          )}
          <label>
            <span className="etiqueta">Estatura (cm)</span>
            <input name="estatura_cm" type="number" step="0.1" min={100} max={250} defaultValue={cliente?.estatura_cm ?? ""} className="campo" />
          </label>
        </div>
        <fieldset className="mt-5">
          <legend className="etiqueta">Objetivo principal *</legend>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {LISTA_OBJETIVOS.map((o) => (
              <label
                key={o}
                className="flex cursor-pointer items-start gap-2 rounded-lg border border-slate-200 p-3 text-sm has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50"
              >
                <input type="radio" name="objetivo" value={o} required defaultChecked={cliente?.objetivo === o} className="mt-0.5 accent-emerald-600" />
                <span>
                  <span className="font-medium text-slate-800">{OBJETIVOS[o].nombre}</span>
                  <span className="mt-0.5 block text-xs text-slate-500">{OBJETIVOS[o].repeticiones} reps · {OBJETIVOS[o].descanso}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </Seccion>

      {SECCIONES.filter((s) => !s.soloSexo || s.soloSexo === sexo).map((s) => (
        <Seccion key={s.clave} numero={numero++} titulo={s.titulo}>
          <div className="grid gap-4 sm:grid-cols-2">
            {s.preguntas.map((p) => (
              <Campo key={p.clave} pregunta={p} valor={respuestas[p.clave]} />
            ))}
          </div>
        </Seccion>
      ))}

      <div className="flex justify-end">
        <BotonEnviar>{cliente ? "Guardar cambios" : "Registrar cliente"}</BotonEnviar>
      </div>
    </Formulario>
  );
}

function Seccion({ numero, titulo, children }: { numero: number; titulo: string; children: React.ReactNode }) {
  const romanos = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];
  return (
    <section className="tarjeta p-5">
      <h2 className="mb-4 text-base font-semibold text-slate-900">
        <span className="mr-2 text-emerald-600">{romanos[numero - 1]}.</span>
        {titulo}
      </h2>
      {children}
    </section>
  );
}

function Campo({ pregunta: p, valor }: { pregunta: Pregunta; valor?: string }) {
  const ancho = p.tipo === "parrafo" ? "sm:col-span-2" : "";
  return (
    <label className={ancho}>
      <span className="etiqueta">{p.texto}</span>
      {p.tipo === "parrafo" ? (
        <textarea name={p.clave} rows={2} defaultValue={valor} className="campo" />
      ) : p.tipo === "opciones" ? (
        <select name={p.clave} defaultValue={valor ?? ""} className="campo">
          <option value="">—</option>
          {p.opciones!.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      ) : (
        <input name={p.clave} type={p.tipo === "hora" ? "time" : "text"} defaultValue={valor} className="campo" />
      )}
    </label>
  );
}
