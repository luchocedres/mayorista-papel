"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import Image from "next/image";

interface Sugerencia {
  id: string;
  nombre: string;
  imagenUrl?: string | null;
  precioPaquete: number;
  marca: string;
}

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [resultados, setResultados] = useState<Sugerencia[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [cargando, setCargando] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Debounce de la búsqueda en tiempo real
  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      return;
    }
    setCargando(true);
    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResultados(data.productos || []);
        setAbierto(true);
      } finally {
        setCargando(false);
      }
    }, 220); // debounce corto -> se siente instantáneo
    return () => clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function irACatalogoConBusqueda() {
    if (query.trim()) router.push(`/catalogo?q=${encodeURIComponent(query)}`);
    setAbierto(false);
  }

  return (
    <div ref={wrapperRef} className={`relative ${compact ? "w-full" : "w-full max-w-xl"}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          className="input pl-9 pr-9"
          placeholder='Buscar producto, ej: "New Pel 100m"...'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => resultados.length > 0 && setAbierto(true)}
          onKeyDown={(e) => e.key === "Enter" && irACatalogoConBusqueda()}
        />
        {cargando && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
      </div>

      {abierto && resultados.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-cardHover dark:border-slate-700 dark:bg-slate-900">
          {resultados.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                router.push(`/producto/${p.id}`);
                setAbierto(false);
                setQuery("");
              }}
              className="flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2 text-left transition last:border-none hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                {p.imagenUrl && (
                  <Image src={p.imagenUrl} alt={p.nombre} fill sizes="40px" className="object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{p.nombre}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{p.marca}</p>
              </div>
              <span className="flex-shrink-0 text-sm font-semibold text-brand-600 dark:text-brand-400">
                ${p.precioPaquete.toFixed(0)}
              </span>
            </button>
          ))}
          <button
            onClick={irACatalogoConBusqueda}
            className="w-full bg-slate-50 px-3 py-2 text-center text-xs font-semibold text-brand-600 hover:underline dark:bg-slate-800 dark:text-brand-400"
          >
            Ver todos los resultados para "{query}"
          </button>
        </div>
      )}
    </div>
  );
}
