"use client";

import { useState } from "react";
import { MessageCircle, Loader2 } from "lucide-react";
import type { ItemCarrito } from "@/store/cartStore";
import { precioUnitario } from "@/lib/pricing";
import { armarMensajeWhatsApp, linkWhatsApp } from "@/lib/whatsapp";
import { useCartStore } from "@/store/cartStore";

export default function WhatsAppCheckoutButton({
  items,
  nombreComercio,
  direccionEntrega,
  disabled,
}: {
  items: ItemCarrito[];
  nombreComercio: string;
  direccionEntrega: string;
  disabled?: boolean;
}) {
  const [enviando, setEnviando] = useState(false);
  const vaciarCarrito = useCartStore((s) => s.vaciarCarrito);

  async function finalizarPedido() {
    setEnviando(true);
    try {
      const total = items.reduce(
        (acc, it) => acc + precioUnitario(it.producto, it.presentacion) * it.cantidad,
        0
      );

      // 1) Envío del resumen estructurado al backend / panel admin
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((it) => ({
            productoId: it.producto.id,
            presentacion: it.presentacion,
            cantidad: it.cantidad,
          })),
          direccionEntrega,
        }),
      });

      let numeroPedido: number | undefined;
      if (res.ok) {
        const data = await res.json();
        numeroPedido = data.pedido?.numero;
      }

      // 2) Generación de mensaje formateado a WhatsApp Business
      const mensaje = armarMensajeWhatsApp({
        nombreComercio,
        direccionEntrega,
        items: items.map((it) => ({
          nombre: it.producto.nombre,
          presentacion: it.presentacion,
          cantidad: it.cantidad,
          subtotal: precioUnitario(it.producto, it.presentacion) * it.cantidad,
        })),
        total,
        numeroPedido,
      });

      window.open(linkWhatsApp(mensaje), "_blank");
      vaciarCarrito();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button onClick={finalizarPedido} disabled={disabled || enviando} className="btn-whatsapp w-full">
      {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
      Finalizar pedido por WhatsApp
    </button>
  );
}
