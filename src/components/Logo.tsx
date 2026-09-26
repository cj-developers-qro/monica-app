/** Marca de la app: corazón con una línea de pulso, en el recuadro blanco de la barra rosa. */
export function Logo({ className = "logo-marca" }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20.5s-7.5-4.6-9.2-9.4C1.6 7.7 3.8 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.3 0 5.5 3.2 4.3 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" fill="currentColor" fillOpacity={0.12} />
        <path d="M5 12h3.5l1.5-3 2.5 6 1.8-3.5H19" />
      </svg>
    </span>
  );
}

export const NOMBRE_APP = "Monica App";
export const LEMA_APP = "Entrenamiento y nutrición";
