import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session } = await requireSession();

    const pedido = await prisma.pedido.findFirst({
      where: { id: params.id, usuarioId: session.userId },
      include: { items: { include: { producto: { include: { marca: true, categoria: true } } } } },
    });

    if (!pedido) return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });

    // Devolvemos los items en formato listo para el store del carrito en el cliente
    const items = pedido.items
      .filter((it) => it.producto.activo)
      .map((it) => ({
        producto: {
          id: it.producto.id,
          nombre: it.producto.nombre,
          imagenUrl: it.producto.imagenUrl,
          precioPaquete: it.producto.precioPaquete,
          precioBulto: it.producto.precioBulto,
          precioPallet: it.producto.precioPallet,
          paquetesPorBulto: it.producto.paquetesPorBulto,
          bultosPorPallet: it.producto.bultosPorPallet,
          descuentoBultoPct: it.producto.descuentoBultoPct,
          descuentoPalletPct: it.producto.descuentoPalletPct,
          minimoCompraPaquetes: it.producto.minimoCompraPaquetes,
          stockPaquetes: it.producto.stockPaquetes,
        },
        presentacion: it.presentacion,
        cantidad: it.cantidad,
      }));

    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
}
