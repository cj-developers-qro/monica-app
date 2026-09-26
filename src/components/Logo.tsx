// Identidad de MoniFit: una "M" trazada como línea de pulso (entrenamiento) con una hoja
// (nutrición), sobre un cuadro redondeado. La misma figura se usa en app/icon.svg.

export const NOMBRE_APP = "MoniFit";
export const LEMA_APP = "Entrenamiento y nutrición";

const PULSO = "M11 40h7l5.5-17 8.5 15 8.5-15L46 40h7";
const HOJA = "M44.5 17.5c0-5.8 4.2-9.5 10.5-9.5 0 6.3-3.7 10.5-10.5 9.5z";
const NERVIO = "M44.5 17.5c2-2.6 4.6-4.6 7.5-6";

/**
 * Ícono de MoniFit.
 * - `degradado`: cuadro rosa con la figura en blanco (fondos claros: login, exportación).
 * - `blanco`: cuadro blanco con la figura en rosa (sobre la barra rosa).
 */
export function IconoMoniFit({ variante = "degradado", className = "size-10" }: { variante?: "degradado" | "blanco"; className?: string }) {
  const id = `monifit-${variante}`;
  const tinta = variante === "degradado" ? "#ffffff" : `url(#${id})`;
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 drop-shadow-sm ${className}`} aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f472b6" />
          <stop offset="0.55" stopColor="#ec4899" />
          <stop offset="1" stopColor="#e11d48" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="16" fill={variante === "degradado" ? `url(#${id})` : "#ffffff"} />
      <path d={PULSO} fill="none" stroke={tinta} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      <path d={HOJA} fill={tinta} />
      <path d={NERVIO} fill="none" stroke={variante === "degradado" ? "#ec4899" : "#ffffff"} strokeWidth={1.3} strokeLinecap="round" />
    </svg>
  );
}

/** Nombre "MoniFit" con la tipografía de la marca: "Fit" en cursiva y rosa. */
export function NombreMoniFit({ tono = "oscuro", className = "text-lg" }: { tono?: "oscuro" | "claro"; className?: string }) {
  return (
    <span className={`font-marca font-extrabold tracking-tight ${tono === "claro" ? "text-white" : "text-slate-900"} ${className}`}>
      Moni
      <span className={`font-bold italic ${tono === "claro" ? "text-pink-100" : "texto-degradado"}`}>Fit</span>
    </span>
  );
}

/** Ícono + nombre + lema, para la barra rosa del panel y del portal. */
export function MarcaEnBarra() {
  return (
    <span className="flex items-center gap-3">
      <IconoMoniFit variante="blanco" className="size-11" />
      <span className="leading-tight">
        <NombreMoniFit tono="claro" className="block text-xl" />
        <span className="block text-xs text-pink-100">{LEMA_APP}</span>
      </span>
    </span>
  );
}
