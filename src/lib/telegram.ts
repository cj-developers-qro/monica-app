// Cliente mínimo de la API de bots de Telegram. Sin dependencias de Next.js para poder usarlo
// también desde los scripts (recordatorio semanal).
//
// El token del bot se toma de la variable TELEGRAM_BOT_TOKEN o, si no existe, de la tabla
// `configuracion` (Moni lo pega en la pantalla Avisos). TELEGRAM_API_URL solo se usa en pruebas.
import { createHash } from "node:crypto";
import { db } from "./db";

const API = process.env.TELEGRAM_API_URL ?? "https://api.telegram.org";
const TIEMPO_MAXIMO_MS = 8000;

export function leerConfiguracion(clave: string): string | null {
  const fila = db().prepare("SELECT valor FROM configuracion WHERE clave = ?").get(clave) as { valor: string } | undefined;
  return fila?.valor ?? null;
}

export function guardarConfiguracion(clave: string, valor: string | null) {
  if (valor == null) db().prepare("DELETE FROM configuracion WHERE clave = ?").run(clave);
  else db().prepare("INSERT INTO configuracion (clave, valor) VALUES (?, ?) ON CONFLICT(clave) DO UPDATE SET valor = excluded.valor").run(clave, valor);
}

export function tokenBot(): string | null {
  return process.env.TELEGRAM_BOT_TOKEN || leerConfiguracion("telegram_token");
}

/** Usuario del bot (sin @), guardado al conectarlo. */
export function usuarioBot(): string | null {
  return leerConfiguracion("telegram_bot_usuario");
}

/** URL pública de la app (p. ej. https://moni-fit.com), guardada al conectar el bot. */
export function urlPublica(): string | null {
  return process.env.APP_URL || leerConfiguracion("url_publica");
}

export function telegramActivo(): boolean {
  return Boolean(tokenBot() && usuarioBot());
}

/** Secreto que Telegram envía en cada llamada al webhook; se deriva del token para no guardar otro dato. */
export function secretoWebhook(token = tokenBot()): string {
  return createHash("sha256").update(`monifit-webhook:${token ?? ""}`).digest("hex");
}

export type RespuestaTelegram<T = unknown> = { ok: boolean; result?: T; description?: string; error_code?: number };

export async function llamarApi<T = unknown>(metodo: string, parametros: object = {}, token = tokenBot()): Promise<RespuestaTelegram<T>> {
  if (!token) return { ok: false, description: "El bot de Telegram no está configurado." };
  try {
    const r = await fetch(`${API}/bot${token}/${metodo}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parametros),
      signal: AbortSignal.timeout(TIEMPO_MAXIMO_MS),
    });
    return (await r.json()) as RespuestaTelegram<T>;
  } catch (error) {
    return { ok: false, description: `No se pudo contactar a Telegram: ${(error as Error).message}` };
  }
}

export const escaparHtml = (t: string) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Envía un mensaje (HTML de Telegram). Si se indica `ruta` y la app tiene URL pública con HTTPS,
 * agrega el botón "Abrir MoniFit" (Telegram no acepta enlaces http en botones).
 */
export async function enviarMensaje(chatId: string, html: string, ruta?: string) {
  const base = urlPublica();
  const boton =
    ruta && base?.startsWith("https://")
      ? { reply_markup: { inline_keyboard: [[{ text: "Abrir MoniFit", url: `${base}${ruta}` }]] } }
      : {};
  return llamarApi("sendMessage", { chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true, ...boton });
}
