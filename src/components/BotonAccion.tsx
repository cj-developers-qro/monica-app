"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

/** Botón que ejecuta una acción del servidor, opcionalmente pidiendo confirmación. */
export function BotonAccion({
  accion,
  confirmar,
  children,
  className = "boton-secundario",
}: {
  accion: () => Promise<void>;
  confirmar?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={accion}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
    >
      <Boton className={className}>{children}</Boton>
    </form>
  );
}

function Boton({ children, className }: { children: ReactNode; className: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {children}
    </button>
  );
}
