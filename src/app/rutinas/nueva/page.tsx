import type { Metadata } from "next";
import Link from "next/link";
import { EditorRutina } from "@/components/EditorRutina";
import { guardarRutina } from "@/app/acciones/rutinas";
import { listarEjercicios } from "@/lib/datos";

export const metadata: Metadata = { title: "Nueva rutina" };

export default async function NuevaRutina() {
  const ejercicios = await listarEjercicios();
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <Link href="/rutinas" className="text-sm text-slate-500 hover:text-slate-800">← Rutinas</Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900">Nueva rutina</h1>
      </header>
      <EditorRutina accion={guardarRutina.bind(null, null)} ejercicios={ejercicios} />
    </div>
  );
}
