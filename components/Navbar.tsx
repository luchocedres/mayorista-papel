"use client";

import Link from "next/link";
import { ShoppingCart, Moon, Sun, User, Menu, X } from "lucide-react";
import { useState } from "react";
import SearchBar from "./SearchBar";
import { useCartStore } from "@/store/cartStore";
import { toggleTheme } from "./ThemeInit";

export default function Navbar() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const cantidadItems = useCartStore((s) => s.cantidadItems());

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="flex flex-shrink-0 items-center gap-2 font-extrabold text-lg tracking-tight">
          <span className="rounded-lg bg-brand-600 px-2 py-1 text-white">NP</span>
          <span className="hidden sm:inline">Mayorista</span>
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="/catalogo" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            Catálogo
          </Link>
          <Link href="/cuenta" className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
            <User className="h-4 w-4" /> Mi cuenta
          </Link>
          <button
            onClick={toggleTheme}
            aria-label="Cambiar tema"
            className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Sun className="h-4 w-4 dark:hidden" />
            <Moon className="hidden h-4 w-4 dark:block" />
          </button>
          <Link href="/carrito" className="relative rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-slate-800">
            <ShoppingCart className="h-5 w-5" />
            {cantidadItems > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                {cantidadItems}
              </span>
            )}
          </Link>
        </nav>

        <button className="ml-auto md:hidden" onClick={() => setMenuAbierto((v) => !v)}>
          {menuAbierto ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {menuAbierto && (
        <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 md:hidden">
          <SearchBar compact />
          <div className="mt-3 flex flex-col gap-1">
            <Link href="/catalogo" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Catálogo</Link>
            <Link href="/cuenta" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">Mi cuenta</Link>
            <Link href="/carrito" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              Carrito {cantidadItems > 0 && `(${cantidadItems})`}
            </Link>
            <button onClick={toggleTheme} className="rounded-lg px-3 py-2 text-left text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              Cambiar tema claro/oscuro
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
