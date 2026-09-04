"use client";

import { useEffect, useState } from "react";
import { DollarSign, TrendingUp, Users, Package, AlertTriangle, ShoppingBag } from "lucide-react";

interface Metricas {
  ventasTotales: number;
  cantidadPedidos: number;
  ticketPromedio: number;
  costoTotal: number;
  margenTotal: number;
  margenPct: number;
  clientesRegistrados: number;
  productosActivos: number;
  stockBajo: number;
  ventasPorDia: { fecha: string; total: number }[];
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string; sub?: string }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-semibold uppercase tracking-wide">{label}</p>
      </div>
      <p className="mt-2 text-2xl font-bold">{value}</p>
      {sub && <p className="text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
    </div>
  );
}

export default function AdminMetricasPage() {
  const [m, setM] = useState<Metricas | null>(null);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then(setM);
  }, []);

  if (!m) return <p className="text-sm text-slate-500">Cargando métricas...</p>;

  const maxVenta = Math.max(1, ...m.ventasPorDia.map((v) => v.total));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Métricas del negocio</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        <StatCard icon={DollarSign} label="Ventas totales" value={`$${m.ventasTotales.toFixed(0)}`} />
        <StatCard icon={ShoppingBag} label="Pedidos" value={String(m.cantidadPedidos)} sub={`Ticket prom. $${m.ticketPromedio.toFixed(0)}`} />
        <StatCard icon={TrendingUp} label="Margen" value={`$${m.margenTotal.toFixed(0)}`} sub={`${m.margenPct.toFixed(1)}% sobre ventas`} />
        <StatCard icon={Users} label="Clientes registrados" value={String(m.clientesRegistrados)} />
        <StatCard icon={Package} label="Productos activos" value={String(m.productosActivos)} />
        <StatCard
          icon={AlertTriangle}
          label="Stock bajo"
          value={String(m.stockBajo)}
          sub="Productos con menos de 20 paquetes"
        />
      </div>

      {m.ventasPorDia.length > 0 && (
        <div className="card mt-6 p-5">
          <p className="mb-4 text-sm font-bold">Ventas — últimos 14 días</p>
          <div className="flex h-40 items-end gap-2">
            {m.ventasPorDia.map((v) => (
              <div key={v.fecha} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-t bg-brand-500"
                  style={{ height: `${Math.max(4, (v.total / maxVenta) * 100)}%` }}
                  title={`$${v.total.toFixed(0)}`}
                />
                <span className="text-[9px] text-slate-400">{v.fecha.slice(5)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
