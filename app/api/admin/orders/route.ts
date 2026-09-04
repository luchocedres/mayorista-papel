import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession("ADMIN");
    const pedidos = await prisma.pedido.findMany({
      include: {
        usuario: { select: { nombreComercio: true, telefono: true, email: true } },
        items: { include: { producto: true } },
      },
      orderBy: { creadoEn: "desc" },
    });
    return NextResponse.json({ pedidos });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
}
