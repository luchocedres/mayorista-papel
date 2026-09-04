import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

function slugify(texto: string) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // saca acentos
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function GET() {
  try {
    await requireSession("ADMIN");
    const categorias = await prisma.categoria.findMany({
      include: { _count: { select: { productos: true } } },
      orderBy: { nombre: "asc" },
    });
    return NextResponse.json({ categorias });
  } catch {
    return NextResponse.json({ error: "No autorizado." }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireSession("ADMIN");
    const body = await req.json();
    if (!body.nombre?.trim()) {
      return NextResponse.json({ error: "El nombre de la categoría es obligatorio." }, { status: 400 });
    }
    const categoria = await prisma.categoria.create({
      data: { nombre: body.nombre.trim(), slug: slugify(body.nombre) },
    });
    return NextResponse.json({ ok: true, categoria });
  } catch (err: any) {
    const msg = err?.code === "P2002" ? "Ya existe una categoría con ese nombre." : "No se pudo crear la categoría.";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
