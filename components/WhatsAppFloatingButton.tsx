"use client";

import { usePathname } from "next/navigation";
import { linkWhatsApp } from "@/lib/whatsapp";

const MENSAJE_CONSULTA = "Hola! Estoy viendo el catálogo y tengo una consulta.";

export default function WhatsAppFloatingButton() {
  const pathname = usePathname();

  // No lo mostramos dentro del panel de administración
  if (pathname?.startsWith("/admin")) return null;

  return (
    <a
      href={linkWhatsApp(MENSAJE_CONSULTA)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Consultanos por WhatsApp"
      className="group fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-transform hover:scale-110 active:scale-95 sm:bottom-6 sm:right-6"
    >
      {/* Ping sutil para llamar la atención sin ser molesto */}
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#25D366] opacity-30" />

      <svg viewBox="0 0 32 32" className="relative h-7 w-7 fill-white">
        <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.36.687 4.56 1.875 6.41L4 29l7.79-1.84A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3zm0 21.8c-1.94 0-3.79-.5-5.4-1.44l-.39-.23-4.62 1.09 1.11-4.5-.25-.41A9.77 9.77 0 0 1 5.2 15c0-5.96 4.85-10.8 10.8-10.8S26.8 9.04 26.8 15 21.96 24.8 16.004 24.8zm5.98-8.1c-.33-.17-1.94-.96-2.24-1.07-.3-.11-.52-.17-.74.17-.22.33-.85 1.07-1.04 1.29-.19.22-.38.24-.71.08-.33-.17-1.38-.51-2.63-1.63-.97-.86-1.63-1.93-1.82-2.26-.19-.33-.02-.5.14-.67.15-.15.33-.38.5-.58.17-.19.22-.33.33-.55.11-.22.06-.41-.03-.58-.08-.17-.74-1.79-1.02-2.45-.27-.65-.54-.56-.74-.57h-.63c-.22 0-.58.08-.88.41-.3.33-1.15 1.13-1.15 2.75s1.18 3.19 1.34 3.41c.17.22 2.32 3.54 5.62 4.96.79.34 1.4.54 1.88.69.79.25 1.51.22 2.08.13.63-.1 1.94-.79 2.22-1.56.27-.77.27-1.43.19-1.56-.08-.13-.3-.22-.63-.38z" />
      </svg>
    </a>
  );
}
