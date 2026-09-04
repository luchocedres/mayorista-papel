import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { LayoutDashboard, Package, ClipboardList, Tags, FolderTree, Users, Palette } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionFromCookies();
  if (!session || session.rol !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6">
      <aside className="w-56 flex-shrink-0">
        <div className="card sticky top-20 p-3">
          <p className="mb-3 px-2 text-xs font-bold uppercase tracking-wide text-slate-400">
            Panel de administración
          </p>
          <nav className="flex flex-col gap-1">
            <Link href="/admin" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <LayoutDashboard className="h-4 w-4" /> Métricas
            </Link>
            <Link href="/admin/productos" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <Package className="h-4 w-4" /> Catálogo
            </Link>
            <Link href="/admin/marcas" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <Tags className="h-4 w-4" /> Marcas
            </Link>
            <Link href="/admin/categorias" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <FolderTree className="h-4 w-4" /> Categorías
            </Link>
            <Link href="/admin/pedidos" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <ClipboardList className="h-4 w-4" /> Pedidos
            </Link>
            <Link href="/admin/clientes" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <Users className="h-4 w-4" /> Clientes
            </Link>
            <Link href="/admin/diseno" className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
              <Palette className="h-4 w-4" /> Diseño
            </Link>
            <LogoutButton />
          </nav>
        </div>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
