// =====================================================================
// Lógica central de conversión de unidades y precios.
// Un mismo producto se puede comprar en 3 presentaciones:
//   PAQUETE          -> unidad mínima de venta
//   BULTO_CERRADO    -> agrupa N paquetes (producto.paquetesPorBulto)
//   PALLET_COMPLETO  -> agrupa M bultos (producto.bultosPorPallet)
// =====================================================================

export type Presentacion = "PAQUETE" | "BULTO_CERRADO" | "PALLET_COMPLETO";

export interface ProductoPricingInput {
  precioPaquete: number;
  precioBulto?: number | null;
  precioPallet?: number | null;
  paquetesPorBulto: number;
  bultosPorPallet: number;
  descuentoBultoPct?: number | null;
  descuentoPalletPct?: number | null;
  minimoCompraPaquetes: number;
  stockPaquetes: number;
}

/** Convierte una cantidad en una presentación dada, a su equivalente en PAQUETES */
export function aPaquetes(
  producto: Pick<ProductoPricingInput, "paquetesPorBulto" | "bultosPorPallet">,
  presentacion: Presentacion,
  cantidad: number
): number {
  if (presentacion === "PAQUETE") return cantidad;
  if (presentacion === "BULTO_CERRADO") return cantidad * producto.paquetesPorBulto;
  // PALLET_COMPLETO
  return cantidad * producto.paquetesPorBulto * producto.bultosPorPallet;
}

/** Precio unitario efectivo para una presentación, aplicando descuento por volumen si no hay precio fijo cargado */
export function precioUnitario(
  producto: ProductoPricingInput,
  presentacion: Presentacion
): number {
  if (presentacion === "PAQUETE") return producto.precioPaquete;

  if (presentacion === "BULTO_CERRADO") {
    if (producto.precioBulto) return producto.precioBulto;
    const base = producto.precioPaquete * producto.paquetesPorBulto;
    const desc = producto.descuentoBultoPct ?? 0;
    return base * (1 - desc / 100);
  }

  // PALLET_COMPLETO
  if (producto.precioPallet) return producto.precioPallet;
  const baseBulto = producto.precioBulto
    ? producto.precioBulto
    : producto.precioPaquete * producto.paquetesPorBulto * (1 - (producto.descuentoBultoPct ?? 0) / 100);
  const basePallet = baseBulto * producto.bultosPorPallet;
  const descPallet = producto.descuentoPalletPct ?? 0;
  return basePallet * (1 - descPallet / 100);
}

/** Subtotal de una línea (cantidad ya en la unidad de la presentación elegida) */
export function subtotalLinea(
  producto: ProductoPricingInput,
  presentacion: Presentacion,
  cantidad: number
) {
  return precioUnitario(producto, presentacion) * cantidad;
}

/** Texto legible de conversión, ej: "1 pallet = 40 bultos = 480 paquetes" */
export function textoConversion(producto: {
  paquetesPorBulto: number;
  bultosPorPallet: number;
}) {
  const paquetesPorPallet = producto.paquetesPorBulto * producto.bultosPorPallet;
  return {
    bultoEnPaquetes: `1 bulto = ${producto.paquetesPorBulto} paquetes`,
    palletEnBultos: `1 pallet = ${producto.bultosPorPallet} bultos`,
    palletEnPaquetes: `1 pallet = ${paquetesPorPallet} paquetes`,
  };
}

/** Valida si el carrito completo cumple el monto/cantidad mínima de compra */
export function validarMinimoCarrito(
  items: { minimoCompraPaquetes: number; cantidadPaquetesEquivalente: number; productoNombre: string }[]
) {
  const errores: string[] = [];
  for (const item of items) {
    if (item.cantidadPaquetesEquivalente < item.minimoCompraPaquetes) {
      errores.push(
        `${item.productoNombre}: mínimo de compra es ${item.minimoCompraPaquetes} paquetes (llevás ${item.cantidadPaquetesEquivalente}).`
      );
    }
  }
  return { valido: errores.length === 0, errores };
}
