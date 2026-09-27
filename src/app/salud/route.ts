import { db } from "@/lib/db";

// Chequeo de salud para el monitoreo (UptimeRobot, Cloudflare): responde 200 si la app y la base
// de datos funcionan. Es público y no revela información.
export async function GET() {
  try {
    db().prepare("SELECT 1").get();
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return Response.json({ ok: false }, { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
