"use client";

import { useEffect, useState } from "react";
import { Pencil, Trash2, Plus, X } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const PRESENTACIONES = ["PAQUETE", "BULTO_CERRADO", "PALLET_COMPLETO"];

const FORM_VACIO = {
  id: "",
  nombre: "",
  descripcion: "",
  sku: "",
  marcaId: "",
  categoriaId: "",
  imagenUrl: "",
  presentacion: "PAQUETE",
  unidadesPorPaquete: 1,
  paquetesPorBulto: 12,
  bultosPorPallet: 40,
  costoUnitario: 0,
  precioPaquete: 0,
  precioBulto: "",
  precioPallet: "",
  stockPaquetes: 0,
  minimoCompraPaquetes: 1,
  descuentoBultoPct: "",
  descuentoPalletPct: "",
  activo: true,
  imagenes: [] as string[],
};

export default function AdminProductosPage() {
  const [productos, setProductos] = useState<any[]>([]);
  const [marcas, setMarcas] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState<any>(FORM_VACIO);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState("");
  const POR_PAGINA = 10;

  async function cargarTodo() {
    const [pRes, mRes, cRes] = await Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/marcas").then((r) => r.json()),
      fetch("/api/categorias").then((r) => r.json()),
    ]);
    setProductos(pRes.productos || []);
    setMarcas(mRes.marcas || []);
    setCategorias(cRes.categorias || []);
  }

  useEffect(() => {
    cargarTodo();
  }, []);

  function abrirNuevo() {
    setForm({
      ...FORM_VACIO,
      marcaId: marcas[0]?.id || "",
      categoriaId: categorias[0]?.id || "",
    });
    setEditando(false);
    setError("");
    setModalAbierto(true);
  }

  function abrirEditar(p: any) {
    setForm({
      id: p.id,
      nombre: p.nombre,
      descripcion: p.descripcion || "",
      sku: p.sku,
      marcaId: p.marcaId,
      categoriaId: p.categoriaId,
      imagenUrl: p.imagenUrl || "",
      presentacion: p.presentacion,
      unidadesPorPaquete: p.unidadesPorPaquete,
      paquetesPorBulto: p.paquetesPorBulto,
      bultosPorPallet: p.bultosPorPallet,
      costoUnitario: p.costoUnitario,
      precioPaquete: p.precioPaquete,
      precioBulto: p.precioBulto ?? "",
      precioPallet: p.precioPallet ?? "",
      stockPaquetes: p.stockPaquetes,
      minimoCompraPaquetes: p.minimoCompraPaquetes,
      descuentoBultoPct: p.descuentoBultoPct ?? "",
      descuentoPalletPct: p.descuentoPalletPct ?? "",
      activo: p.activo,
      imagenes: (p.imagenes || []).map((img: any) => img.url),
    });
    setEditando(true);
    setError("");
    setModalAbierto(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const url = editando ? `/api/admin/products/${form.id}` : "/api/admin/products";
      const method = editando ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo guardar.");
        return;
      }
      setModalAbierto(false);
      cargarTodo();
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Dar de baja este producto? Dejará de mostrarse en el catálogo.")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    cargarTodo();
  }

  const productosFiltrados = productos.filter((p) =>
    p.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );
  const totalPaginas = Math.max(1, Math.ceil(productosFiltrados.length / POR_PAGINA));
  const productosPagina = productosFiltrados.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <div className="flex items-center gap-2">
          <input
            className="input w-56"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(1);
            }}
          />
          <button onClick={abrirNuevo} disabled={!marcas.length || !categorias.length} className="btn-primary">
            <Plus className="h-4 w-4" /> Nuevo producto
          </button>
        </div>
      </div>

      {(!marcas.length || !categorias.length) && (
        <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
          Necesitás al menos una marca y una categoría cargadas (vía seed) antes de crear productos.
        </p>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-400 dark:border-slate-700">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Marca</th>
              <th className="p-3">Precio paq.</th>
              <th className="p-3">Stock (paq.)</th>
              <th className="p-3">Mín. compra</th>
              <th className="p-3">Estado</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {productosPagina.map((p) => (
              <tr key={p.id} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                <td className="p-3 font-medium">{p.nombre}</td>
                <td className="p-3">{p.marca?.nombre}</td>
                <td className="p-3">${p.precioPaquete.toFixed(0)}</td>
                <td className="p-3">{p.stockPaquetes}</td>
                <td className="p-3">{p.minimoCompraPaquetes}</td>
                <td className="p-3">
                  <span className={`badge ${p.activo ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800"}`}>
                    {p.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => abrirEditar(p)} className="text-slate-400 hover:text-brand-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => eliminar(p.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {productosFiltrados.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-slate-400">
                  No hay productos que coincidan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button
            className="btn-secondary px-3 py-1.5"
            disabled={pagina <= 1}
            onClick={() => setPagina((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Página {pagina} de {totalPaginas}
          </span>
          <button
            className="btn-secondary px-3 py-1.5"
            disabled={pagina >= totalPaginas}
            onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* MODAL DE ALTA/EDICIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editando ? "Editar producto" : "Nuevo producto"}</h2>
              <button onClick={() => setModalAbierto(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">SKU</label>
                  <input className="input" required disabled={editando} value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
                </div>
                <ImageUploader
                  value={form.imagenUrl}
                  onChange={(url) => setForm({ ...form, imagenUrl: url })}
                  carpeta="products"
                />
              </div>

              {/* Galería adicional de fotos */}
              <div>
                <label className="label mb-2">Galería adicional (opcional)</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {form.imagenes.map((url: string, i: number) => (
                    <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Foto ${i + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, imagenes: form.imagenes.filter((_: string, idx: number) => idx !== i) })}
                        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="mt-2">
                  <ImageUploader
                    value=""
                    onChange={(url) => url && setForm({ ...form, imagenes: [...form.imagenes, url] })}
                    carpeta="products"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">
                  Se van a mostrar en la ficha del producto, además de la foto de portada.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label">Marca</label>
                  <select className="input" required value={form.marcaId} onChange={(e) => setForm({ ...form, marcaId: e.target.value })}>
                    {marcas.map((m) => (
                      <option key={m.id} value={m.id}>{m.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Categoría</label>
                  <select className="input" required value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}>
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Presentación por defecto</label>
                <select className="input" value={form.presentacion} onChange={(e) => setForm({ ...form, presentacion: e.target.value })}>
                  {PRESENTACIONES.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <p className="text-xs font-bold uppercase text-slate-400">Conversión de unidades</p>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="label">Unid. por paquete</label>
                  <input className="input" type="number" min={1} value={form.unidadesPorPaquete} onChange={(e) => setForm({ ...form, unidadesPorPaquete: e.target.value })} />
                </div>
                <div>
                  <label className="label">Paquetes por bulto</label>
                  <input className="input" type="number" min={1} value={form.paquetesPorBulto} onChange={(e) => setForm({ ...form, paquetesPorBulto: e.target.value })} />
                </div>
                <div>
                  <label className="label">Bultos por pallet</label>
                  <input className="input" type="number" min={1} value={form.bultosPorPallet} onChange={(e) => setForm({ ...form, bultosPorPallet: e.target.value })} />
                </div>
              </div>

              <p className="text-xs font-bold uppercase text-slate-400">Precios y costo</p>
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="label">Costo unit.</label>
                  <input className="input" type="number" step="0.01" value={form.costoUnitario} onChange={(e) => setForm({ ...form, costoUnitario: e.target.value })} />
                </div>
                <div>
                  <label className="label">Precio paquete *</label>
                  <input className="input" type="number" step="0.01" required value={form.precioPaquete} onChange={(e) => setForm({ ...form, precioPaquete: e.target.value })} />
                </div>
                <div>
                  <label className="label">Precio bulto</label>
                  <input className="input" type="number" step="0.01" value={form.precioBulto} onChange={(e) => setForm({ ...form, precioBulto: e.target.value })} placeholder="auto" />
                </div>
                <div>
                  <label className="label">Precio pallet</label>
                  <input className="input" type="number" step="0.01" value={form.precioPallet} onChange={(e) => setForm({ ...form, precioPallet: e.target.value })} placeholder="auto" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="label">Desc. % bulto</label>
                  <input className="input" type="number" value={form.descuentoBultoPct} onChange={(e) => setForm({ ...form, descuentoBultoPct: e.target.value })} />
                </div>
                <div>
                  <label className="label">Desc. % pallet</label>
                  <input className="input" type="number" value={form.descuentoPalletPct} onChange={(e) => setForm({ ...form, descuentoPalletPct: e.target.value })} />
                </div>
                <div>
                  <label className="label">Stock (paquetes)</label>
                  <input className="input" type="number" value={form.stockPaquetes} onChange={(e) => setForm({ ...form, stockPaquetes: e.target.value })} />
                </div>
                <div>
                  <label className="label">Mínimo compra (paq.)</label>
                  <input className="input" type="number" min={1} value={form.minimoCompraPaquetes} onChange={(e) => setForm({ ...form, minimoCompraPaquetes: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="label">Descripción</label>
                <textarea className="input" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
              </div>

              {editando && (
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} />
                  Producto activo (visible en catálogo)
                </label>
              )}

              {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn-secondary">
                  Cancelar
                </button>
                <button type="submit" disabled={guardando} className="btn-primary">
                  {guardando ? "Guardando..." : "Guardar producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
