// Avisos a las personas usuarias. Hoy el único canal es Telegram; el historial queda en la tabla
// `notificaciones`. Regla de privacidad: los mensajes NUNCA llevan datos de salud, solo un aviso
// corto con el enlace a la app (donde se entra con contraseña).
import { db } from "./db";
import { enviarMensaje, telegramActivo } from "./telegram";

export type TipoAviso = "plan" | "rutina" | "recordatorio" | "mensaje" | "seguimiento" | "prueba";

type Destinatario = { id: number; telegram_chat_id: string | null };

function registrar(usuarioId: number, tipo: TipoAviso, texto: string, estado: "enviado" | "error", error: string | null = null) {
  db()
    .prepare("INSERT INTO notificaciones (usuario_id, tipo, texto, estado, error) VALUES (?, ?, ?, ?, ?)")
    .run(usuarioId, tipo, texto, estado, error);
}

/**
 * Envía el aviso a una persona si tiene Telegram vinculado. Nunca lanza errores: un fallo de
 * Telegram no debe impedir que se guarde un plan o una rutina. Si la persona bloqueó el bot,
 * se desvincula para no seguir intentando.
 */
export async function avisarUsuario(usuario: Destinatario, tipo: TipoAviso, html: string, ruta?: string): Promise<boolean> {
  if (!usuario.telegram_chat_id || !telegramActivo()) return false;
  const r = await enviarMensaje(usuario.telegram_chat_id, html, ruta);
  if (r.ok) {
    registrar(usuario.id, tipo, html, "enviado");
    return true;
  }
  registrar(usuario.id, tipo, html, "error", r.description ?? "Error desconocido");
  if (r.error_code === 403) {
    db().prepare("UPDATE usuarios SET telegram_chat_id = NULL, telegram_vinculado_en = NULL WHERE id = ?").run(usuario.id);
  }
  return false;
}

/** Aviso al cliente dueño del expediente (si tiene acceso activo y Telegram vinculado). */
export async function avisarCliente(clienteId: number, tipo: TipoAviso, html: string, ruta?: string) {
  const u = db()
    .prepare("SELECT id, telegram_chat_id FROM usuarios WHERE cliente_id = ? AND activo = 1")
    .get(clienteId) as Destinatario | undefined;
  return u ? avisarUsuario(u, tipo, html, ruta) : false;
}

/** Aviso a la(s) administradora(s) con Telegram vinculado. */
export async function avisarAdministradoras(tipo: TipoAviso, html: string, ruta?: string) {
  const admins = db()
    .prepare("SELECT id, telegram_chat_id FROM usuarios WHERE rol = 'admin' AND activo = 1 AND telegram_chat_id IS NOT NULL")
    .all() as Destinatario[];
  for (const a of admins) await avisarUsuario(a, tipo, html, ruta);
}
