"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Pestanas({ base, pestanas }: { base: string; pestanas: { ruta: string; texto: string }[] }) {
  const actual = usePathname();
  return (
    <nav className="-mb-px flex print:hidden gap-1 overflow-x-auto border-b border-pink-100">
      {pestanas.map((p) => {
        const href = p.ruta ? `${base}/${p.ruta}` : base;
        return (
          <Link
            key={href}
            href={href}
            aria-current={actual === href ? "page" : undefined}
            className="pestana"
          >
            {p.texto}
          </Link>
        );
      })}
    </nav>
  );
}
