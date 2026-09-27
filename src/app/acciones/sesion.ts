"use server";

import { redirect } from "next/navigation";
import {
  cerrarSesionActual,
  cifrarContrasena,
  crearSesion,
  MAX_INTENTOS,
  MINUTOS_BLOQUEO,
  normalizarUsuario,
  usuarioActual,
  validarNuevaContrasena,
  verificarContrasena,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { texto, type EstadoFormulario } from "@/lib/formulario";

type FilaUsuario = {
  id: number;
  rol: "admin" | "cliente";
  hash: string;
  activo: number;
  debe_cambiar: number;
  intentos_fallidos: number;
  bloqueado_hasta: string | null;
};

const ERROR_GENERICO = "Correo o contraseña incorrectos.";

// Hash de relleno para que un correo inexistente tarde lo mismo que uno real.
let hashRelleno: string | null = null;

export async function iniciarSesion(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const usuario = normalizarUsuario(texto(fd, "usuario"));
  const contrasena = String(fd.get("contrasena") ?? "");
  if (!usuario || !contrasena) return { error: "Escribe tu correo y tu contraseña." };

  const u = db()
    .prepare("SELECT id, rol, hash, activo, debe_cambiar, intentos_fallidos, bloqueado_hasta FROM usuarios WHERE usuario = ?")
    .get(usuario) as FilaUsuario | undefined;
  // Mismo mensaje si el usuario no existe, para no revelar qué correos están registrados.
  if (!u) {
    hashRelleno ??= cifrarContrasena("relleno-no-valido");
    verificarContrasena(contrasena, hashRelleno);
    return { error: ERROR_GENERICO };
  }
  if (u.bloqueado_hasta && Date.parse(u.bloqueado_hasta + "Z") > Date.now()) {
    return { error: `Demasiados intentos fallidos. Intenta de nuevo en ${MINUTOS_BLOQUEO} minutos.` };
  }
  if (!verificarContrasena(contrasena, u.hash)) {
    const intentos = u.intentos_fallidos + 1;
    const bloquear = intentos >= MAX_INTENTOS;
    db()
      .prepare(
        `UPDATE usuarios SET intentos_fallidos = ?, bloqueado_hasta = ${bloquear ? `datetime('now', '+${MINUTOS_BLOQUEO} minutes')` : "NULL"} WHERE id = ?`,
      )
      .run(bloquear ? 0 : intentos, u.id);
    return { error: bloquear ? `Demasiados intentos fallidos. Intenta de nuevo en ${MINUTOS_BLOQUEO} minutos.` : ERROR_GENERICO };
  }
  if (!u.activo) return { error: "Tu acceso está desactivado. Comunícate con Moni." };

  db().prepare("UPDATE usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = datetime('now') WHERE id = ?").run(u.id);
  await crearSesion(u.id);
  redirect(u.debe_cambiar ? "/cuenta?primera=1" : u.rol === "admin" ? "/" : "/portal");
}

export async function cerrarSesion() {
  await cerrarSesionActual();
  redirect("/login");
}

export async function cambiarContrasena(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const u = await usuarioActual();
  if (!u) redirect("/login");
  const actual = String(fd.get("actual") ?? "");
  const nueva = String(fd.get("nueva") ?? "");
  const fila = db().prepare("SELECT hash FROM usuarios WHERE id = ?").get(u.id) as { hash: string };
  if (!verificarContrasena(actual, fila.hash)) return { error: "La contraseña actual no es correcta." };
  const problema = validarNuevaContrasena(nueva, String(fd.get("confirmacion") ?? ""));
  if (problema) return { error: problema };
  if (nueva === actual) return { error: "La nueva contraseña debe ser distinta de la actual." };

  db().prepare("UPDATE usuarios SET hash = ?, debe_cambiar = 0 WHERE id = ?").run(cifrarContrasena(nueva), u.id);
  // Cierra las demás sesiones abiertas con la contraseña anterior y abre una nueva en este equipo.
  db().prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(u.id);
  await crearSesion(u.id);
  if (u.debe_cambiar) redirect(u.rol === "admin" ? "/" : "/portal");
  return { ok: true, mensaje: "Tu contraseña se actualizó." };
}

/** Consentimiento expreso del cliente al aviso de privacidad (datos de salud). */
export async function aceptarPrivacidad(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  const u = await usuarioActual();
  if (!u) redirect("/login");
  if (texto(fd, "acepto") !== "si") return { error: "Para continuar marca la casilla de aceptación." };
  db().prepare("UPDATE usuarios SET acepto_privacidad = datetime('now') WHERE id = ? AND acepto_privacidad IS NULL").run(u.id);
  redirect(u.rol === "admin" ? "/" : "/portal");
}
