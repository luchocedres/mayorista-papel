"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff, Ban, CheckCircle } from "lucide-react";

export default function AdminClientesPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState<string | null>(null);

  async function cargar() {
    const d = await fetch("/api/admin/clientes").then((r) => r.json());
    setUsuarios(d.usuarios || []);
    setCargando(false);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function actualizar(id: string, body: any) {
    setActualizando(id);
    try {
      const res = await fetch(`/api/admin/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.error);
      cargar();
    } finally {
      setActualizando(null);
    }
  }

  return (
    <div>
      <h1 className="mb-1 text-2xl font-bold">Clientes registrados</h1>
      <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
        Acá podés dar permisos de administrador a otra persona (por ejemplo, un socio) sin tocar la
        base de datos, o desactivar cuentas de comercios que ya no operan con vos.
      </p>

      {cargando ? (
        <p className="text-sm text-slate-500">Cargando...</p>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 text-left text-xs uppercase text-slate-400 dark:border-slate-700">
              <tr>
                <th className="p-3">Comercio</th>
                <th className="p-3">Contacto</th>
                <th className="p-3">CUIT/DNI</th>
                <th className="p-3">Pedidos</th>
                <th className="p-3">Rol</th>
                <th className="p-3">Estado</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-none dark:border-slate-800">
                  <td className="p-3 font-medium">{u.nombreComercio}</td>
                  <td className="p-3 text-xs">
                    {u.email}
                    <br />
                    {u.telefono}
                  </td>
                  <td className="p-3">{u.cuitODni}</td>
                  <td className="p-3">{u.cantidadPedidos}</td>
                  <td className="p-3">
                    <span className={`badge ${u.rol === "ADMIN" ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}>
                      {u.rol === "ADMIN" ? "Administrador" : "Comerciante"}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`badge ${u.activo ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" : "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300"}`}>
                      {u.activo ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      {u.rol === "ADMIN" ? (
                        <button
                          disabled={actualizando === u.id}
                          onClick={() => actualizar(u.id, { rol: "COMERCIANTE" })}
                          title="Quitar permisos de admin"
                          className="text-slate-400 hover:text-amber-600"
                        >
                          <ShieldOff className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          disabled={actualizando === u.id}
                          onClick={() => actualizar(u.id, { rol: "ADMIN" })}
                          title="Dar permisos de admin"
                          className="text-slate-400 hover:text-brand-600"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                      )}
                      {u.activo ? (
                        <button
                          disabled={actualizando === u.id}
                          onClick={() => actualizar(u.id, { activo: false })}
                          title="Desactivar cuenta"
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          disabled={actualizando === u.id}
                          onClick={() => actualizar(u.id, { activo: true })}
                          title="Reactivar cuenta"
                          className="text-slate-400 hover:text-emerald-500"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {usuarios.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    Todavía no hay comercios registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
