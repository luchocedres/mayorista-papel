import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession("ADMIN");
    const productos = await prisma.producto.findMany({
      include: { marca: true, categoria: true, imagenes: { orderBy: { orden: "asc" } } },
      orderBy: { creadoEn: "desc" },
    });
    return NextResponse.json({ productos });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession("ADMIN");
    const body = await req.json();

    const producto = await prisma.producto.create({
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        sku: body.sku,
        marcaId: body.marcaId,
        categoriaId: body.categoriaId,
        imagenUrl: body.imagenUrl,
        presentacion: body.presentacion,
        unidadesPorPaquete: Number(body.unidadesPorPaquete) || 1,
        paquetesPorBulto: Number(body.paquetesPorBulto) || 1,
        bultosPorPallet: Number(body.bultosPorPallet) || 1,
        costoUnitario: Number(body.costoUnitario) || 0,
        precioPaquete: Number(body.precioPaquete),
        precioBulto: body.precioBulto ? Number(body.precioBulto) : null,
        precioPallet: body.precioPallet ? Number(body.precioPallet) : null,
        stockPaquetes: Number(body.stockPaquetes) || 0,
        minimoCompraPaquetes: Number(body.minimoCompraPaquetes) || 1,
        descuentoBultoPct: body.descuentoBultoPct ? Number(body.descuentoBultoPct) : null,
        descuentoPalletPct: body.descuentoPalletPct ? Number(body.descuentoPalletPct) : null,
        imagenes: Array.isArray(body.imagenes) && body.imagenes.length
          ? { create: body.imagenes.map((url: string, i: number) => ({ url, orden: i })) }
          : undefined,
      },
    });

    return NextResponse.json({ ok: true, producto });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "No se pudo crear el producto." }, { status: 400 });
  }
}
