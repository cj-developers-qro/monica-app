"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { EstadoFormulario } from "@/lib/formulario";

type Accion = (estado: EstadoFormulario, fd: FormData) => Promise<EstadoFormulario>;

/** Formulario ligado a una acción del servidor que muestra el error o la confirmación devueltos. */
export function Formulario({
  accion,
  children,
  className,
  mensajeOk = "Guardado correctamente.",
}: {
  accion: Accion;
  children: ReactNode;
  className?: string;
  mensajeOk?: string;
}) {
  const [estado, accionFormulario] = useActionState(accion, undefined);
  return (
    <form action={accionFormulario} className={className}>
      {children}
      {estado?.error && (
        <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {estado.error}
        </p>
      )}
      {estado?.ok && (
        <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          <p>{estado.mensaje ?? mensajeOk}</p>
          {estado.secreto && (
            <p className="mt-2 select-all rounded-lg border border-emerald-300 bg-white px-3 py-2 text-center font-mono text-base font-semibold tracking-wide text-slate-900">
              {estado.secreto}
            </p>
          )}
        </div>
      )}
    </form>
  );
}

export function BotonEnviar({ children, className = "boton" }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? "Guardando…" : children}
    </button>
  );
}
