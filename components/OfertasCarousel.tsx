"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Package, Flame } from "lucide-react";

export interface OfertaProducto {
  id: string;
  nombre: string;
  imagenUrl?: string | null;
  precioPaquete: number;
  descuento: number;
}

export default function OfertasCarousel({ productos }: { productos: OfertaProducto[] }) {
  const [indice, setIndice] = useState(0);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (pausado || productos.length <= 1) return;
    const timer = setInterval(() => {
      setIndice((i) => (i + 1) % productos.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [pausado, productos.length]);

  if (productos.length === 0) return null;

  const actual = productos[indice];

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-5 w-5 text-amber-500" />
        <h2 className="text-xl font-bold">Ofertas por volumen</h2>
      </div>

      <div
        className="card relative overflow-hidden"
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <Link
          href={`/producto/${actual.id}`}
          className="flex flex-col items-center gap-6 p-6 sm:flex-row sm:p-8"
        >
          <div className="relative h-40 w-40 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
            {actual.imagenUrl ? (
              <Image src={actual.imagenUrl} alt={actual.nombre} fill className="object-cover transition-all duration-500" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">
                <Package className="h-16 w-16" />
              </div>
            )}
            <span className="badge absolute left-2 top-2 bg-amber-500 text-white">
              -{actual.descuento}%
            </span>
          </div>

          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400">
              Oferta por volumen
            </p>
            <h3 className="mt-1 text-xl font-bold">{actual.nombre}</h3>
            <p className="mt-2 text-2xl font-black text-brand-700 dark:text-brand-400">
              desde ${actual.precioPaquete.toFixed(0)}
            </p>
            <span className="btn-primary mt-4 inline-flex">Ver producto</span>
          </div>
        </Link>

        {productos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIndice((i) => (i - 1 + productos.length) % productos.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-card hover:bg-white dark:bg-slate-800/90"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIndice((i) => (i + 1) % productos.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow-card hover:bg-white dark:bg-slate-800/90"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <div className="flex justify-center gap-1.5 pb-4">
              {productos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndice(i)}
                  className={`h-1.5 rounded-full transition-all ${
                    i === indice ? "w-6 bg-brand-600" : "w-1.5 bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
