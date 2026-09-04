import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const p = await prisma.producto.findUnique({
    where: { id: params.id },
    include: { marca: true, categoria: true, imagenes: { orderBy: { orden: "asc" } } },
  });
  if (!p || !p.activo) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 });
  }
  return NextResponse.json({ producto: p });
}
