import { db } from "@/lib/db";
import { enviarMensaje, secretoWebhook, telegramActivo, usuarioBot } from "@/lib/telegram";

// Webhook del bot: Telegram llama aquí cuando alguien le escribe. Solo atiende chats privados y
// verifica el secreto que se registró con setWebhook. Siempre responde 200 para que Telegram no
// reintente el mismo mensaje.
type Actualizacion = { message?: { text?: string; chat: { id: number; type: string } } };

export async function POST(req: Request) {
  if (!telegramActivo() || req.headers.get("x-telegram-bot-api-secret-token") !== secretoWebhook()) {
    return new Response("No autorizado", { status: 401 });
  }
  const { message } = (await req.json().catch(() => ({}))) as Actualizacion;
  if (!message?.text || message.chat.type !== "private") return Response.json({ ok: true });
  const chat = String(message.chat.id);
  const [comando, argumento] = message.text.trim().split(/\s+/, 2);

  if (comando === "/start" && argumento) {
    const fila = db()
      .prepare(
        `SELECT u.id, u.nombre FROM telegram_codigos c JOIN usuarios u ON u.id = c.usuario_id
         WHERE c.codigo = ? AND c.expira > datetime('now') AND u.activo = 1`,
      )
      .get(argumento) as { id: number; nombre: string } | undefined;
    if (!fila) {
      await enviarMensaje(chat, "Este enlace ya no es válido o expiró. Vuelve a MoniFit → <b>Mi cuenta</b> → <b>Vincular Telegram</b>.");
      return Response.json({ ok: true });
    }
    db().prepare("UPDATE usuarios SET telegram_chat_id = ?, telegram_vinculado_en = datetime('now') WHERE id = ?").run(chat, fila.id);
    db().prepare("DELETE FROM telegram_codigos WHERE usuario_id = ?").run(fila.id);
    await enviarMensaje(
      chat,
      `✅ ¡Listo, ${fila.nombre.split(" ")[0]}! Aquí recibirás los avisos de MoniFit.\n\nPara dejar de recibirlos escribe /desvincular o hazlo desde <b>Mi cuenta</b>.`,
    );
  } else if (comando === "/desvincular" || comando === "/stop") {
    db().prepare("UPDATE usuarios SET telegram_chat_id = NULL, telegram_vinculado_en = NULL WHERE telegram_chat_id = ?").run(chat);
    await enviarMensaje(chat, "Listo, ya no recibirás avisos de MoniFit. Puedes volver a activarlos desde <b>Mi cuenta</b>.");
  } else {
    await enviarMensaje(
      chat,
      `Hola 👋 Soy el bot de avisos de MoniFit (@${usuarioBot()}). No leo mensajes: para vincular tu cuenta entra a MoniFit → <b>Mi cuenta</b> → <b>Vincular Telegram</b>.`,
    );
  }
  return Response.json({ ok: true });
}
