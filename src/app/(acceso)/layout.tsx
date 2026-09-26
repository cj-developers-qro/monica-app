import { IconoMoniFit, LEMA_APP, NombreMoniFit } from "@/components/Logo";

// Marco de las pantallas de acceso: fondo degradado rosa y tarjeta blanca centrada.
export default function LayoutAcceso({ children }: LayoutProps<"/">) {
  return (
    <div className="fondo-acceso flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <IconoMoniFit className="size-20 drop-shadow-lg" />
        <h1 className="mt-4">
          <NombreMoniFit className="text-4xl" />
        </h1>
        <p className="mt-1 text-sm text-pink-700">{LEMA_APP}</p>
      </div>
      <div className="tarjeta w-full max-w-md p-6 sm:p-8">{children}</div>
      <p className="mt-6 text-xs text-slate-400">Tus datos de salud son privados: solo tú y Moni pueden verlos.</p>
    </div>
  );
}
