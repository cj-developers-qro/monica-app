// Crea la cuenta de la administradora o le asigna una nueva contraseña temporal.
//
//   npm run admin -- <correo> [nombre]
//
// La contraseña temporal se muestra una sola vez y se pide cambiarla en el primer ingreso.
// Usa los mismos módulos que la app: base de datos (esquema y migraciones) y cifrado scrypt.
import { cifrarContrasena, contrasenaTemporal } from "@/lib/contrasenas";
import { db } from "@/lib/db";

const [correo, ...resto] = process.argv.slice(2);
const nombre = resto.join(" ").trim() || "Moni";
if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
  console.error("Uso: npm run admin -- <correo> [nombre]");
  process.exit(1);
}
const usuario = correo.trim().toLowerCase();
const temporal = contrasenaTemporal();
const hash = cifrarContrasena(temporal);

const existente = db().prepare("SELECT id, rol FROM usuarios WHERE usuario = ?").get(usuario) as { id: number; rol: string } | undefined;
if (existente && existente.rol !== "admin") {
  console.error(`El correo ${usuario} ya pertenece a un cliente; usa otro correo para la administradora.`);
  process.exit(1);
}
if (existente) {
  db()
    .prepare("UPDATE usuarios SET hash = ?, nombre = ?, debe_cambiar = 1, activo = 1, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?")
    .run(hash, nombre, existente.id);
  db().prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(existente.id);
  console.log(`Se restableció la contraseña de ${nombre} (${usuario}).`);
} else {
  db().prepare("INSERT INTO usuarios (usuario, nombre, rol, hash, debe_cambiar) VALUES (?, ?, 'admin', ?, 1)").run(usuario, nombre, hash);
  console.log(`Se creó la cuenta de administradora de ${nombre} (${usuario}).`);
}
console.log(`\n  Contraseña temporal:  ${temporal}\n\nAl entrar por primera vez la aplicación pedirá cambiarla.`);
