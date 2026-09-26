import type { Metadata } from "next";
import Link from "next/link";
import { FormularioEjercicio } from "@/components/FormularioEjercicio";
import { guardarEjercicio } from "@/app/acciones/ejercicios";

export const metadata: Metadata = { title: "Nuevo ejercicio" };

export default function NuevoEjercicio() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Link href="/ejercicios" className="text-sm text-slate-500 hover:text-slate-800">← Ejercicios</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nuevo ejercicio</h1>
      </header>
      <FormularioEjercicio accion={guardarEjercicio.bind(null, null)} />
    </div>
  );
}
