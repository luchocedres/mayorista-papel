"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function LogoutButton() {
  const router = useRouter();
  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      onClick={cerrarSesion}
      className="mt-2 flex items-center gap-2 rounded-lg border-t border-slate-200 px-3 py-2 pt-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:text-red-400 dark:hover:bg-red-900/20"
    >
      <LogOut className="h-4 w-4" /> Cerrar sesión
    </button>
  );
}
