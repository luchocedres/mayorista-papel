import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { session } = await requireSession("ADMIN");
    const body = await req.json(); // { rol?: "ADMIN" | "COMERCIANTE", activo?: boolean }

    // Evitar que un admin se saque a sí mismo el rol o se desactive por error
    if (params.id === session.userId) {
      if (body.rol && body.rol !== "ADMIN") {
        return NextResponse.json({ error: "No podés quitarte el rol de admin a vos mismo." }, { status: 400 });
      }
      if (body.activo === false) {
        return NextResponse.json({ error: "No podés desactivar tu propia cuenta." }, { status: 400 });
      }
    }

    // Evitar quedarse sin ningún admin en el sistema
    if (body.rol === "COMERCIANTE") {
      const cantidadAdmins = await prisma.usuario.count({ where: { rol: "ADMIN" } });
      const objetivo = await prisma.usuario.findUnique({ where: { id: params.id } });
      if (objetivo?.rol === "ADMIN" && cantidadAdmins <= 1) {
        return NextResponse.json({ error: "Tiene que quedar al menos un administrador." }, { status: 400 });
      }
    }

    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: {
        rol: body.rol ?? undefined,
        activo: typeof body.activo === "boolean" ? body.activo : undefined,
      },
    });

    return NextResponse.json({ ok: true, usuario: { id: usuario.id, rol: usuario.rol, activo: usuario.activo } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No se pudo actualizar el cliente." }, { status: 400 });
  }
}
