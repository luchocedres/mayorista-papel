import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024; // 5MB

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await requireSession("ADMIN");

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: "Falta configurar Cloudinary (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET) en las variables de entorno." },
        { status: 500 }
      );
    }

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
    const dataUri = `data:${file.type};base64,${bytes.toString("base64")}`;

    const resultado = await cloudinary.uploader.upload(dataUri, {
      folder: `newpel/${carpeta}`,
      resource_type: "image",
    });

    return NextResponse.json({ ok: true, url: resultado.secure_url });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "No se pudo subir la imagen." }, { status: 400 });
  }
}
