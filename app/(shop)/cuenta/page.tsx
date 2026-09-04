"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { RotateCcw, LogOut, Package } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const labelPresentacion: Record<string, string> = {
  PAQUETE: "Paquete",
  BULTO_CERRADO: "Bulto cerrado",
  PALLET_COMPLETO: "Pallet completo",
};

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

export default function CuentaPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const cargarPedido = useCartStore((s) => s.cargarPedido);
  const [repitiendo, setRepitiendo] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const meRes = await fetch("/api/auth/me").then((r) => r.json());
      if (!meRes.usuario) {
        router.push("/login");
        return;
      }
      setUsuario(meRes.usuario);
      const pedidosRes = await fetch("/api/orders").then((r) => r.json());
      setPedidos(pedidosRes.pedidos || []);
      setCargando(false);
    })();
  }, [router]);

  async function repetirPedido(pedidoId: string) {
    setRepitiendo(pedidoId);
    try {
      const res = await fetch(`/api/orders/${pedidoId}/repeat`);
      const data = await res.json();
      if (data.items?.length) {
        cargarPedido(data.items);
        router.push("/carrito");
      }
    } finally {
      setRepitiendo(null);
    }
  }

  async function cerrarSesion() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  if (cargando) {
    return <div className="mx-auto max-w-4xl px-4 py-16 text-center text-sm text-slate-500">Cargando...</div>;
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{usuario?.nombreComercio}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{usuario?.email} · {usuario?.telefono}</p>
        </div>
        <button onClick={cerrarSesion} className="btn-secondary">
          <LogOut className="h-4 w-4" /> Cerrar sesión
        </button>
      </div>

      <h2 className="mb-3 text-lg font-bold">Historial de pedidos</h2>

      {pedidos.length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">Todavía no hiciste ningún pedido.</p>
          <Link href="/catalogo" className="btn-primary mt-4 inline-flex">
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {pedidos.map((p) => (
            <div key={p.id} className="card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold">Pedido #{p.numero}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {new Date(p.creadoEn).toLocaleDateString("es-AR")} · {p.items.length} producto(s)
                  </p>
                </div>
                <span className={`badge ${colorEstado[p.estado]}`}>{labelEstado[p.estado]}</span>
              </div>

              <ul className="mt-3 space-y-1 text-sm">
                {p.items.map((it: any) => (
                  <li key={it.id} className="flex justify-between text-slate-600 dark:text-slate-300">
                    <span>
                      {it.producto.nombre} × {it.cantidad} ({labelPresentacion[it.presentacion]})
                    </span>
                    <span>${it.subtotal.toFixed(0)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                <p className="font-bold">Total: ${p.total.toFixed(0)}</p>
                <button
                  onClick={() => repetirPedido(p.id)}
                  disabled={repitiendo === p.id}
                  className="btn-secondary"
                >
                  <RotateCcw className="h-4 w-4" />
                  {repitiendo === p.id ? "Cargando..." : "Repetir pedido"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
