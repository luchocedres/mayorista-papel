"use client";

import Image from "next/image";
import { useState } from "react";
import { Package, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import BultoPalletCalculator from "@/components/BultoPalletCalculator";
import ProductCard, { type ProductoCard } from "@/components/ProductCard";
import { useCartStore, type ProductoCarrito } from "@/store/cartStore";
import type { Presentacion } from "@/lib/pricing";
import Link from "next/link";

interface ProductoLink {
  id: string;
  nombre: string;
}

export default function ProductoClient({
  producto,
  galeria,
  marcaNombre,
  categoriaNombre,
  anterior,
  siguiente,
  recomendados,
}: {
  producto: ProductoCarrito & { descripcion?: string | null };
  galeria: string[];
  marcaNombre: string;
  categoriaNombre: string;
  anterior: ProductoLink | null;
  siguiente: ProductoLink | null;
  recomendados: ProductoCard[];
}) {
  const agregarItem = useCartStore((s) => s.agregarItem);
  const [agregado, setAgregado] = useState(false);
  const [fotoActiva, setFotoActiva] = useState(0);

  function handleConfirmar(presentacion: Presentacion, cantidad: number) {
    agregarItem(producto, presentacion, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2500);
  }

  const fotos = galeria.length > 0 ? galeria : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Navegación anterior / siguiente dentro de la categoría */}
      {(anterior || siguiente) && (
        <div className="mb-4 flex items-center justify-between text-sm">
          {anterior ? (
            <Link href={`/producto/${anterior.id}`} className="flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
              <ChevronLeft className="h-4 w-4" /> {anterior.nombre}
            </Link>
          ) : <span />}
          {siguiente ? (
            <Link href={`/producto/${siguiente.id}`} className="flex items-center gap-1 font-medium text-brand-600 hover:underline dark:text-brand-400">
              {siguiente.nombre} <ChevronRight className="h-4 w-4" />
            </Link>
          ) : <span />}
        </div>
      )}

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
            {fotos.length > 0 ? (
              <Image src={fotos[fotoActiva]} alt={producto.nombre} fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-slate-300">
                <Package className="h-24 w-24" />
              </div>
            )}
          </div>

          {fotos.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {fotos.map((url, i) => (
                <button
                  key={i}
                  onClick={() => setFotoActiva(i)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === fotoActiva ? "border-brand-600" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={url} alt={`${producto.nombre} ${i + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-600 dark:text-brand-400">
            {marcaNombre} · {categoriaNombre}
          </p>
          <h1 className="mt-1 text-2xl font-bold md:text-3xl">{producto.nombre}</h1>
          {producto.descripcion && (
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">{producto.descripcion}</p>
          )}

          <div className="mt-3 text-sm">
            {producto.stockPaquetes > 0 ? (
              <span className="badge bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                Stock disponible ({producto.stockPaquetes} paquetes)
              </span>
            ) : (
              <span className="badge bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
                Sin stock
              </span>
            )}
          </div>

          <div className="mt-6">
            <BultoPalletCalculator producto={producto} onConfirmar={handleConfirmar} />
          </div>

          {agregado && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4" />
              Agregado al carrito.{" "}
              <Link href="/carrito" className="underline">
                Ver carrito
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* También te recomendamos */}
      {recomendados.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 text-xl font-bold">También te recomendamos</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {recomendados.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
