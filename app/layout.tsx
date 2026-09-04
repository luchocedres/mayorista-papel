import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import ThemeInit from "@/components/ThemeInit";
import WhatsAppFloatingButton from "@/components/WhatsAppFloatingButton";

export const metadata: Metadata = {
  title: "New Pel Mayorista | Papel y Limpieza para Comercios",
  description:
    "Plataforma B2B de venta mayorista de papel higiénico, rollos de cocina y productos de limpieza. Marca destacada New Pel.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeInit />
        <Navbar />
        <main className="min-h-[calc(100vh-64px)]">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <p>© {new Date().getFullYear()} Distribuidora Mayorista — Marca destacada New Pel.</p>
          <p className="mt-1">Desarrollado por Luvox | Soluciones Web</p>
        </footer>
        <WhatsAppFloatingButton />
      </body>
    </html>
  );
}
