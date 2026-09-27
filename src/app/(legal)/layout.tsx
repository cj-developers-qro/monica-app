import Link from "next/link";
import { IconoMoniFit, NombreMoniFit } from "@/components/Logo";

// Marco de las páginas legales: mismo fondo que el acceso, con una tarjeta ancha para leer cómodo.
export default function LayoutLegal({ children }: LayoutProps<"/">) {
  return (
    <div className="fondo-acceso px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <Link href="/login" className="mb-6 flex items-center justify-center gap-3">
          <IconoMoniFit className="size-12" />
          <NombreMoniFit className="text-3xl" />
        </Link>
        <div className="tarjeta p-6 sm:p-10">{children}</div>
      </div>
    </div>
  );
}
