import Link from "next/link";
import { InsigniaObjetivo } from "@/components/InsigniaObjetivo";
import { Pestanas } from "@/components/Pestanas";
import { clienteDeRuta } from "./cliente";

export default async function LayoutCliente({ params, children }: LayoutProps<"/clientes/[id]">) {
  const cliente = await clienteDeRuta(params);
  const base = `/clientes/${cliente.id}`;
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-4">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
          ← Clientes
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{cliente.nombre}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {cliente.sexo === "F" ? "Mujer" : "Hombre"}
              {cliente.edad ? ` · ${cliente.edad} años` : ""}
              {cliente.estatura_cm ? ` · ${cliente.estatura_cm} cm` : ""}
              <InsigniaObjetivo objetivo={cliente.objetivo} />
            </p>
          </div>
          <Link href={`${base}/editar`} className="boton-secundario print:hidden">
            Editar perfil
          </Link>
        </div>
        <Pestanas
          base={base}
          pestanas={[
            { ruta: "", texto: "Perfil clínico" },
            { ruta: "mediciones", texto: "Antropometría" },
            { ruta: "composicion", texto: "Composición corporal" },
            { ruta: "recomposicion", texto: "Recomposición" },
            { ruta: "rutinas", texto: "Rutinas" },
            { ruta: "nutricion", texto: "Nutrición" },
          ]}
        />
      </header>
      {children}
    </div>
  );
}
