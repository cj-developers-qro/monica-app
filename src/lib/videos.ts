// Enlace para ver cómo se hace un ejercicio: el video que eligió Moni o, si no hay, una búsqueda
// en YouTube con el nombre del ejercicio (siempre funciona y no depende de enlaces que caduquen).
export function enlaceVideo(ejercicio: { nombre: string; video_url?: string | null }) {
  if (ejercicio.video_url) return { url: ejercicio.video_url, propio: true };
  const busqueda = encodeURIComponent(`${ejercicio.nombre} técnica correcta`);
  return { url: `https://www.youtube.com/results?search_query=${busqueda}`, propio: false };
}

/** Acepta solo enlaces http(s) válidos; devuelve null si está vacío. */
export function normalizarVideo(texto: string): { url: string | null } | { error: string } {
  const t = texto.trim();
  if (!t) return { url: null };
  try {
    const u = new URL(t);
    if (u.protocol !== "https:" && u.protocol !== "http:") throw new Error();
    return { url: u.toString() };
  } catch {
    return { error: "El video debe ser un enlace completo, por ejemplo https://www.youtube.com/watch?v=…" };
  }
}
