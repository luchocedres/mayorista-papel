// Número de WhatsApp Business del negocio (formato internacional, sin +)
export const WHATSAPP_NUMERO = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || "5493442000000";

export interface ItemParaMensaje {
  nombre: string;
  presentacion: "PAQUETE" | "BULTO_CERRADO" | "PALLET_COMPLETO";
  cantidad: number;
  subtotal: number;
}

const labelPresentacion: Record<string, string> = {
  PAQUETE: "paquete(s)",
  BULTO_CERRADO: "bulto(s) cerrado(s)",
  PALLET_COMPLETO: "pallet(s) completo(s)",
};

export function armarMensajeWhatsApp(params: {
  nombreComercio: string;
  direccionEntrega: string;
  items: ItemParaMensaje[];
  total: number;
  numeroPedido?: number | string;
}) {
  const { nombreComercio, direccionEntrega, items, total, numeroPedido } = params;

  let msg = `*NUEVO PEDIDO${numeroPedido ? " #" + numeroPedido : ""}*\n`;
  msg += `Comercio: ${nombreComercio}\n`;
  msg += `Entrega: ${direccionEntrega}\n\n`;
  msg += `*Detalle:*\n`;
  items.forEach((it) => {
    msg += `• ${it.nombre} — ${it.cantidad} ${labelPresentacion[it.presentacion]} ($${it.subtotal.toFixed(2)})\n`;
  });
  msg += `\n*TOTAL: $${total.toFixed(2)}*\n\n`;
  msg += `Quedo a la espera para coordinar pago y logística. ¡Gracias!`;

  return msg;
}

export function linkWhatsApp(mensaje: string, numero: string = WHATSAPP_NUMERO) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

const labelEstado: Record<string, string> = {
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  ENTREGADO: "Entregado",
  CANCELADO: "Cancelado",
};

/** Mensaje para avisarle al cliente que cambió el estado de su pedido */
export function armarMensajeCambioEstado(params: {
  nombreComercio: string;
  numeroPedido: number;
  estadoNuevo: string;
}) {
  const { nombreComercio, numeroPedido, estadoNuevo } = params;
  const estadoTexto = labelEstado[estadoNuevo] || estadoNuevo;

  let msg = `Hola ${nombreComercio}! Te escribimos de New Pel Mayorista.\n\n`;
  msg += `Tu pedido *#${numeroPedido}* cambió de estado a: *${estadoTexto}*.\n\n`;

  if (estadoNuevo === "CONFIRMADO") msg += "Ya confirmamos tu pedido, en breve lo preparamos.";
  else if (estadoNuevo === "EN_PREPARACION") msg += "Lo estamos preparando en el depósito.";
  else if (estadoNuevo === "ENVIADO") msg += "Ya salió hacia tu dirección de entrega.";
  else if (estadoNuevo === "ENTREGADO") msg += "¡Gracias por tu compra!";
  else if (estadoNuevo === "CANCELADO") msg += "Cualquier duda, escribinos por acá.";

  return msg;
}

/** Link directo a WhatsApp de un cliente puntual (a partir de su teléfono) */
export function linkWhatsAppCliente(telefono: string, mensaje: string) {
  const limpio = telefono.replace(/[^\d]/g, "");
  return `https://wa.me/${limpio}?text=${encodeURIComponent(mensaje)}`;
}
