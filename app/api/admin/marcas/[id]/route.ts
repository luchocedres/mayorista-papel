import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    const body = await req.json();

    if (body.destacada) {
      await prisma.marca.updateMany({ data: { destacada: false }, where: {} });
    }

    const marca = await prisma.marca.update({
      where: { id: params.id },
      data: {
        nombre: body.nombre,
        logoUrl: body.logoUrl || null,
        destacada: !!body.destacada,
      },
    });
    return NextResponse.json({ ok: true, marca });
  } catch {
    return NextResponse.json({ error: "No se pudo actualizar la marca." }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    const conProductos = await prisma.producto.count({ where: { marcaId: params.id } });
    if (conProductos > 0) {
      return NextResponse.json(
        { error: `No se puede borrar: tiene ${conProductos} producto(s) asociado(s). Desactivalos o cambiales la marca primero.` },
        { status: 400 }
      );
    }
    await prisma.marca.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "No se pudo eliminar la marca." }, { status: 400 });
  }
}
