"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Star } from "lucide-react";
import ImageUploader from "@/components/admin/ImageUploader";

const VACIO = { id: "", nombre: "", logoUrl: "", destacada: false };

export default function AdminMarcasPage() {
  const [marcas, setMarcas] = useState<any[]>([]);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<any>(VACIO);
  const [editando, setEditando] = useState(false);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const d = await fetch("/api/admin/marcas").then((r) => r.json());
    setMarcas(d.marcas || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  function abrirNuevo() {
    setForm(VACIO);
    setEditando(false);
    setError("");
    setModal(true);
  }

  function abrirEditar(m: any) {
    setForm({ id: m.id, nombre: m.nombre, logoUrl: m.logoUrl || "", destacada: m.destacada });
    setEditando(true);
    setError("");
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError("");
    try {
      const url = editando ? `/api/admin/marcas/${form.id}` : "/api/admin/marcas";
      const res = await fetch(url, {
        method: editando ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
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
    if (!confirm("¿Eliminar esta marca?")) return;
    const res = await fetch(`/api/admin/marcas/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) return alert(data.error);
    cargar();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marcas</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            La marca "destacada" es la que aparece en el banner principal de la Home (ej: New Pel).
          </p>
        </div>
        <button onClick={abrirNuevo} className="btn-primary">
          <Plus className="h-4 w-4" /> Nueva marca
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {marcas.map((m) => (
          <div key={m.id} className="card flex items-center justify-between p-4">
            <div>
              <p className="flex items-center gap-1 font-semibold">
                {m.nombre}
                {m.destacada && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{m._count?.productos ?? 0} producto(s)</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => abrirEditar(m)} className="text-slate-400 hover:text-brand-600">
                <Pencil className="h-4 w-4" />
              </button>
              <button onClick={() => eliminar(m.id)} className="text-slate-400 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {marcas.length === 0 && <p className="text-sm text-slate-400">No hay marcas cargadas todavía.</p>}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 dark:bg-slate-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold">{editando ? "Editar marca" : "Nueva marca"}</h2>
              <button onClick={() => setModal(false)}><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={guardar} className="space-y-4">
              <div>
                <label className="label">Nombre</label>
                <input className="input" required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
              </div>
              <ImageUploader
                value={form.logoUrl}
                onChange={(url) => setForm({ ...form, logoUrl: url })}
                carpeta="brands"
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.destacada} onChange={(e) => setForm({ ...form, destacada: e.target.checked })} />
                Marca destacada (banner de la Home)
              </label>
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
