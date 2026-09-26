import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { LEMA_APP, NOMBRE_APP } from "@/components/Logo";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: NOMBRE_APP, template: `%s · ${NOMBRE_APP}` },
  description: `${LEMA_APP}: seguimiento de clientes con rutinas, composición corporal y plan nutricional.`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
