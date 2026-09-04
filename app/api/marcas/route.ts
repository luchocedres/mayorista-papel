import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const marcas = await prisma.marca.findMany({ orderBy: { nombre: "asc" } });
  return NextResponse.json({ marcas });
}
