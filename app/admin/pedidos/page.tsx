"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { armarMensajeCambioEstado, linkWhatsAppCliente } from "@/lib/whatsapp";

const ESTADOS = ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"];

const labelEstado: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

const colorEstado: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  CONFIRMADO: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  EN_PREPARACION: "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  ENVIADO: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  ENTREGADO: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  CANCELADO: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<string | null>(null);

  async function cargar() {
    const d = await fetch("/api/admin/orders").then((r) => r.json());
    setPedidos(d.pedidos || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function cambiarEstado(pedido: any, estadoNuevo: string) {
    if (estadoNuevo === pedido.estado) return;
    setActualizando(pedido.id);
    try {
      const res = await fetch(`/api/admin/orders/${pedido.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: estadoNuevo }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
        return;
      }
      await cargar();

      // Avisamos al cliente por WhatsApp (se abre con el mensaje ya armado)
      if (pedido.usuario?.telefono) {
        const mensaje = armarMensajeCambioEstado({
          nombreComercio: pedido.usuario.nombreComercio,
          numeroPedido: pedido.numero,
          estadoNuevo,
        });
        window.open(linkWhatsAppCliente(pedido.usuario.telefono, mensaje), "_blank");
      }
    } finally {
      setActualizando(null);
    }
  }

  function avisarManual(pedido: any) {
    if (!pedido.usuario?.telefono) return;
    const mensaje = armarMensajeCambioEstado({
      nombreComercio: pedido.usuario.nombreComercio,
      numeroPedido: pedido.numero,
      estadoNuevo: pedido.estado,
    });
    window.open(linkWhatsAppCliente(pedido.usuario.telefono, mensaje), "_blank");
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Pedidos recibidos</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Cambiá el estado desde el desplegable — al hacerlo se te abre WhatsApp con el aviso ya
        redactado para el cliente, solo tenés que apretar enviar.
      </p>

      {cargando ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : pedidos.length === 0 ? (
        <p className="text-sm text-slate-500">Todavía no hay pedidos.</p>
      ) : (
        <div className="space-y-3">
          {pedidos.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">
                    Pedido #{p.numero} — {p.usuario?.nombreComercio}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(p.creadoEn).toLocaleString("es-AR")} · {p.usuario?.telefono} · {p.direccionEntrega}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => avisarManual(p)}
                    title="Reenviar aviso de estado actual por WhatsApp"
                    className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1 text-xs font-medium text-emerald-600 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-900/20"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Avisar
                  </button>
                  <select
                    value={p.estado}
                    disabled={actualizando === p.id}
                    onChange={(e) => cambiarEstado(p, e.target.value)}
                    className={`badge cursor-pointer border-none ${colorEstado[p.estado]}`}
                  >
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {labelEstado[e]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {p.items.map((it: any) => (
                  <li key={it.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>{it.producto.nombre} × {it.cantidad} ({it.presentacion})</span>
                    <span>${it.subtotal.toFixed(0)}</span>
                  </li>
                ))}
              </ul>

              <p className="mt-3 border-t border-slate-200 pt-3 text-right font-bold dark:border-slate-700">
                Total: ${p.total.toFixed(0)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

