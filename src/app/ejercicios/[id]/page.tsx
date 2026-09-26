import Link from "next/link";
import { notFound } from "next/navigation";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { FormularioEjercicio } from "@/components/FormularioEjercicio";
import { eliminarEjercicio, guardarEjercicio } from "@/app/acciones/ejercicios";
import { obtenerEjercicio } from "@/lib/datos";

export default async function EditarEjercicio({ params }: PageProps<"/ejercicios/[id]">) {
  const { id } = await params;
  const ejercicio = await obtenerEjercicio(Number(id));
  if (!ejercicio) notFound();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Link href="/ejercicios" className="text-sm text-slate-500 hover:text-slate-800">← Ejercicios</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">{ejercicio.nombre}</h1>
      </header>
      <FormularioEjercicio accion={guardarEjercicio.bind(null, ejercicio.id)} ejercicio={ejercicio} />
      <Formulario accion={eliminarEjercicio.bind(null, ejercicio.id)} className="rounded-xl border border-red-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-red-800">Eliminar ejercicio</h2>
        <p className="mt-1 text-sm text-slate-600">Solo es posible si no forma parte de ninguna rutina.</p>
        <div className="mt-3">
          <BotonEnviar className="boton-peligro">Eliminar ejercicio</BotonEnviar>
        </div>
      </Formulario>
    </div>
  );
}
