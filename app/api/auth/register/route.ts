import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword, createSessionToken, setSessionCookie } from "@/lib/auth";

const registroSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombreComercio: z.string().min(2, "Ingresá el nombre del local/comercio"),
  cuitODni: z.string().min(6, "Ingresá un CUIT o DNI válido"),
  telefono: z.string().min(6, "Ingresá un teléfono de contacto"),
  direccion: z.string().min(5, "Ingresá la dirección de entrega"),
  sucursales: z
    .array(z.object({ nombre: z.string(), direccion: z.string(), telefono: z.string().optional() }))
    .optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const datos = registroSchema.parse(body);

    const existente = await prisma.usuario.findUnique({ where: { email: datos.email } });
    if (existente) {
      return NextResponse.json({ error: "Ya existe una cuenta con ese email." }, { status: 409 });
    }

    const passwordHash = await hashPassword(datos.password);

    const usuario = await prisma.usuario.create({
      data: {
        email: datos.email,
        passwordHash,
        nombreComercio: datos.nombreComercio,
        cuitODni: datos.cuitODni,
        telefono: datos.telefono,
        direccion: datos.direccion,
        sucursales: datos.sucursales?.length
          ? {
              create: datos.sucursales.map((s, i) => ({
                nombre: s.nombre,
                direccion: s.direccion,
                telefono: s.telefono,
                esPrincipal: i === 0,
              })),
            }
          : undefined,
      },
    });

    const token = createSessionToken({
      userId: usuario.id,
      rol: "COMERCIANTE",
      nombreComercio: usuario.nombreComercio,
    });
    setSessionCookie(token);

    return NextResponse.json({ ok: true, usuario: { id: usuario.id, email: usuario.email } });
  } catch (err: any) {
    if (err?.issues) {
      return NextResponse.json({ error: err.issues[0]?.message || "Datos inválidos" }, { status: 400 });
    }
    console.error(err);
    return NextResponse.json({ error: "No se pudo completar el registro." }, { status: 500 });
  }
}
