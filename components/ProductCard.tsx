"use client";

import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";

export interface ProductoCard {
  id: string;
  nombre: string;
  imagenUrl?: string | null;
  marca: string;
  categoria: string;
  presentacion: string;
  precioPaquete: number;
  descuentoBultoPct?: number | null;
  descuentoPalletPct?: number | null;
  minimoCompraPaquetes: number;
}

export default function ProductCard({ p }: { p: ProductoCard }) {
  const mejorDescuento = Math.max(p.descuentoBultoPct || 0, p.descuentoPalletPct || 0);

  return (
    <Link href={`/producto/${p.id}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {p.imagenUrl ? (
          <Image
            src={p.imagenUrl}
            alt={p.nombre}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <Package className="h-12 w-12" />
          </div>
        )}
        {mejorDescuento > 0 && (
          <span className="badge absolute left-2 top-2 bg-amber-500 text-white">
            -{mejorDescuento}% por volumen
          </span>
        )}
        <span className="badge absolute right-2 top-2 bg-slate-900/80 text-white backdrop-blur">
          {p.marca}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{p.categoria}</p>
        <h3 className="line-clamp-2 text-sm font-semibold">{p.nombre}</h3>
        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-lg font-bold text-brand-700 dark:text-brand-400">
              ${p.precioPaquete.toFixed(0)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">por paquete</p>
          </div>
          <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
            Mín. {p.minimoCompraPaquetes} paq.
          </span>
        </div>
      </div>
    </Link>
  );
}
