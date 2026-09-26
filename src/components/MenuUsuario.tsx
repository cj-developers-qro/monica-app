import Link from "next/link";
import { cerrarSesion } from "@/app/acciones/sesion";

/**
 * Nombre de quien inició sesión, enlace a su cuenta y botón para salir (sobre la barra rosa).
 * `apilado` coloca los botones debajo del nombre, para la barra lateral angosta.
 */
export function MenuUsuario({ nombre, rol, apilado = false, className = "" }: { nombre: string; rol: string; apilado?: boolean; className?: string }) {
  const acciones = (
    <div className="flex shrink-0 items-center gap-2">
      <Link href="/cuenta" className="rounded-lg px-2 py-1 text-xs font-medium text-pink-50 hover:bg-white/15">
        Mi cuenta
      </Link>
      <form action={cerrarSesion}>
        <button type="submit" className="rounded-lg bg-white/15 px-2.5 py-1 text-xs font-semibold text-white hover:bg-white/25">
          Salir
        </button>
      </form>
    </div>
  );
  return (
    <div className={`text-sm ${apilado ? "space-y-2" : "flex items-center gap-3"} ${className}`}>
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white/20 font-semibold text-white" aria-hidden>
          {nombre.trim().charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0 leading-tight">
          <p className="truncate font-semibold text-white">{nombre}</p>
          <p className="text-xs text-pink-100">{rol}</p>
        </div>
      </div>
      {acciones}
    </div>
  );
}
