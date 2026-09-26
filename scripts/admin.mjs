// Crea la cuenta de la administradora o le asigna una nueva contraseña temporal.
//
//   npm run admin -- <correo> [nombre]
//
// La contraseña temporal se muestra una sola vez y se pide cambiarla en el primer ingreso.
// En la base de datos solo se guarda su hash (scrypt), con el mismo formato que usa la app.
import { mkdirSync, readFileSync } from "node:fs";
import { randomBytes, randomInt, scryptSync } from "node:crypto";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const [correo, ...resto] = process.argv.slice(2);
const nombre = resto.join(" ").trim() || "Moni";
if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
  console.error("Uso: npm run admin -- <correo> [nombre]");
  process.exit(1);
}
const usuario = correo.trim().toLowerCase();

const directorio = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
mkdirSync(path.join(directorio, "imagenes"), { recursive: true });
const db = new DatabaseSync(path.join(directorio, "app-deportiva.db"), { timeout: 5000 });
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;");
db.exec(readFileSync(path.join(process.cwd(), "src", "lib", "esquema.sql"), "utf8"));

const PALABRAS = ["rosa", "mango", "fresa", "luna", "sol", "brisa", "coral", "menta", "perla", "nube", "palma", "lima", "flor", "miel", "cielo", "roble"];
const p = () => PALABRAS[randomInt(PALABRAS.length)];
const temporal = `${p()}-${p()}-${randomInt(1000, 10000)}`;
const sal = randomBytes(16);
const hash = `scrypt$${sal.toString("base64")}$${scryptSync(temporal, sal, 64).toString("base64")}`;

const existente = db.prepare("SELECT id, rol FROM usuarios WHERE usuario = ?").get(usuario);
if (existente && existente.rol !== "admin") {
  console.error(`El correo ${usuario} ya pertenece a un cliente; usa otro correo para la administradora.`);
  process.exit(1);
}
if (existente) {
  db.prepare(
    "UPDATE usuarios SET hash = ?, nombre = ?, debe_cambiar = 1, activo = 1, intentos_fallidos = 0, bloqueado_hasta = NULL WHERE id = ?",
  ).run(hash, nombre, existente.id);
  db.prepare("DELETE FROM sesiones WHERE usuario_id = ?").run(existente.id);
  console.log(`Se restableció la contraseña de ${nombre} (${usuario}).`);
} else {
  db.prepare("INSERT INTO usuarios (usuario, nombre, rol, hash, debe_cambiar) VALUES (?, ?, 'admin', ?, 1)").run(usuario, nombre, hash);
  console.log(`Se creó la cuenta de administradora de ${nombre} (${usuario}).`);
}
console.log(`\n  Contraseña temporal:  ${temporal}\n\nAl entrar por primera vez la aplicación pedirá cambiarla.`);
