import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const PRESENTACIONES = [
  { value: "PAQUETE", label: "Paquete" },
  { value: "BULTO_CERRADO", label: "Bulto cerrado" },
  { value: "PALLET_COMPLETO", label: "Pallet completo" },
];

const POR_PAGINA = 12;

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string; marca?: string; presentacion?: string; page?: string };
}) {
  const { q, categoria, marca, presentacion } = searchParams;
  const paginaActual = Math.max(1, Number(searchParams.page) || 1);

  const where = {
    activo: true,
    nombre: q ? { contains: q } : undefined,
    categoria: categoria ? { slug: categoria } : undefined,
    marca: marca ? { nombre: marca } : undefined,
    presentacion: presentacion ? (presentacion as any) : undefined,
  };

  const [productos, totalProductos, categorias, marcas] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { marca: true, categoria: true },
      orderBy: { nombre: "asc" },
      skip: (paginaActual - 1) * POR_PAGINA,
      take: POR_PAGINA,
    }),
    prisma.producto.count({ where }),
    prisma.categoria.findMany({ orderBy: { nombre: "asc" } }),
    prisma.marca.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const totalPaginas = Math.max(1, Math.ceil(totalProductos / POR_PAGINA));

  function buildUrl(params: Record<string, string | undefined>) {
    const merged = { q, categoria, marca, presentacion, page: undefined as string | undefined, ...params };
    const sp = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => v && sp.set(k, v));
    const qs = sp.toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-1 text-2xl font-bold">Catálogo</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        {totalProductos} producto{totalProductos !== 1 ? "s" : ""} encontrados
        {q && ` para "${q}"`}
      </p>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* FILTROS */}
        <aside className="w-full flex-shrink-0 lg:w-56">
          <div className="card p-4">
            <p className="mb-2 text-sm font-bold">Categoría</p>
            <div className="flex flex-col gap-1">
              <Link href={buildUrl({ categoria: undefined })} className={`rounded px-2 py-1 text-sm ${!categoria ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                Todas
              </Link>
              {categorias.map((c) => (
                <Link
                  key={c.id}
                  href={buildUrl({ categoria: c.slug })}
                  className={`rounded px-2 py-1 text-sm ${categoria === c.slug ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {c.nombre}
                </Link>
              ))}
            </div>

            <p className="mb-2 mt-5 text-sm font-bold">Marca</p>
            <div className="flex flex-col gap-1">
              <Link href={buildUrl({ marca: undefined })} className={`rounded px-2 py-1 text-sm ${!marca ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                Todas
              </Link>
              {marcas.map((m) => (
                <Link
                  key={m.id}
                  href={buildUrl({ marca: m.nombre })}
                  className={`rounded px-2 py-1 text-sm ${marca === m.nombre ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {m.nombre}
                </Link>
              ))}
            </div>

            <p className="mb-2 mt-5 text-sm font-bold">Presentación</p>
            <div className="flex flex-col gap-1">
              <Link href={buildUrl({ presentacion: undefined })} className={`rounded px-2 py-1 text-sm ${!presentacion ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}>
                Todas
              </Link>
              {PRESENTACIONES.map((pr) => (
                <Link
                  key={pr.value}
                  href={buildUrl({ presentacion: pr.value })}
                  className={`rounded px-2 py-1 text-sm ${presentacion === pr.value ? "bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {pr.label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

        {/* GRID DE PRODUCTOS */}
        <div className="flex-1">
          {productos.length === 0 ? (
            <p className="text-sm text-slate-500">No se encontraron productos con esos filtros.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {productos.map((p) => (
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

              {totalPaginas > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <Link
                    href={buildUrl({ page: String(Math.max(1, paginaActual - 1)) })}
                    className={`btn-secondary px-3 py-1.5 ${paginaActual <= 1 ? "pointer-events-none opacity-40" : ""}`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Link>
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    Página {paginaActual} de {totalPaginas}
                  </span>
                  <Link
                    href={buildUrl({ page: String(Math.min(totalPaginas, paginaActual + 1)) })}
                    className={`btn-secondary px-3 py-1.5 ${paginaActual >= totalPaginas ? "pointer-events-none opacity-40" : ""}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
