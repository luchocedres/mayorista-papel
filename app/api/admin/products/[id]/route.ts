import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    const body = await req.json();

    // Reemplazamos la galería completa: borramos las imágenes viejas y creamos las nuevas
    if (Array.isArray(body.imagenes)) {
      await prisma.imagenProducto.deleteMany({ where: { productoId: params.id } });
    }

    const producto = await prisma.producto.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        marcaId: body.marcaId,
        categoriaId: body.categoriaId,
        imagenUrl: body.imagenUrl,
        presentacion: body.presentacion,
        unidadesPorPaquete: Number(body.unidadesPorPaquete),
        paquetesPorBulto: Number(body.paquetesPorBulto),
        bultosPorPallet: Number(body.bultosPorPallet),
        costoUnitario: Number(body.costoUnitario),
        precioPaquete: Number(body.precioPaquete),
        precioBulto: body.precioBulto ? Number(body.precioBulto) : null,
        precioPallet: body.precioPallet ? Number(body.precioPallet) : null,
        stockPaquetes: Number(body.stockPaquetes),
        minimoCompraPaquetes: Number(body.minimoCompraPaquetes),
        descuentoBultoPct: body.descuentoBultoPct ? Number(body.descuentoBultoPct) : null,
        descuentoPalletPct: body.descuentoPalletPct ? Number(body.descuentoPalletPct) : null,
        activo: body.activo,
        imagenes: Array.isArray(body.imagenes) && body.imagenes.length
          ? { create: body.imagenes.map((url: string, i: number) => ({ url, orden: i })) }
          : undefined,
      },
    });

    return NextResponse.json({ ok: true, producto });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No se pudo actualizar." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    // Baja lógica en lugar de borrado físico, para no romper historial de pedidos
    await prisma.producto.update({ where: { id: params.id }, data: { activo: false } });
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No se pudo eliminar." }, { status: 400 });
  }
}
