import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession("ADMIN");
    const usuarios = await prisma.usuario.findMany({
      include: { sucursales: true, _count: { select: { pedidos: true } } },
      orderBy: { creadoEn: "desc" },
    });
    return NextResponse.json({
      usuarios: usuarios.map((u) => ({
        id: u.id,
        email: u.email,
        rol: u.rol,
        nombreComercio: u.nombreComercio,
        cuitODni: u.cuitODni,
        telefono: u.telefono,
        direccion: u.direccion,
        activo: u.activo,
        creadoEn: u.creadoEn,
        cantidadSucursales: u.sucursales.length,
        cantidadPedidos: u._count.pedidos,
      })),
    });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
}
