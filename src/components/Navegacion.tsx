"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type EnlaceMenu = {
  href: string;
  texto: string;
  /** Rutas adicionales que también marcan el enlace como activo. */
  prefijos?: string[];
  /** Solo activo en su ruta exacta (p. ej. /portal, que es prefijo de las demás secciones del portal). */
  exacto?: boolean;
};

export function Navegacion({ enlaces, className = "flex gap-1 md:flex-col" }: { enlaces: EnlaceMenu[]; className?: string }) {
  const ruta = usePathname();
  const activo = (e: EnlaceMenu) =>
    ruta === e.href || (!e.exacto && [e.href === "/" ? null : e.href, ...(e.prefijos ?? [])].some((p) => p && ruta.startsWith(p)));
  return (
    <nav className={className}>
      {enlaces.map((e) => (
        <Link key={e.href} href={e.href} aria-current={activo(e) ? "page" : undefined} className="menu-enlace">
          {e.texto}
        </Link>
      ))}
    </nav>
  );
}
