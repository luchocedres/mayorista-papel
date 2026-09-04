"use client";

import { useMemo, useState } from "react";
import { aPaquetes, precioUnitario, textoConversion, type Presentacion } from "@/lib/pricing";
import type { ProductoCarrito } from "@/store/cartStore";
import { Boxes, Package, Layers } from "lucide-react";

const OPCIONES: { key: Presentacion; label: string; icon: any }[] = [
  { key: "PAQUETE", label: "Paquete", icon: Package },
  { key: "BULTO_CERRADO", label: "Bulto cerrado", icon: Boxes },
  { key: "PALLET_COMPLETO", label: "Pallet completo", icon: Layers },
];

export default function BultoPalletCalculator({
  producto,
  onConfirmar,
}: {
  producto: ProductoCarrito;
  onConfirmar: (presentacion: Presentacion, cantidad: number) => void;
}) {
  const [presentacion, setPresentacion] = useState<Presentacion>("PAQUETE");
  const [cantidad, setCantidad] = useState(producto.minimoCompraPaquetes || 1);

  const paquetesEquivalentes = useMemo(
    () => aPaquetes(producto, presentacion, cantidad),
    [producto, presentacion, cantidad]
  );
  const precio = useMemo(() => precioUnitario(producto, presentacion), [producto, presentacion]);
  const conversion = textoConversion(producto);
  const cumpleMinimo = paquetesEquivalentes >= producto.minimoCompraPaquetes;

  return (
    <div className="card p-4">
      <p className="mb-2 text-sm font-semibold">Elegí presentación de compra</p>
      <div className="grid grid-cols-3 gap-2">
        {OPCIONES.map((op) => {
          const Icon = op.icon;
          const activo = presentacion === op.key;
          return (
            <button
              key={op.key}
              onClick={() => {
                setPresentacion(op.key);
                setCantidad(1);
              }}
              className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-3 text-xs font-medium transition ${
                activo
                  ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300"
                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              }`}
            >
              <Icon className="h-5 w-5" />
              {op.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <label className="label mb-0">Cantidad</label>
        <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700">
          <button
            className="px-3 py-1.5 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setCantidad((c) => Math.max(1, c - 1))}
          >
            −
          </button>
          <input
            type="number"
            min={1}
            value={cantidad}
            onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
            className="w-16 border-x border-slate-300 bg-transparent py-1.5 text-center outline-none dark:border-slate-700"
          />
          <button
            className="px-3 py-1.5 text-lg font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            onClick={() => setCantidad((c) => c + 1)}
          >
            +
          </button>
        </div>
      </div>

      {/* Info de conversión automática */}
      <div className="mt-3 space-y-0.5 rounded-lg bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
        <p>{conversion.bultoEnPaquetes}</p>
        <p>{conversion.palletEnBultos}</p>
        <p>{conversion.palletEnPaquetes}</p>
        <p className="mt-1 font-semibold text-slate-800 dark:text-slate-100">
          Tu selección equivale a {paquetesEquivalentes} paquetes.
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-2xl font-bold text-brand-700 dark:text-brand-400">
            ${(precio * cantidad).toFixed(0)}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">${precio.toFixed(2)} c/u</p>
        </div>
        <button
          className="btn-primary"
          disabled={!cumpleMinimo}
          onClick={() => onConfirmar(presentacion, cantidad)}
        >
          Agregar al carrito
        </button>
      </div>
      {!cumpleMinimo && (
        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
          El mínimo de compra para este producto es {producto.minimoCompraPaquetes} paquetes.
        </p>
      )}
    </div>
  );
}
