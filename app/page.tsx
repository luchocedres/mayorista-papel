import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import OfertasCarousel from "@/components/OfertasCarousel";
import HeroPattern from "@/components/HeroPattern";
import { ArrowRight, Truck, ShieldCheck, PackageCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [marcaNewPel, categorias, destacados, config, productosOferta] = await Promise.all([
    prisma.marca.findFirst({ where: { destacada: true } }),
    prisma.categoria.findMany({ take: 4 }),
    prisma.producto.findMany({
      where: { activo: true },
      take: 8,
      include: { marca: true, categoria: true },
      orderBy: { creadoEn: "desc" },
    }),
    prisma.siteConfig.findUnique({ where: { id: "singleton" } }),
    prisma.producto.findMany({
      where: {
        activo: true,
        OR: [{ descuentoBultoPct: { gt: 0 } }, { descuentoPalletPct: { gt: 0 } }],
      },
      take: 8,
      orderBy: { actualizadoEn: "desc" },
    }),
  ]);

  const ofertas = productosOferta.map((p) => ({
    id: p.id,
    nombre: p.nombre,
    imagenUrl: p.imagenUrl,
    precioPaquete: p.precioPaquete,
    descuento: Math.max(p.descuentoBultoPct || 0, p.descuentoPalletPct || 0),
  }));

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-newpel-dark text-white">
        {config?.heroImagenUrl ? (
          <>
            <Image
              src={config.heroImagenUrl}
              alt="New Pel Mayorista"
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-brand-900/85 via-brand-800/75 to-newpel-dark/80" />
          </>
        ) : (
          <HeroPattern />
        )}

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <span className="mb-4 w-fit rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur">
              Venta 100% mayorista
            </span>
            <h1 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Papel y limpieza al por mayor,{" "}
              <span className="text-brand-200">directo a tu comercio</span>
            </h1>
            <p className="mt-4 max-w-md text-brand-100">
              Comprá por paquete, bulto cerrado o pallet completo. Descuentos automáticos por volumen
              y coordinación de pago/entrega directo por WhatsApp.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/catalogo" className="btn-primary bg-white text-brand-700 hover:bg-brand-50">
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/registro" className="btn-secondary bg-transparent text-white hover:bg-white/10">
                Crear cuenta de comercio
              </Link>
            </div>
          </div>

          {/* Banner marca destacada New Pel */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-center text-slate-900 shadow-cardHover">
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Marca insignia</p>
              <h2 className="mt-1 text-3xl font-black">{marcaNewPel?.nombre || "New Pel"}</h2>
              <p className="mt-2 text-sm text-slate-600">
                Rollos de cocina, papel higiénico institucional y línea completa. Calidad probada por
                cientos de comercios.
              </p>
              <Link href="/catalogo?marca=New Pel" className="btn-primary mt-5 w-full">
                Ver productos New Pel
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* OFERTAS — carrusel con auto-rotación */}
      <OfertasCarousel productos={ofertas} />

      {/* Beneficios */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card flex items-center gap-3 p-4">
            <PackageCheck className="h-8 w-8 text-brand-600" />
            <div>
              <p className="font-semibold">Compra por bulto o pallet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Conversión automática de unidades</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <Truck className="h-8 w-8 text-brand-600" />
            <div>
              <p className="font-semibold">Coordinación por WhatsApp</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pago y logística directo con el vendedor</p>
            </div>
          </div>
          <div className="card flex items-center gap-3 p-4">
            <ShieldCheck className="h-8 w-8 text-brand-600" />
            <div>
              <p className="font-semibold">Presupuesto en PDF</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Descargá y enviá tu pedido armado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categorías */}
      {categorias.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-6">
          <h2 className="mb-4 text-xl font-bold">Categorías</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {categorias.map((c) => (
              <Link
                key={c.id}
                href={`/catalogo?categoria=${c.slug}`}
                className="card flex items-center justify-center p-6 text-center font-semibold hover:border-brand-400"
              >
                {c.nombre}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Destacados */}
      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Productos destacados</h2>
          <Link href="/catalogo" className="text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
            Ver todo →
          </Link>
        </div>
        {destacados.length === 0 ? (
          <p className="text-sm text-slate-500">
            Todavía no hay productos cargados. Iniciá sesión como admin y cargá el catálogo.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {destacados.map((p) => (
              <ProductCard
                key={p.id}
                p={{
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
                }}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
