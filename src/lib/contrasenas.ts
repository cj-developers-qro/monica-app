// Cifrado y generación de contraseñas. Sin dependencias de Next.js para poder usarlo también
// desde los scripts (scripts/datos-demo.mts).
import { randomBytes, randomInt, scryptSync, timingSafeEqual } from "node:crypto";

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
