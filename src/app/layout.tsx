import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Navegacion } from "@/components/Navegacion";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "App Deportiva", template: "%s · App Deportiva" },
  description: "Seguimiento de clientes: perfil clínico, mediciones, composición corporal, recomposición y rutinas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans md:flex-row">
        <aside className="flex shrink-0 print:hidden flex-col gap-4 bg-slate-900 px-4 py-4 md:sticky md:top-0 md:h-screen md:w-56 md:py-6">
          <Link href="/" className="px-3 text-lg font-bold tracking-tight text-white">
            App <span className="text-emerald-400">Deportiva</span>
          </Link>
          <Navegacion />
        </aside>
        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </body>
    </html>
  );
}
