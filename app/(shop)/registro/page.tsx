"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";

interface SucursalForm {
  nombre: string;
  direccion: string;
  telefono: string;
}

export default function RegistroPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    nombreComercio: "",
    cuitODni: "",
    telefono: "",
    direccion: "",
  });
  const [sucursales, setSucursales] = useState<SucursalForm[]>([]);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function agregarSucursal() {
    setSucursales((s) => [...s, { nombre: "", direccion: "", telefono: "" }]);
  }

  function actualizarSucursal(idx: number, field: keyof SucursalForm, value: string) {
    setSucursales((s) => s.map((suc, i) => (i === idx ? { ...suc, [field]: value } : suc)));
  }

  function quitarSucursal(idx: number) {
    setSucursales((s) => s.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setCargando(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, sucursales }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo completar el registro.");
        return;
      }
      router.push("/cuenta");
      router.refresh();
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-1 text-2xl font-bold">Registrar mi comercio</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Creá tu cuenta de comerciante para acceder a precios y compra mayorista.
      </p>

      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Nombre del Local/Comercio *</label>
            <input className="input" required value={form.nombreComercio} onChange={(e) => update("nombreComercio", e.target.value)} />
          </div>
          <div>
            <label className="label">CUIT / DNI *</label>
            <input className="input" required value={form.cuitODni} onChange={(e) => update("cuitODni", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Teléfono *</label>
            <input className="input" required value={form.telefono} onChange={(e) => update("telefono", e.target.value)} />
          </div>
          <div>
            <label className="label">Dirección de entrega *</label>
            <input className="input" required value={form.direccion} onChange={(e) => update("direccion", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
          </div>
          <div>
            <label className="label">Contraseña *</label>
            <input className="input" type="password" required minLength={6} value={form.password} onChange={(e) => update("password", e.target.value)} />
          </div>
        </div>

        {/* SUCURSALES MÚLTIPLES */}
        <div className="border-t border-slate-200 pt-4 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <label className="label mb-0">Sucursales adicionales (opcional)</label>
            <button type="button" onClick={agregarSucursal} className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline dark:text-brand-400">
              <Plus className="h-4 w-4" /> Agregar sucursal
            </button>
          </div>

          {sucursales.map((suc, idx) => (
            <div key={idx} className="mt-3 grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-3 dark:border-slate-700">
              <input className="input" placeholder="Nombre sucursal" value={suc.nombre} onChange={(e) => actualizarSucursal(idx, "nombre", e.target.value)} />
              <input className="input" placeholder="Dirección" value={suc.direccion} onChange={(e) => actualizarSucursal(idx, "direccion", e.target.value)} />
              <div className="flex gap-2">
                <input className="input" placeholder="Teléfono" value={suc.telefono} onChange={(e) => actualizarSucursal(idx, "telefono", e.target.value)} />
                <button type="button" onClick={() => quitarSucursal(idx)} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>}

        <button type="submit" disabled={cargando} className="btn-primary w-full">
          {cargando ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}
