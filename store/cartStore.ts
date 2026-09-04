"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { aPaquetes, precioUnitario, type Presentacion } from "@/lib/pricing";

export interface ProductoCarrito {
  id: string;
  nombre: string;
  imagenUrl?: string | null;
  precioPaquete: number;
  precioBulto?: number | null;
  precioPallet?: number | null;
  paquetesPorBulto: number;
  bultosPorPallet: number;
  descuentoBultoPct?: number | null;
  descuentoPalletPct?: number | null;
  minimoCompraPaquetes: number;
  stockPaquetes: number;
}

export interface ItemCarrito {
  producto: ProductoCarrito;
  presentacion: Presentacion;
  cantidad: number;
}

interface CartState {
  items: ItemCarrito[];
  agregarItem: (producto: ProductoCarrito, presentacion: Presentacion, cantidad: number) => void;
  actualizarCantidad: (productoId: string, presentacion: Presentacion, cantidad: number) => void;
  quitarItem: (productoId: string, presentacion: Presentacion) => void;
  vaciarCarrito: () => void;
  cargarPedido: (items: ItemCarrito[]) => void; // para "Repetir Pedido"
  totalGeneral: () => number;
  cantidadItems: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregarItem: (producto, presentacion, cantidad) => {
        set((state) => {
          const idx = state.items.findIndex(
            (i) => i.producto.id === producto.id && i.presentacion === presentacion
          );
          if (idx >= 0) {
            const nuevos = [...state.items];
            nuevos[idx] = { ...nuevos[idx], cantidad: nuevos[idx].cantidad + cantidad };
            return { items: nuevos };
          }
          return { items: [...state.items, { producto, presentacion, cantidad }] };
        });
      },

      actualizarCantidad: (productoId, presentacion, cantidad) => {
        set((state) => ({
          items: state.items
            .map((i) =>
              i.producto.id === productoId && i.presentacion === presentacion
                ? { ...i, cantidad }
                : i
            )
            .filter((i) => i.cantidad > 0),
        }));
      },

      quitarItem: (productoId, presentacion) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.producto.id === productoId && i.presentacion === presentacion)
          ),
        }));
      },

      vaciarCarrito: () => set({ items: [] }),

      cargarPedido: (items) => {
        // Fusiona el pedido repetido con lo que ya hay en el carrito
        set((state) => {
          const merged = [...state.items];
          for (const nuevo of items) {
            const idx = merged.findIndex(
              (i) => i.producto.id === nuevo.producto.id && i.presentacion === nuevo.presentacion
            );
            if (idx >= 0) merged[idx] = { ...merged[idx], cantidad: merged[idx].cantidad + nuevo.cantidad };
            else merged.push(nuevo);
          }
          return { items: merged };
        });
      },

      totalGeneral: () => {
        return get().items.reduce((acc, i) => {
          return acc + precioUnitario(i.producto, i.presentacion) * i.cantidad;
        }, 0);
      },

      cantidadItems: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),
    }),
    { name: "newpel-cart" }
  )
);

export function paquetesEquivalentes(item: ItemCarrito) {
  return aPaquetes(item.producto, item.presentacion, item.cantidad);
}
