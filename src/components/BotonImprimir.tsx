"use client";

export function BotonImprimir({ children }: { children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.print()} className="boton-secundario print:hidden">
      {children}
    </button>
  );
}
