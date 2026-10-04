// Recordatorio semanal por Telegram: a cada cliente con plan de nutrición vigente que todavía no
// registró su seguimiento de la semana. Lo ejecuta el timer monifit-recordatorio (domingos 18:00).
//
//   npm run recordatorio
//
// No repite el aviso: se salta a quien ya lo recibió o ya registró algo en los últimos 6 días.
import { db } from "@/lib/db";
import { avisarUsuario } from "@/lib/notificaciones";
import { escaparHtml, telegramActivo } from "@/lib/telegram";

if (!telegramActivo()) {
  console.log("El bot de Telegram no está configurado; no se envían recordatorios.");
  process.exit(0);
}

const pendientes = db()
  .prepare(
    `SELECT u.id, u.telegram_chat_id, c.nombre
     FROM usuarios u JOIN clientes c ON c.id = u.cliente_id
     WHERE u.rol = 'cliente' AND u.activo = 1 AND u.telegram_chat_id IS NOT NULL AND u.acepto_privacidad IS NOT NULL
       AND EXISTS (SELECT 1 FROM planes_nutricion p WHERE p.cliente_id = c.id
                   AND p.fecha_inicio <= date('now', 'localtime') AND p.fecha_fin >= date('now', 'localtime'))
       AND NOT EXISTS (SELECT 1 FROM seguimiento_nutricion s WHERE s.cliente_id = c.id
                       AND s.fecha >= date('now', 'localtime', '-6 days'))
       AND NOT EXISTS (SELECT 1 FROM notificaciones n WHERE n.usuario_id = u.id AND n.tipo = 'recordatorio'
                       AND n.estado = 'enviado' AND n.creado_en >= datetime('now', '-6 days'))`,
  )
  .all() as { id: number; telegram_chat_id: string; nombre: string }[];

let enviados = 0;
for (const p of pendientes) {
  const ok = await avisarUsuario(
    p,
    "recordatorio",
    `📝 <b>¿Cómo te fue esta semana, ${escaparHtml(p.nombre.split(" ")[0])}?</b>\nRegistra tu seguimiento en <b>Mi nutrición</b>: con eso Moni ajusta tu siguiente plan. Te toma un minuto.`,
    "/portal/nutricion",
  );
  if (ok) enviados++;
}
console.log(`Recordatorios enviados: ${enviados} de ${pendientes.length} pendientes.`);
