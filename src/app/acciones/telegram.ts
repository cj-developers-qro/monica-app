"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { requerirAdmin, usuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { texto, type EstadoFormulario } from "@/lib/formulario";
import { avisarUsuario } from "@/lib/notificaciones";
import { escaparHtml, guardarConfiguracion, llamarApi, secretoWebhook, telegramActivo, usuarioBot } from "@/lib/telegram";

const MINUTOS_CODIGO = 30;

/** URL pública desde la que se usa la app (detrás del túnel llega como x-forwarded-host/proto). */
async function urlDeLaPeticion() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${h.get("x-forwarded-proto") ?? "http"}://${host}`;
}

/** Valida el token con Telegram, registra el webhook y guarda la configuración. Solo la administradora. */
export async function conectarBot(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const token = texto(fd, "token");
  if (!/^\d{5,}:[A-Za-z0-9_-]{30,}$/.test(token)) return { error: "Ese no parece un token de BotFather (se ve como 123456789:AAH…)." };

  const yo = await llamarApi<{ username: string }>("getMe", {}, token);
  if (!yo.ok || !yo.result) return { error: `Telegram rechazó el token: ${yo.description ?? "token inválido"}.` };

  const base = await urlDeLaPeticion();
  if (!base.startsWith("https://")) {
    return { error: "Para conectar el bot, abre MoniFit desde su dirección pública con HTTPS (https://moni-fit.com)." };
  }
  const webhook = await llamarApi(
    "setWebhook",
    { url: `${base}/api/telegram`, secret_token: secretoWebhook(token), allowed_updates: ["message"], drop_pending_updates: true },
    token,
  );
  if (!webhook.ok) return { error: `No se pudo registrar el bot: ${webhook.description}.` };

  // Si es un bot distinto al anterior, las vinculaciones previas ya no sirven.
  const anterior = usuarioBot();
  if (anterior && anterior !== yo.result.username) {
    db().prepare("UPDATE usuarios SET telegram_chat_id = NULL, telegram_vinculado_en = NULL").run();
  }
  guardarConfiguracion("telegram_token", token);
  guardarConfiguracion("telegram_bot_usuario", yo.result.username);
  guardarConfiguracion("url_publica", base);
  revalidatePath("/", "layout");
  return { ok: true, mensaje: `Bot @${yo.result.username} conectado. Ahora vincula tu propio Telegram para recibir avisos.` };
}

export async function desconectarBot(): Promise<void> {
  await requerirAdmin();
  await llamarApi("deleteWebhook", { drop_pending_updates: true });
  guardarConfiguracion("telegram_token", null);
  revalidatePath("/", "layout");
}

/** Mensaje de Moni a un cliente o a todos los que tienen Telegram vinculado. */
export async function enviarAviso(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  if (!telegramActivo()) return { error: "Primero conecta el bot de Telegram." };
  const mensaje = texto(fd, "mensaje");
  if (!mensaje) return { error: "Escribe el mensaje." };
  if (mensaje.length > 1000) return { error: "El mensaje es muy largo (máximo 1000 caracteres)." };
  const destino = texto(fd, "destino");

  const sql = `SELECT u.id, u.telegram_chat_id FROM usuarios u
               WHERE u.rol = 'cliente' AND u.activo = 1 AND u.telegram_chat_id IS NOT NULL`;
  const destinatarios = (
    destino === "todos"
      ? db().prepare(sql).all()
      : db().prepare(`${sql} AND u.cliente_id = ?`).all(Number(destino))
  ) as { id: number; telegram_chat_id: string }[];
  if (destinatarios.length === 0) return { error: "No hay clientes con Telegram vinculado para ese destino." };

  const html = `💬 <b>Mensaje de Moni</b>\n\n${escaparHtml(mensaje)}`;
  let enviados = 0;
  for (const d of destinatarios) if (await avisarUsuario(d, "mensaje", html, "/portal")) enviados++;
  revalidatePath("/avisos");
  const fallidos = destinatarios.length - enviados;
  return fallidos
    ? { error: `Se envió a ${enviados} de ${destinatarios.length}. Revisa el historial para ver los errores.` }
    : { ok: true, mensaje: `Mensaje enviado a ${enviados} ${enviados === 1 ? "persona" : "personas"}.` };
}

/** Genera un código de un solo uso y abre el bot en Telegram para vincular la cuenta. */
export async function vincularTelegram(): Promise<void> {
  const u = await usuarioActual();
  if (!u || u.debe_cambiar) redirect("/login");
  const bot = usuarioBot();
  if (!telegramActivo() || !bot) redirect("/cuenta");
  const codigo = randomBytes(12).toString("base64url");
  db().prepare("DELETE FROM telegram_codigos WHERE usuario_id = ? OR expira < datetime('now')").run(u.id);
  db()
    .prepare(`INSERT INTO telegram_codigos (codigo, usuario_id, expira) VALUES (?, ?, datetime('now', '+${MINUTOS_CODIGO} minutes'))`)
    .run(codigo, u.id);
  redirect(`https://t.me/${bot}?start=${codigo}`);
}

export async function desvincularTelegram(): Promise<void> {
  const u = await usuarioActual();
  if (!u) redirect("/login");
  db().prepare("UPDATE usuarios SET telegram_chat_id = NULL, telegram_vinculado_en = NULL WHERE id = ?").run(u.id);
  revalidatePath("/", "layout");
}

/** Mensaje de prueba a la propia cuenta (para confirmar que llegan los avisos). */
export async function probarTelegram(): Promise<void> {
  const u = await usuarioActual();
  if (!u) redirect("/login");
  const fila = db().prepare("SELECT id, telegram_chat_id FROM usuarios WHERE id = ?").get(u.id) as { id: number; telegram_chat_id: string | null };
  await avisarUsuario(fila, "prueba", "✅ <b>Prueba de MoniFit</b>\nAsí te llegarán los avisos.", u.rol === "admin" ? "/avisos" : "/portal");
  revalidatePath("/", "layout");
}
