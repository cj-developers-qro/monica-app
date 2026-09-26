import Link from "next/link";
import { EditorRutina } from "@/components/EditorRutina";
import { guardarRutina } from "@/app/acciones/rutinas";
import { listarEjercicios } from "@/lib/datos";
import { rutinaDeRuta } from "../rutina";

export default async function EditarRutina({ params }: PageProps<"/rutinas/[id]/editar">) {
  const rutina = await rutinaDeRuta(params);
  const ejercicios = await listarEjercicios();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Link href={`/rutinas/${rutina.id}`} className="text-sm text-slate-500 hover:text-slate-800">← {rutina.nombre}</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Editar rutina</h1>
        {rutina.cliente_nombre && (
          <p className="mt-1 text-sm text-slate-500">Rutina personalizada para {rutina.cliente_nombre}; los cambios no afectan al catálogo.</p>
        )}
      </header>
      <EditorRutina accion={guardarRutina.bind(null, rutina.id)} rutina={rutina} ejercicios={ejercicios} />
    </div>
  );
}
