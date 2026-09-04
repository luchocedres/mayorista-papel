import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    const body = await req.json();
    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data: { nombre: body.nombre, slug: slugify(body.nombre) },
    });
    return NextResponse.json({ ok: true, categoria });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la categoría." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    const conProductos = await prisma.producto.count({ where: { categoriaId: params.id } });
    if (conProductos > 0) {
      return NextResponse.json(
        { error: `No se puede borrar: tiene ${conProductos} producto(s) asociado(s).` },
        { status: 400 }
      );
    }
    await prisma.categoria.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la categoría." }, { status: 400 });
  }
}
