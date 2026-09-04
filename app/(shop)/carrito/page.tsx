"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Trash2, Package, ShoppingCart } from "lucide-react";
import { useCartStore, paquetesEquivalentes } from "@/store/cartStore";
import { precioUnitario, validarMinimoCarrito, type Presentacion } from "@/lib/pricing";
import PdfPresupuestoButton from "@/components/PdfPresupuestoButton";
import WhatsAppCheckoutButton from "@/components/WhatsAppCheckoutButton";

const labelPresentacion: Record<string, string> = {
  PAQUETE: "Paquete",
  BULTO_CERRADO: "Bulto cerrado",
  PALLET_COMPLETO: "Pallet completo",
};

interface Usuario {
  id: string;
  nombreComercio: string;
  direccion: string;
}

export default function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const actualizarCantidad = useCartStore((s) => s.actualizarCantidad);
  const quitarItem = useCartStore((s) => s.quitarItem);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [direccionEntrega, setDireccionEntrega] = useState("");
  const [cargandoUsuario, setCargandoUsuario] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUsuario(d.usuario);
        if (d.usuario?.direccion) setDireccionEntrega(d.usuario.direccion);
      })
      .finally(() => setCargandoUsuario(false));
  }, []);

  const lineasParaValidar = items.map((it) => ({
    productoNombre: it.producto.nombre,
    minimoCompraPaquetes: it.producto.minimoCompraPaquetes,
    cantidadPaquetesEquivalente: paquetesEquivalentes(it),
  }));
  const { valido, errores } = validarMinimoCarrito(lineasParaValidar);

  const total = items.reduce(
    (acc, it) => acc + precioUnitario(it.producto, it.presentacion) * it.cantidad,
    0
  );

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-slate-300" />
        <h1 className="mt-4 text-xl font-bold">Tu carrito está vacío</h1>
        <p className="mt-1 text-sm text-slate-500">Sumá productos desde el catálogo para armar tu pedido.</p>
        <Link href="/catalogo" className="btn-primary mt-6 inline-flex">
          Ir al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Tu carrito</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LISTA DE ITEMS */}
        <div className="space-y-3 lg:col-span-2">
          {items.map((it) => {
            const pEquiv = paquetesEquivalentes(it);
            const cumple = pEquiv >= it.producto.minimoCompraPaquetes;
            const precio = precioUnitario(it.producto, it.presentacion);
            return (
              <div key={`${it.producto.id}-${it.presentacion}`} className="card flex gap-3 p-3">
                <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                  {it.producto.imagenUrl ? (
                    <Image src={it.producto.imagenUrl} alt={it.producto.nombre} fill className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Package className="h-8 w-8" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold">{it.producto.nombre}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {labelPresentacion[it.presentacion]} · equivale a {pEquiv} paquetes
                      </p>
                    </div>
                    <button
                      onClick={() => quitarItem(it.producto.id, it.presentacion)}
                      className="text-slate-400 hover:text-red-500"
                      aria-label="Quitar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-700">
                      <button
                        className="px-2 py-0.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() =>
                          actualizarCantidad(it.producto.id, it.presentacion, Math.max(0, it.cantidad - 1))
                        }
                      >
                        −
                      </button>
                      <span className="w-10 text-center text-sm">{it.cantidad}</span>
                      <button
                        className="px-2 py-0.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={() =>
                          actualizarCantidad(it.producto.id, it.presentacion, it.cantidad + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <p className="font-bold text-brand-700 dark:text-brand-400">
                      ${(precio * it.cantidad).toFixed(0)}
                    </p>
                  </div>

                  {!cumple && (
                    <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                      Mínimo {it.producto.minimoCompraPaquetes} paquetes para este producto.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RESUMEN */}
        <div className="card h-fit space-y-4 p-5">
          <h2 className="font-bold">Resumen del pedido</h2>

          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
            <span className="font-semibold">${total.toFixed(0)}</span>
          </div>
          <div className="flex justify-between border-t border-slate-200 pt-3 text-lg font-bold dark:border-slate-700">
            <span>Total</span>
            <span className="text-brand-700 dark:text-brand-400">${total.toFixed(0)}</span>
          </div>

          <div>
            <label className="label">Dirección de entrega</label>
            <textarea
              className="input"
              rows={2}
              value={direccionEntrega}
              onChange={(e) => setDireccionEntrega(e.target.value)}
              placeholder="Calle, número, ciudad..."
            />
          </div>

          {!valido && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {errores.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          {!usuario && !cargandoUsuario && (
            <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
              Necesitás{" "}
              <Link href="/login" className="font-semibold underline">
                iniciar sesión
              </Link>{" "}
              para finalizar el pedido.
            </div>
          )}

          <PdfPresupuestoButton
            items={items}
            nombreComercio={usuario?.nombreComercio}
            direccion={direccionEntrega}
          />

          <WhatsAppCheckoutButton
            items={items}
            nombreComercio={usuario?.nombreComercio || "Comercio"}
            direccionEntrega={direccionEntrega}
            disabled={!valido || !usuario || !direccionEntrega.trim()}
          />
        </div>
      </div>
    </div>
  );
}
