import { Logo, LEMA_APP, NOMBRE_APP } from "@/components/Logo";

// Marco de las pantallas de acceso: fondo degradado rosa y tarjeta blanca centrada.
export default function LayoutAcceso({ children }: LayoutProps<"/">) {
  return (
    <div className="fondo-acceso flex flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex flex-col items-center text-center">
        <Logo className="inline-flex size-16 items-center justify-center rounded-3xl bg-gradient-to-br from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-300/50 [&>svg]:size-9" />
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900">{NOMBRE_APP}</h1>
        <p className="mt-1 text-sm text-pink-700">{LEMA_APP}</p>
      </div>
      <div className="tarjeta w-full max-w-md p-6 sm:p-8">{children}</div>
      <p className="mt-6 text-xs text-slate-400">Tus datos de salud son privados: solo tú y Moni pueden verlos.</p>
    </div>
  );
}
