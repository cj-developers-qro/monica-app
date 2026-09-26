"use server";

import { revalidatePath } from "next/cache";
import { cifrarContrasena, contrasenaTemporal, normalizarUsuario, requerirAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { entero, texto, type EstadoFormulario } from "@/lib/formulario";

// Gestión del acceso de cada cliente a su portal. Solo la administradora.
// El cliente llega en el campo oculto `cliente_id` (el panel usa useActionState, que necesita acciones estables).

const CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function crearAcceso(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const clienteId = entero(fd, "cliente_id", 0);
  const usuario = normalizarUsuario(texto(fd, "usuario"));
  if (!CORREO.test(usuario)) return { error: "Escribe un correo electrónico válido." };
  const cliente = db().prepare("SELECT nombre FROM clientes WHERE id = ?").get(clienteId) as { nombre: string } | undefined;
  if (!cliente) return { error: "El cliente no existe." };
  if (db().prepare("SELECT 1 FROM usuarios WHERE usuario = ?").get(usuario)) return { error: "Ese correo ya tiene una cuenta." };
  if (db().prepare("SELECT 1 FROM usuarios WHERE cliente_id = ?").get(clienteId)) return { error: "Este cliente ya tiene acceso." };

  const temporal = contrasenaTemporal();
  db()
    .prepare("INSERT INTO usuarios (usuario, nombre, rol, cliente_id, hash, debe_cambiar) VALUES (?, ?, 'cliente', ?, ?, 1)")
    .run(usuario, cliente.nombre, clienteId, cifrarContrasena(temporal));
  revalidatePath("/", "layout");
  return { ok: true, mensaje: `Acceso creado. Comparte con ${cliente.nombre.split(" ")[0]} su correo y esta contraseña temporal:`, secreto: temporal };
}

export async function restablecerAcceso(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const clienteId = entero(fd, "cliente_id", 0);
  const u = db().prepare("SELECT id FROM usuarios WHERE cliente_id = ?").get(clienteId) as { id: number } | undefined;
  if (!u) return { error: "Este cliente no tiene acceso." };
  const temporal = contrasenaTemporal();
  db()
    .prepare("UPDATE usuarios SET hash = ?, debe_cambiar = 1, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?")
    .run(cifrarContrasena(temporal), u.id);
  db().prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(u.id);
  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Nueva contraseña temporal (la anterior dejó de funcionar):", secreto: temporal };
}

export async function cambiarEstadoAcceso(clienteId: number, activo: boolean): Promise<void> {
  await requerirAdmin();
  const u = db().prepare("SELECT id FROM usuarios WHERE cliente_id = ?").get(clienteId) as { id: number } | undefined;
  if (!u) return;
  db().prepare("UPDATE usuarios SET activo = ? WHERE id = ?").run(activo ? 1 : 0, u.id);
  if (!activo) db().prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(u.id);
  revalidatePath("/", "layout");
}

export async function cambiarCorreoAcceso(_estado: EstadoFormulario, fd: FormData): Promise<EstadoFormulario> {
  await requerirAdmin();
  const clienteId = entero(fd, "cliente_id", 0);
  const usuario = normalizarUsuario(texto(fd, "usuario"));
  if (!CORREO.test(usuario)) return { error: "Escribe un correo electrónico válido." };
  const otro = db().prepare("SELECT cliente_id FROM usuarios WHERE usuario = ?").get(usuario) as { cliente_id: number | null } | undefined;
  if (otro && otro.cliente_id !== clienteId) return { error: "Ese correo ya tiene una cuenta." };
  db().prepare("UPDATE usuarios SET usuario = ? WHERE cliente_id = ?").run(usuario, clienteId);
  revalidatePath("/", "layout");
  return { ok: true, mensaje: "Correo de acceso actualizado." };
}
