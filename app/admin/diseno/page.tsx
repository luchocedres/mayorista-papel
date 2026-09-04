"use client";

import { useEffect, useState } from "react";
import ImageUploader from "@/components/admin/ImageUploader";

export default function AdminDisenoPage() {
  const [heroImagenUrl, setHeroImagenUrl] = useState("");
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  useEffect(() => {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => setHeroImagenUrl(d.config?.heroImagenUrl || ""))
      .finally(() => setCargando(false));
  }, []);

  async function guardar() {
    setGuardando(true);
    setGuardado(false);
    try {
      await fetch("/api/admin/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImagenUrl }),
      });
      setGuardado(true);
      setTimeout(() => setGuardado(false), 2500);
    } finally {
      setGuardando(false);
    }
  }

  if (cargando) return <p className="text-sm text-slate-500">Cargando...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="mb-1 text-2xl font-bold">Diseño</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Subí una foto para el fondo del banner principal de la Home. Si no subís nada, se usa
        un fondo ilustrado por defecto.
      </p>

      <div className="card p-5">
        <ImageUploader value={heroImagenUrl} onChange={setHeroImagenUrl} carpeta="brands" />
        <p className="mt-2 text-xs text-slate-400">
          Recomendado: una foto horizontal, de depósito, pallets o productos — algo que se vea
          bien con texto blanco encima.
        </p>

        <div className="mt-5 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <button onClick={guardar} disabled={guardando} className="btn-primary">
            {guardando ? "Guardando..." : "Guardar cambios"}
          </button>
          {guardado && <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Guardado ✓</span>}
        </div>
      </div>
    </div>
  );
}
