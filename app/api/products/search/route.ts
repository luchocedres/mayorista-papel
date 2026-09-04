import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ productos: [] });

  // Búsqueda simple por nombre o nombre de marca (case-insensitive vía SQLite LIKE)
  const productos = await prisma.producto.findMany({
    where: {
      activo: true,
      OR: [
        { nombre: { contains: q } },
        { marca: { nombre: { contains: q } } },
      ],
    },
    include: { marca: true },
    take: 8,
    orderBy: { nombre: "asc" },
  });

  return NextResponse.json({
    productos: productos.map((p) => ({
      id: p.id,
      nombre: p.nombre,
      imagenUrl: p.imagenUrl,
      precioPaquete: p.precioPaquete,
      marca: p.marca.nombre,
    })),
  });
}
