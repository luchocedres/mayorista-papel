import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  try {
    await requireSession("ADMIN");
    const marcas = await prisma.marca.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json({ marcas });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession("ADMIN");
    const body = await req.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre de la marca es obligatorio." }, { status: 400 });
    }

    // Si esta marca se marca como destacada, sacamos el destaque de las demás
    // (sólo puede haber una marca insignia en el banner de la Home a la vez)
    if (body.destacada) {
      await prisma.marca.updateMany({ data: { destacada: false }, where: {} });
    }

    const marca = await prisma.marca.create({
      data: {
        nombre: body.nombre.trim(),
        logoUrl: body.logoUrl || null,
        destacada: !!body.destacada,
      },
    });
    return NextResponse.json({ ok: true, marca });
  } catch (err: any) {
    const msg = err?.code === "P2002" ? "Ya existe una marca con ese nombre." : "No se pudo crear la marca.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
