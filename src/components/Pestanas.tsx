"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Pestanas({ base, pestanas }: { base: string; pestanas: { ruta: string; texto: string }[] }) {
  const actual = usePathname();
  return (
    <nav className="-mb-px flex print:hidden gap-1 overflow-x-auto border-b border-slate-200">
      {pestanas.map((p) => {
        const href = p.ruta ? `${base}/${p.ruta}` : base;
        return (
          <Link
            key={href}
            href={href}
            aria-current={actual === href ? "page" : undefined}
            className="whitespace-nowrap border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-800 aria-[current=page]:border-emerald-600 aria-[current=page]:text-emerald-700"
          >
            {p.texto}
          </Link>
        );
      })}
    </nav>
  );
}
