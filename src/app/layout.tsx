import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import { LEMA_APP, NOMBRE_APP } from "@/components/Logo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
// Tipografía del nombre "MoniFit".
const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["700", "800"], style: ["normal", "italic"] });

export const metadata: Metadata = {
  title: { default: NOMBRE_APP, template: `%s · ${NOMBRE_APP}` },
  description: `${NOMBRE_APP} · ${LEMA_APP}: seguimiento de clientes con rutinas, composición corporal y plan nutricional.`,
  appleWebApp: { title: NOMBRE_APP },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
