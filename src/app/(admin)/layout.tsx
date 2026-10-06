import Link from "next/link";
import { MarcaEnBarra } from "@/components/Logo";
import { MenuUsuario } from "@/components/MenuUsuario";
import { Navegacion } from "@/components/Navegacion";
import { requerirAdmin } from "@/lib/auth";

// Marco de la administradora (Moni). La verificación de rol se repite en cada consulta y acción;
// aquí solo se usa para mostrar su nombre y enviar a los clientes a su portal.
export default async function LayoutAdmin({ children }: LayoutProps<"/">) {
  const usuario = await requerirAdmin();
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="barra-marca flex shrink-0 flex-col gap-5 px-4 py-4 print:hidden md:sticky md:top-0 md:h-screen md:w-60 md:py-6">
        <Link href="/hoy" className="px-1">
          <MarcaEnBarra />
        </Link>
        <Navegacion
          enlaces={[
            { href: "/hoy", texto: "Hoy" },
            { href: "/", texto: "Clientes", prefijos: ["/clientes"] },
            { href: "/rutinas", texto: "Rutinas" },
            { href: "/ejercicios", texto: "Ejercicios" },
            { href: "/avisos", texto: "Avisos" },
            { href: "/ayuda", texto: "Ayuda" },
          ]}
        />
        <MenuUsuario nombre={usuario.nombre} rol="Administradora" apilado className="border-t border-white/20 pt-4 md:mt-auto" />
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
    </div>
  );
}
