// Autenticación y autorización: contraseñas, sesiones y las verificaciones de rol que usan
// las consultas (lib/datos.ts), las páginas y las acciones del servidor.
import { createHash, randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { db } from "./db";

export const COOKIE_SESION = "sesion";
const DURACION_SESION_DIAS = 30;
export const MAX_INTENTOS = 5;
export const MINUTOS_BLOQUEO = 15;
export const LONGITUD_MINIMA = 8;

export type Usuario = {
  id: number;
  usuario: string;
  nombre: string;
  rol: "admin" | "cliente";
  cliente_id: number | null;
  debe_cambiar: number;
};

// --- Contraseñas ---------------------------------------------------------------

export function cifrarContrasena(contrasena: string): string {
  const sal = randomBytes(16);
  const hash = scryptSync(contrasena, sal, 64);
  return `scrypt$${sal.toString("base64")}$${hash.toString("base64")}`;
}

export function verificarContrasena(contrasena: string, guardado: string): boolean {
  const [, sal, hash] = guardado.split("$");
  if (!sal || !hash) return false;
  const esperado = Buffer.from(hash, "base64");
  const calculado = scryptSync(contrasena, Buffer.from(sal, "base64"), esperado.length);
  return timingSafeEqual(calculado, esperado);
}

const PALABRAS = ["rosa", "mango", "fresa", "luna", "sol", "brisa", "coral", "menta", "perla", "nube", "palma", "lima", "flor", "miel", "cielo", "roble"];

/** Contraseña temporal fácil de dictar, p. ej. "fresa-luna-4821". */
export function contrasenaTemporal() {
  const p = () => PALABRAS[randomInt(PALABRAS.length)];
  return `${p()}-${p()}-${randomInt(1000, 10000)}`;
}

export function validarNuevaContrasena(nueva: string, confirmacion: string): string | null {
  if (nueva.length < LONGITUD_MINIMA) return `La contraseña debe tener al menos ${LONGITUD_MINIMA} caracteres.`;
  if (nueva !== confirmacion) return "Las contraseñas no coinciden.";
  return null;
}

export const normalizarUsuario = (u: string) => u.trim().toLowerCase();

// --- Sesiones ------------------------------------------------------------------

const hashToken = (token: string) => createHash("sha256").update(token).digest("hex");

export async function crearSesion(usuarioId: number) {
  const token = randomBytes(32).toString("base64url");
  const expira = new Date(Date.now() + DURACION_SESION_DIAS * 86_400_000);
  db().prepare("DELETE FROM sesiones WHERE expira < datetime('now')").run();
  db()
    .prepare("INSERT INTO sesiones (token_hash, usuario_id, expira) VALUES (?, ?, ?)")
    .run(hashToken(token), usuarioId, expira.toISOString().replace("T", " ").slice(0, 19));
  // La cookie solo viaja por HTTPS cuando la app se sirve con HTTPS (en local se usa HTTP).
  const segura = (await headers()).get("x-forwarded-proto") === "https";
  (await cookies()).set(COOKIE_SESION, token, {
    httpOnly: true,
    secure: segura,
    sameSite: "lax",
    path: "/",
    expires: expira,
  });
}

export async function cerrarSesionActual() {
  const almacen = await cookies();
  const token = almacen.get(COOKIE_SESION)?.value;
  if (token) db().prepare("DELETE FROM sesiones WHERE token_hash = ?").run(hashToken(token));
  almacen.delete(COOKIE_SESION);
}

/** Usuario de la sesión actual (o null). Se memoriza durante cada petición. */
export const usuarioActual = cache(async (): Promise<Usuario | null> => {
  const token = (await cookies()).get(COOKIE_SESION)?.value;
  if (!token) return null;
  const fila = db()
    .prepare(
      `SELECT u.id, u.usuario, u.nombre, u.rol, u.cliente_id, u.debe_cambiar
       FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
       WHERE s.token_hash = ? AND s.expira > datetime('now') AND u.activo = 1`,
    )
    .get(hashToken(token));
  return (fila as Usuario | undefined) ?? null;
});

export function existeAdministradora(): boolean {
  return Boolean(db().prepare("SELECT 1 FROM usuarios WHERE rol = 'admin' LIMIT 1").get());
}

// --- Autorización ----------------------------------------------------------------

/** Exige una sesión válida; si la contraseña es temporal, obliga a cambiarla primero. */
export async function requerirSesion(): Promise<Usuario> {
  const u = await usuarioActual();
  if (!u) redirect("/login");
  if (u.debe_cambiar) redirect("/cuenta?primera=1");
  return u;
}

/** Solo la administradora (Moni). Un cliente que llegue aquí se envía a su portal. */
export async function requerirAdmin(): Promise<Usuario> {
  const u = await requerirSesion();
  if (u.rol !== "admin") redirect("/portal");
  return u;
}

/** Solo un cliente con expediente; devuelve su cliente_id. */
export async function requerirCliente(): Promise<Usuario & { cliente_id: number }> {
  const u = await requerirSesion();
  if (u.rol !== "cliente" || u.cliente_id == null) redirect("/");
  return u as Usuario & { cliente_id: number };
}

/** La administradora ve cualquier expediente; un cliente, únicamente el suyo. */
export async function requerirAccesoCliente(clienteId: number): Promise<Usuario> {
  const u = await requerirSesion();
  if (u.rol === "admin" || u.cliente_id === clienteId) return u;
  redirect("/portal");
}
