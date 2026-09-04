import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest) {
  try {
    await requireSession("ADMIN");

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const carpeta = (formData.get("carpeta") as string) === "brands" ? "brands" : "products";

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo." }, { status: 400 });
    }
    if (!TIPOS_PERMITIDOS.includes(file.type)) {
      return NextResponse.json({ error: "Formato no soportado. Usá JPG, PNG, WEBP o GIF." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen no puede pesar más de 5MB." }, { status: 400 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const ext = path.extname(file.name) || ".jpg";
    const nombreUnico = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    const carpetaDestino = path.join(process.cwd(), "public", "uploads", carpeta);
    await mkdir(carpetaDestino, { recursive: true });
    await writeFile(path.join(carpetaDestino, nombreUnico), bytes);

    const url = `/uploads/${carpeta}/${nombreUnico}`;
    return NextResponse.json({ ok: true, url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "No se pudo subir la imagen." }, { status: 400 });
  }
}
