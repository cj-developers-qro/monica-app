import { desvincularTelegram, probarTelegram, vincularTelegram } from "@/app/acciones/telegram";
import { usuarioBot } from "@/lib/telegram";

const fecha = (f: string) => new Date(f.replace(" ", "T") + "Z").toLocaleDateString("es-MX", { dateStyle: "long" });

/** Vincular, probar o desvincular el Telegram de la persona que inició sesión. */
export function TelegramPersonal({ vinculadoEn, chatId, texto }: { vinculadoEn: string | null; chatId: string | null; texto: string }) {
  const bot = usuarioBot();
  if (!chatId) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-600">{texto}</p>
        <form action={vincularTelegram}>
          <button type="submit" className="boton">
            📲 Vincular Telegram
          </button>
        </form>
        <p className="text-xs text-slate-500">
          Se abrirá Telegram con el bot <strong>@{bot}</strong>: presiona <strong>Iniciar</strong> y vuelve aquí. El enlace sirve 30 minutos y solo una vez.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <p className="text-sm text-emerald-700">✓ Telegram vinculado{vinculadoEn ? ` desde el ${fecha(vinculadoEn)}` : ""}.</p>
      <div className="flex flex-wrap gap-2">
        <form action={probarTelegram}>
          <button type="submit" className="boton-secundario">
            Enviarme un mensaje de prueba
          </button>
        </form>
        <form action={desvincularTelegram}>
          <button type="submit" className="boton-peligro">
            Desvincular
          </button>
        </form>
      </div>
    </div>
  );
}
