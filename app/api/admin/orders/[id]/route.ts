import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

const ESTADOS_VALIDOS = ["PENDIENTE", "CONFIRMADO", "EN_PREPARACION", "ENVIADO", "ENTREGADO", "CANCELADO"];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireSession("ADMIN");
    const { estado } = await req.json();

    if (!ESTADOS_VALIDOS.includes(estado)) {
      return NextResponse.json({ error: "Estado inválido." }, { status: 400 });
    }

    const pedido = await prisma.pedido.update({
      where: { id: params.id },
      data: { estado },
      include: { usuario: { select: { nombreComercio: true, telefono: true } } },
    });

    return NextResponse.json({ ok: true, pedido });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No se pudo actualizar el pedido." }, { status: 400 });
  }
}
