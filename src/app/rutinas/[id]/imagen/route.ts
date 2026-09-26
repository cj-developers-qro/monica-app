import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";
import { obtenerRutina } from "@/lib/datos";
import { DIRECTORIO_IMAGENES } from "@/lib/db";
import { combinarMusculos, diagramaMusculosSVG } from "@/lib/musculos";

const TIPOS: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".webp": "image/webp" };

/** Imagen de la rutina: la subida por el usuario o, si no hay, el diagrama SVG de músculos trabajados. */
export async function GET(req: NextRequest, ctx: RouteContext<"/rutinas/[id]/imagen">) {
  const { id } = await ctx.params;
  const rutina = await obtenerRutina(Number(id));
  if (!rutina) return new Response("No encontrada", { status: 404 });

  const nombreArchivo = rutina.nombre.normalize("NFD").replace(/[^\w]+/g, "-").toLowerCase();
  const descarga = req.nextUrl.searchParams.has("descargar");
  const cabeceras = (tipo: string, ext: string): HeadersInit => ({
    "Content-Type": tipo,
    "Cache-Control": "no-cache",
    ...(descarga ? { "Content-Disposition": `attachment; filename="${nombreArchivo}${ext}"` } : {}),
  });

  if (rutina.imagen) {
    const archivo = path.basename(rutina.imagen);
    const ext = path.extname(archivo);
    try {
      const datos = await readFile(path.join(/*turbopackIgnore: true*/ DIRECTORIO_IMAGENES, archivo));
      return new Response(new Uint8Array(datos), { headers: cabeceras(TIPOS[ext] ?? "application/octet-stream", ext) });
    } catch {
      // Si el archivo desapareció, se responde con el diagrama generado.
    }
  }
  const { principales, secundarios } = combinarMusculos(rutina.items.map((i) => i.ejercicio));
  return new Response(diagramaMusculosSVG(principales, secundarios), { headers: cabeceras("image/svg+xml", ".svg") });
}
