"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [nombre, setNombre] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const d = await fetch("/api/admin/categorias").then((r) => r.json());
    setCategorias(d.categorias || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setNombre("");
    setEditId(null);
    setError("");
    setModal(true);
  }

  function abrirEditar(c: any) {
    setNombre(c.nombre);
    setEditId(c.id);
    setError("");
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const url = editId ? `/api/admin/categorias/${editId}` : "/api/admin/categorias";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre }),
      });
      const data = await res.json();
      if (!res.ok) return setError(data.error);
      setModal(false);
      cargar();
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta categoría?")) return;
    const res = await fetch(`/api/admin/categorias/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    cargar();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categorías</h1>
        <button onClick={abrirNuevo} className="btn-primary">
          <Plus className="h-4 w-4" /> Nueva categoría
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {categorias.map((c) => (
          <div key={c.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="font-semibold">{c.nombre}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{c._count?.productos ?? 0} producto(s)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => abrirEditar(c)} className="text-slate-400 hover:text-brand-600">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => eliminar(c.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {categorias.length === 0 && <p className="text-sm text-slate-400">No hay categorías cargadas todavía.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editId ? "Editar categoría" : "Nueva categoría"}</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" required value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}
              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-700">
                <button type="button" onClick={() => setModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" disabled={guardando} className="btn-primary">{guardando ? "Guardando..." : "Guardar"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
