"use client";

import { FileDown } from "lucide-react";
import type { ItemCarrito } from "@/store/cartStore";
import { precioUnitario } from "@/lib/pricing";

const labelPresentacion: Record<string, string> = {
  PAQUETE: "Paquete",
  BULTO_CERRADO: "Bulto cerrado",
  PALLET_COMPLETO: "Pallet completo",
};

export default function PdfPresupuestoButton({
  items,
  nombreComercio,
  direccion,
}: {
  items: ItemCarrito[];
  nombreComercio?: string;
  direccion?: string;
}) {
  async function generarPdf() {
    // Import dinámico: jsPDF sólo se carga en el cliente al hacer click
    const { default: jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default;

    const doc = new jsPDF();
    const fecha = new Date().toLocaleDateString("es-AR");

    doc.setFontSize(18);
    doc.setTextColor(20, 40, 90);
    doc.text("Presupuesto de Pedido", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(90, 90, 90);
    doc.text(`Fecha: ${fecha}`, 14, 28);
    if (nombreComercio) doc.text(`Comercio: ${nombreComercio}`, 14, 34);
    if (direccion) doc.text(`Entrega: ${direccion}`, 14, 40);

    const filas = items.map((it) => {
      const precio = precioUnitario(it.producto, it.presentacion);
      return [
        it.producto.nombre,
        labelPresentacion[it.presentacion],
        String(it.cantidad),
        `$${precio.toFixed(2)}`,
        `$${(precio * it.cantidad).toFixed(2)}`,
      ];
    });

    autoTable(doc, {
      startY: 46,
      head: [["Producto", "Presentación", "Cant.", "Precio unit.", "Subtotal"]],
      body: filas,
      headStyles: { fillColor: [26, 112, 245] },
      styles: { fontSize: 9 },
    });

    const total = items.reduce(
      (acc, it) => acc + precioUnitario(it.producto, it.presentacion) * it.cantidad,
      0
    );

    // @ts-ignore -- lastAutoTable lo agrega el plugin
    const finalY = doc.lastAutoTable.finalY || 60;
    doc.setFontSize(13);
    doc.setTextColor(20, 40, 90);
    doc.text(`TOTAL: $${total.toFixed(2)}`, 14, finalY + 12);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      "Presupuesto sin validez fiscal. Precios sujetos a confirmación por WhatsApp.",
      14,
      finalY + 22
    );

    doc.save(`presupuesto-${Date.now()}.pdf`);
  }

  return (
    <button onClick={generarPdf} className="btn-secondary" disabled={items.length === 0}>
      <FileDown className="h-4 w-4" />
      Descargar presupuesto PDF
    </button>
  );
}
