import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function GET() {
  const config = await prisma.siteConfig.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ config });
}

export async function PUT(req: NextRequest) {
  try {
    await requireSession("ADMIN");
    const { heroImagenUrl } = await req.json();

    const config = await prisma.siteConfig.upsert({
      where: { id: "singleton" },
      update: { heroImagenUrl: heroImagenUrl || null },
      create: { id: "singleton", heroImagenUrl: heroImagenUrl || null },
    });

    return NextResponse.json({ ok: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "No se pudo guardar." }, { status: 400 });
  }
}
