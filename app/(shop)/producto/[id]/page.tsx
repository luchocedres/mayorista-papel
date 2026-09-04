import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import ProductoClient from "./ProductoClient";

export const dynamic = "force-dynamic";

export default async function ProductoPage({ params }: { params: { id: string } }) {
  const producto = await prisma.producto.findUnique({
    where: { id: params.id },
    include: { marca: true, categoria: true, imagenes: { orderBy: { orden: "asc" } } },
  });

  if (!producto || !producto.activo) return notFound();

  // Navegación entre productos: anterior/siguiente dentro de la misma categoría (orden alfabético)
  const [anterior, siguiente, candidatosRecomendados] = await Promise.all([
    prisma.producto.findFirst({
      where: { activo: true, categoriaId: producto.categoriaId, nombre: { lt: producto.nombre } },
      orderBy: { nombre: "desc" },
      select: { id: true, nombre: true },
    }),
    prisma.producto.findFirst({
      where: { activo: true, categoriaId: producto.categoriaId, nombre: { gt: producto.nombre } },
      orderBy: { nombre: "asc" },
      select: { id: true, nombre: true },
    }),
    prisma.producto.findMany({
      where: { activo: true, id: { not: producto.id } },
      include: { marca: true, categoria: true },
      take: 20,
    }),
  ]);

  // "También te recomendamos": 4 al azar de entre los candidatos (mezclados en el servidor)
  const recomendados = candidatosRecomendados
    .sort(() => Math.random() - 0.5)
    .slice(0, 4)
    .map((p) => ({
      id: p.id,
      nombre: p.nombre,
      imagenUrl: p.imagenUrl,
      marca: p.marca.nombre,
      categoria: p.categoria.nombre,
      presentacion: p.presentacion,
      precioPaquete: p.precioPaquete,
      descuentoBultoPct: p.descuentoBultoPct,
      descuentoPalletPct: p.descuentoPalletPct,
      minimoCompraPaquetes: p.minimoCompraPaquetes,
    }));

  return (
    <ProductoClient
      producto={{
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        imagenUrl: producto.imagenUrl,
        precioPaquete: producto.precioPaquete,
        precioBulto: producto.precioBulto,
        precioPallet: producto.precioPallet,
        paquetesPorBulto: producto.paquetesPorBulto,
        bultosPorPallet: producto.bultosPorPallet,
        descuentoBultoPct: producto.descuentoBultoPct,
        descuentoPalletPct: producto.descuentoPalletPct,
        minimoCompraPaquetes: producto.minimoCompraPaquetes,
        stockPaquetes: producto.stockPaquetes,
      }}
      galeria={[producto.imagenUrl, ...producto.imagenes.map((i) => i.url)].filter(Boolean) as string[]}
      marcaNombre={producto.marca.nombre}
      categoriaNombre={producto.categoria.nombre}
      anterior={anterior}
      siguiente={siguiente}
      recomendados={recomendados}
    />
  );
}
