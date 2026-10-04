import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BotonEnviar, Formulario } from "@/components/Formulario";
import { cambiarContrasena, cerrarSesion } from "@/app/acciones/sesion";
import { TelegramPersonal } from "@/components/TelegramPersonal";
import { LONGITUD_MINIMA, usuarioActual } from "@/lib/auth";
import { db } from "@/lib/db";
import { telegramActivo } from "@/lib/telegram";

export const metadata: Metadata = { title: "Mi cuenta" };

export default async function Cuenta() {
  // Aquí no se usa requerirSesion(): esta es justo la página a la que se envía a quien debe cambiar su contraseña.
  const usuario = await usuarioActual();
  if (!usuario) redirect("/login");
  const primera = Boolean(usuario.debe_cambiar);

  return (
    <>
      <h2 className="text-xl font-semibold text-slate-900">{primera ? `¡Hola, ${usuario.nombre.split(" ")[0]}!` : "Mi cuenta"}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {primera
          ? "Estás usando una contraseña temporal. Crea tu propia contraseña para continuar."
          : `Sesión iniciada como ${usuario.usuario}.`}
      </p>
      <Formulario accion={cambiarContrasena} className="mt-6 space-y-4">
        <label className="block">
          <span className="etiqueta">{primera ? "Contraseña temporal" : "Contraseña actual"}</span>
          <input name="actual" type="password" autoComplete="current-password" required className="campo" />
        </label>
        <label className="block">
          <span className="etiqueta">Nueva contraseña (mínimo {LONGITUD_MINIMA} caracteres)</span>
          <input name="nueva" type="password" autoComplete="new-password" minLength={LONGITUD_MINIMA} required className="campo" />
        </label>
        <label className="block">
          <span className="etiqueta">Repite la nueva contraseña</span>
          <input name="confirmacion" type="password" autoComplete="new-password" minLength={LONGITUD_MINIMA} required className="campo" />
        </label>
        <BotonEnviar className="boton w-full py-2.5">{primera ? "Guardar y continuar" : "Cambiar contraseña"}</BotonEnviar>
      </Formulario>
      {!primera && telegramActivo() && (
        <section id="telegram" className="mt-8 scroll-mt-6 border-t border-pink-100 pt-6">
          <h3 className="text-base font-semibold text-slate-900">Avisos por Telegram</h3>
          <div className="mt-2">
            <TelegramPersonal
              chatId={usuario.telegram_chat_id}
              vinculadoEn={
                (db().prepare("SELECT telegram_vinculado_en FROM usuarios WHERE id = ?").get(usuario.id) as { telegram_vinculado_en: string | null })
                  .telegram_vinculado_en
              }
              texto={
                usuario.rol === "admin"
                  ? "Recibe un aviso cuando tus clientes registren su seguimiento semanal."
                  : "Recibe en Telegram los avisos de Moni: tu nuevo plan, tu nueva rutina y el recordatorio semanal. Es opcional."
              }
            />
          </div>
        </section>
      )}
      <div className="mt-6 flex items-center justify-between text-sm">
        {primera ? <span /> : <Link href={usuario.rol === "admin" ? "/" : "/portal"} className="enlace">← Volver</Link>}
        <form action={cerrarSesion}>
          <button type="submit" className="text-slate-500 hover:text-pink-700">Cerrar sesión</button>
        </form>
      </div>
    </>
  );
}
