import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son obligatorios." }, { status: 400 });
    }

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario || !usuario.activo) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const valido = await verifyPassword(password, usuario.passwordHash);
    if (!valido) {
      return NextResponse.json({ error: "Credenciales inválidas." }, { status: 401 });
    }

    const token = createSessionToken({
      userId: usuario.id,
      rol: usuario.rol,
      nombreComercio: usuario.nombreComercio,
    });
    setSessionCookie(token);

    return NextResponse.json({
      ok: true,
      usuario: { id: usuario.id, rol: usuario.rol, nombreComercio: usuario.nombreComercio },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo iniciar sesión." }, { status: 500 });
  }
}
