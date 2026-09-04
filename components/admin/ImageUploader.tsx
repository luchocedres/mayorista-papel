"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Upload, Loader2, X, ImageIcon } from "lucide-react";

export default function ImageUploader({
  value,
  onChange,
  carpeta = "products",
}: {
  value: string;
  onChange: (url: string) => void;
  carpeta?: "products" | "brands";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file: File) {
    setError("");
    setSubiendo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("carpeta", carpeta);
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo subir la imagen.");
        return;
      }
      onChange(data.url);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div>
      <label className="label">Imagen</label>
      <div className="flex items-center gap-3">
        <div className="relative flex h-20 w-20 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
          {value ? (
            <Image src={value} alt="Vista previa" fill className="object-cover" />
          ) : (
            <ImageIcon className="h-6 w-6 text-slate-300" />
          )}
        </div>

        <div className="flex-1">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={subiendo}
              className="btn-secondary py-1.5 text-xs"
            >
              {subiendo ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
              {subiendo ? "Subiendo..." : value ? "Cambiar imagen" : "Subir imagen"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange("")} className="btn-secondary py-1.5 text-xs">
                <X className="h-3.5 w-3.5" /> Quitar
              </button>
            )}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">JPG, PNG, WEBP o GIF. Máx. 5MB.</p>
          {error && <p className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
}
