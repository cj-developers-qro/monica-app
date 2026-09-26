"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/", texto: "Clientes", activo: (p: string) => p === "/" || p.startsWith("/clientes") },
  { href: "/rutinas", texto: "Rutinas", activo: (p: string) => p.startsWith("/rutinas") },
  { href: "/ejercicios", texto: "Ejercicios", activo: (p: string) => p.startsWith("/ejercicios") },
];

export function Navegacion() {
  const ruta = usePathname();
  return (
    <nav className="flex gap-1 md:flex-col">
      {ENLACES.map((e) => (
        <Link
          key={e.href}
          href={e.href}
          aria-current={e.activo(ruta) ? "page" : undefined}
          className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white aria-[current=page]:bg-emerald-600 aria-[current=page]:text-white"
        >
          {e.texto}
        </Link>
      ))}
    </nav>
  );
}
