import Link from "next/link";
import { MarcaEnBarra } from "@/components/Logo";
import { MenuUsuario } from "@/components/MenuUsuario";
import { Navegacion } from "@/components/Navegacion";
import { requerirCliente } from "@/lib/auth";

// Marco del portal del cliente: barra rosa superior con su menú. Cada página vuelve a verificar
// la sesión al consultar datos, y todas las consultas se limitan al expediente del cliente.
export default async function LayoutPortal({ children }: LayoutProps<"/">) {
  const usuario = await requerirCliente();
  return (
    <div className="min-h-screen">
      <header className="barra-marca bg-gradient-to-r print:hidden">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-4 md:px-8">
          <Link href="/portal">
            <MarcaEnBarra />
          </Link>
          <Navegacion
            className="order-3 flex w-full gap-1 overflow-x-auto"
            enlaces={[
              { href: "/portal", texto: "Mi resumen", exacto: true },
              { href: "/portal/entrenamiento", texto: "Mi entrenamiento" },
              { href: "/portal/progreso", texto: "Mi progreso" },
              { href: "/portal/nutricion", texto: "Mi nutrición" },
              { href: "/ayuda", texto: "Ayuda" },
            ]}
          />
          <MenuUsuario nombre={usuario.nombre} rol="Cliente" className="ml-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
