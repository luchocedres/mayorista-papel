import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ usuario: null });

  const usuario = await prisma.usuario.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      rol: true,
      nombreComercio: true,
      direccion: true,
      telefono: true,
      cuitODni: true,
    },
  });
  return NextResponse.json({ usuario });
}
