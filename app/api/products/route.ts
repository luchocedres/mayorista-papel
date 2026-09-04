import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || undefined;
  const categoriaSlug = searchParams.get("categoria") || undefined;
  const marca = searchParams.get("marca") || undefined;
  const presentacion = searchParams.get("presentacion") || undefined;

  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      nombre: q ? { contains: q } : undefined,
      categoria: categoriaSlug ? { slug: categoriaSlug } : undefined,
      marca: marca ? { nombre: marca } : undefined,
      presentacion: presentacion ? (presentacion as any) : undefined,
    },
    include: { marca: true, categoria: true },
    orderBy: { creadoEn: "desc" },
  });

  return NextResponse.json({
    productos: productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      imagenUrl: p.imagenUrl,
      marca: p.marca.nombre,
      categoria: p.categoria.nombre,
      categoriaSlug: p.categoria.slug,
      presentacion: p.presentacion,
      precioPaquete: p.precioPaquete,
      descuentoBultoPct: p.descuentoBultoPct,
      descuentoPalletPct: p.descuentoPalletPct,
      minimoCompraPaquetes: p.minimoCompraPaquetes,
    })),
  });
}
