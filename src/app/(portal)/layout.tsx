import Link from "next/link";
import { Logo, LEMA_APP, NOMBRE_APP } from "@/components/Logo";
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
          <Link href="/portal" className="flex items-center gap-3">
            <Logo />
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">{NOMBRE_APP}</span>
              <span className="block text-xs text-pink-100">{LEMA_APP}</span>
            </span>
          </Link>
          <Navegacion
            className="order-3 flex w-full gap-1 overflow-x-auto md:order-none md:w-auto md:flex-1"
            enlaces={[
              { href: "/portal", texto: "Mi resumen" },
              { href: "/portal/progreso", texto: "Mi progreso" },
              { href: "/portal/nutricion", texto: "Mi nutrición" },
            ]}
          />
          <MenuUsuario nombre={usuario.nombre} rol="Cliente" className="ml-auto" />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
