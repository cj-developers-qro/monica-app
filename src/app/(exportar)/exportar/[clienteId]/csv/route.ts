import type { NextRequest } from "next/server";
import { usuarioActual } from "@/lib/auth";
import { obtenerCliente, obtenerPlan } from "@/lib/datos";
import { medidaCasera } from "@/lib/nutricion";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

// Excel abre bien CSV con separador de coma y BOM UTF-8 (para los acentos).
const celda = (v: string | number | null) => {
  const t = v == null ? "" : String(v);
  return /[",\n]/.test(t) ? `"${t.replace(/"/g, '""')}"` : t;
};

/** Plan mensual en CSV: una fila por alimento de cada comida de cada día. */
export async function GET(req: NextRequest, ctx: RouteContext<"/exportar/[clienteId]/csv">) {
  const clienteId = Number((await ctx.params).clienteId);
  const usuario = await usuarioActual();
  if (!usuario || usuario.debe_cambiar) return new Response("No autorizado", { status: 401 });
  if (usuario.rol !== "admin" && usuario.cliente_id !== clienteId) return new Response("Prohibido", { status: 403 });

  const planId = Number(req.nextUrl.searchParams.get("plan"));
  const [cliente, registro] = await Promise.all([obtenerCliente(clienteId), obtenerPlan(clienteId, planId)]);
  if (!cliente || !registro) return new Response("Plan no encontrado", { status: 404 });

  const filas: (string | number | null)[][] = [
    ["Semana", "Fecha", "Día", "Tipo de día", "Comida", "Alimento", "Gramos", "Medida casera", "kcal", "Proteína (g)", "Carbohidratos (g)", "Grasas (g)"],
  ];
  for (const s of registro.plan.semanas)
    for (const d of s.dias)
      for (const c of d.comidas)
        for (const i of c.items)
          filas.push([
            s.numero, d.fecha, DIAS[(new Date(`${d.fecha}T12:00:00`).getDay() + 6) % 7], d.entreno ? "Entrenamiento" : "Descanso",
            c.nombre, i.nombre, i.gramos, medidaCasera(i.clave, i.gramos), i.kcal, i.p, i.c, i.g,
          ]);
  const csv = "﻿" + filas.map((f) => f.map(celda).join(",")).join("\r\n");
  const nombre = `plan-${cliente.nombre.normalize("NFD").replace(/[^\w]+/g, "-").toLowerCase()}-${registro.plan.fecha_inicio}.csv`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nombre}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
