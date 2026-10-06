// Utilidades para leer FormData en las acciones del servidor.

/** Resultado de una acción de formulario: error a mostrar, o éxito con un mensaje opcional. */
export type EstadoFormulario = { error?: string; ok?: boolean; mensaje?: string; secreto?: string } | undefined;

export function texto(fd: FormData, clave: string): string {
  const v = fd.get(clave);
  return typeof v === "string" ? v.trim() : "";
}

export function numero(fd: FormData, clave: string): number | null {
  const v = texto(fd, clave).replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function entero(fd: FormData, clave: string, porDefecto: number): number {
  const n = numero(fd, clave);
  return n == null ? porDefecto : Math.round(n);
}

export function fecha(fd: FormData, clave: string): string {
  const v = texto(fd, clave);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : hoy();
}

export function hoy() {
  const d = new Date();
  const z = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
}

/** Posición de un alimento en el plan (semana, día, comida y alimento) desde la URL. */
export function ubicacionDeConsulta(q: Record<string, string | string[] | undefined>) {
  const n = (clave: string) => {
    const v = Number(q[clave]);
    return Number.isInteger(v) && v >= 0 ? v : -1;
  };
  return { semana: n("s"), dia: n("d"), comida: n("c"), item: n("i") };
}
