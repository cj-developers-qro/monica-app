import type { Metadata } from "next";
import { BotonAccion } from "@/components/BotonAccion";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { TelegramPersonal } from "@/components/TelegramPersonal";
import { conectarBot, desconectarBot, enviarAviso } from "@/app/acciones/telegram";
import { requerirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { listarAvisos, listarVinculosTelegram } from "@/lib/datos";
import { llamarApi, telegramActivo, usuarioBot } from "@/lib/telegram";

export const metadata: Metadata = { title: "Avisos" };

const TIPOS: Record<string, string> = {
  plan: "Nuevo plan",
  rutina: "Nueva rutina",
  recordatorio: "Recordatorio semanal",
  mensaje: "Mensaje de Moni",
  seguimiento: "Seguimiento registrado",
  prueba: "Prueba",
};
const fechaHora = (f: string) => new Date(f.replace(" ", "T") + "Z").toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });

export default async function Avisos() {
  const yo = await requerirAdmin();
  const [vinculos, historial] = await Promise.all([listarVinculosTelegram(), listarAvisos()]);
  const activo = telegramActivo();
  const webhook = activo ? await llamarApi<{ url: string; pending_update_count: number; last_error_message?: string }>("getWebhookInfo") : null;
  const mio = db().prepare("SELECT telegram_vinculado_en FROM usuarios WHERE id = ?").get(yo.id) as { telegram_vinculado_en: string | null };
  const conTelegram = vinculos.filter((v) => v.telegram_vinculado_en);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">Avisos por Telegram</h1>
        <p className="text-sm text-slate-500">
          Tus clientes reciben en Telegram avisos de su plan, su rutina y recordatorios, y tú te enteras cuando registran su semana. Los mensajes
          nunca incluyen datos de salud: solo un aviso con el botón para abrir MoniFit.
        </p>
      </header>

      <section className="tarjeta p-5">
        <h2 className="text-base font-semibold text-slate-900">1. Bot de Telegram</h2>
        {activo ? (
          <div className="mt-3 space-y-3 text-sm">
            <p className="text-emerald-700">
              ✓ Conectado como <strong>@{usuarioBot()}</strong>
            </p>
            {webhook?.ok ? (
              <p className="text-xs text-slate-500">
                Recibiendo mensajes en {webhook.result?.url}
                {webhook.result?.last_error_message ? ` · Último error de Telegram: ${webhook.result.last_error_message}` : ""}
              </p>
            ) : (
              <p className="text-xs text-amber-700">No se pudo consultar el estado del bot: {webhook?.description}</p>
            )}
            <BotonAccion
              accion={desconectarBot}
              confirmar="¿Desconectar el bot? Dejarán de enviarse avisos hasta que lo vuelvas a conectar."
              className="boton-peligro"
            >
              Desconectar bot
            </BotonAccion>
          </div>
        ) : (
          <div className="mt-3 space-y-4 text-sm text-slate-700">
            <ol className="list-decimal space-y-1 pl-5">
              <li>
                En Telegram, abre <strong>@BotFather</strong> y escribe <code>/newbot</code>.
              </li>
              <li>
                Nombre: <strong>MoniFit</strong>. Usuario: uno que termine en <code>bot</code>, por ejemplo <code>MoniFitAvisosBot</code>.
              </li>
              <li>BotFather te responde con un <strong>token</strong> (se ve como <code>123456789:AAH…</code>). Cópialo y pégalo aquí:</li>
            </ol>
            <Formulario accion={conectarBot}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <label className="flex-1">
                  <span className="etiqueta">Token del bot</span>
                  <input name="token" required autoComplete="off" spellCheck={false} className="campo font-mono" />
                </label>
                <BotonEnviar>Conectar bot</BotonEnviar>
              </div>
            </Formulario>
            <p className="text-xs text-slate-500">El token es secreto: no lo compartas por chat ni correo. Solo se guarda en el servidor de MoniFit.</p>
          </div>
        )}
      </section>

      {activo && (
        <>
          <section className="tarjeta p-5">
            <h2 className="mb-3 text-base font-semibold text-slate-900">2. Tu Telegram</h2>
            <TelegramPersonal
              chatId={yo.telegram_chat_id}
              vinculadoEn={mio.telegram_vinculado_en}
              texto="Vincúlalo para enterarte cuando un cliente registre su seguimiento semanal."
            />
          </section>

          <section className="tarjeta p-5">
            <h2 className="text-base font-semibold text-slate-900">3. Enviar un mensaje</h2>
            <p className="mt-1 text-xs text-slate-500">
              Para avisos generales (horarios, días festivos, recordatorios). No escribas datos de salud: los mensajes pasan por Telegram.
            </p>
            <Formulario accion={enviarAviso} className="mt-4 space-y-3">
              <label className="block">
                <span className="etiqueta">Para</span>
                <select name="destino" className="campo" defaultValue="todos">
                  <option value="todos">Todos los clientes con Telegram ({conTelegram.length})</option>
                  {conTelegram.map((v) => (
                    <option key={v.cliente_id} value={v.cliente_id}>
                      {v.nombre}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="etiqueta">Mensaje</span>
                <textarea name="mensaje" rows={3} maxLength={1000} required className="campo" placeholder="Ej. Esta semana no hay sesiones el jueves por el día festivo." />
              </label>
              <BotonEnviar>Enviar por Telegram</BotonEnviar>
            </Formulario>
          </section>
        </>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="tarjeta p-5">
          <h2 className="text-base font-semibold text-slate-900">Clientes con acceso</h2>
          <p className="mt-1 text-xs text-slate-500">
            Cada cliente vincula su Telegram desde <strong>Mi cuenta</strong>; tú no puedes hacerlo por ellos.
          </p>
          <ul className="mt-3 divide-y divide-pink-50 text-sm">
            {vinculos.length === 0 && <li className="py-2 text-slate-500">Aún no hay clientes con acceso a la app.</li>}
            {vinculos.map((v) => (
              <li key={v.cliente_id} className="flex justify-between gap-3 py-2">
                <span>{v.nombre}</span>
                {v.telegram_vinculado_en ? <span className="insignia-marca">📲 Telegram</span> : <span className="text-xs text-slate-400">Sin Telegram</span>}
              </li>
            ))}
          </ul>
        </section>

        <section className="tarjeta p-5">
          <h2 className="text-base font-semibold text-slate-900">Avisos automáticos</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>🥗 <strong>Nuevo plan de nutrición</strong>: al generar un plan.</li>
            <li>🏋️ <strong>Nueva rutina</strong>: al asignar o personalizar una rutina.</li>
            <li>📝 <strong>Recordatorio semanal</strong>: los domingos a las 6 p. m., a quien no ha registrado su semana.</li>
            <li>🔔 <strong>Para ti</strong>: cuando un cliente registra su seguimiento.</li>
          </ul>
        </section>
      </div>

      <section className="tarjeta overflow-x-auto">
        <h2 className="px-5 pt-5 text-base font-semibold text-slate-900">Historial</h2>
        {historial.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">Todavía no se ha enviado ningún aviso.</p>
        ) : (
          <table className="mt-3 w-full min-w-[560px] text-sm">
            <thead className="bg-pink-50/60 text-left text-xs text-slate-500">
              <tr>
                <th className="px-5 py-2 font-medium">Fecha</th>
                <th className="px-3 py-2 font-medium">Para</th>
                <th className="px-3 py-2 font-medium">Aviso</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {historial.map((h) => (
                <tr key={h.id} className="border-t border-pink-50">
                  <td className="whitespace-nowrap px-5 py-2 text-slate-600">{fechaHora(h.creado_en)}</td>
                  <td className="px-3 py-2">{h.nombre ?? "—"}</td>
                  <td className="px-3 py-2">{TIPOS[h.tipo] ?? h.tipo}</td>
                  <td className="px-3 py-2">
                    {h.estado === "enviado" ? <span className="text-emerald-700">✓ Enviado</span> : <span className="text-red-700" title={h.error ?? ""}>✕ {h.error}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
