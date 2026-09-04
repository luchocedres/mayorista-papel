import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession("ADMIN");

    const [pedidos, clientes, productos] = await Promise.all([
      prisma.pedido.findMany({ include: { items: { include: { producto: true } } } }),
      prisma.usuario.count({ where: { rol: "COMERCIANTE" } }),
      prisma.producto.findMany({ where: { activo: true } }),
    ]);

    const ventasTotales = pedidos.reduce((acc, p) => acc + p.total, 0);
    const cantidadPedidos = pedidos.length;
    const ticketPromedio = cantidadPedidos ? ventasTotales / cantidadPedidos : 0;

    // Margen = suma( (precioVentaUnitario - costoUnitario_equivalente) * cantidadPaquetesEquivalente )
    let costoTotal = 0;
    let ingresoTotal = 0;
    for (const p of pedidos) {
      for (const it of p.items) {
        ingresoTotal += it.subtotal;
        costoTotal += it.producto.costoUnitario * it.cantidadPaquetesEquivalente;
      }
    }
    const margenTotal = ingresoTotal - costoTotal;
    const margenPct = ingresoTotal ? (margenTotal / ingresoTotal) * 100 : 0;

    // Stock crítico: productos con menos de 20 paquetes o mínimo de compra sin cubrir
    const stockBajo = productos.filter((p) => p.stockPaquetes < 20).length;

    // Ventas por día (últimos 14 días) para gráfico
    const catorceDias = new Date();
    catorceDias.setDate(catorceDias.getDate() - 14);
    const ventasPorDiaMap: Record<string, number> = {};
    for (const p of pedidos) {
      if (p.creadoEn < catorceDias) continue;
      const key = p.creadoEn.toISOString().slice(0, 10);
      ventasPorDiaMap[key] = (ventasPorDiaMap[key] || 0) + p.total;
    }
    const ventasPorDia = Object.entries(ventasPorDiaMap)
      .sort(([a], [b]) => (a > b ? 1 : -1))
      .map(([fecha, total]) => ({ fecha, total }));

    return NextResponse.json({
      ventasTotales,
      cantidadPedidos,
      ticketPromedio,
      costoTotal,
      margenTotal,
      margenPct,
      clientesRegistrados: clientes,
      productosActivos: productos.length,
      stockBajo,
      ventasPorDia,
    });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
}
