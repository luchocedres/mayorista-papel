import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { aPaquetes, precioUnitario, validarMinimoCarrito } from "@/lib/pricing";

export async function POST(req: NextRequest) {
  try {
    const { session } = await requireSession(); // cualquier usuario autenticado
    const { items, direccionEntrega } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "El carrito está vacío." }, { status: 400 });
    }

    // Traemos los productos reales de la DB para no confiar en precios del cliente
    const productos = await prisma.producto.findMany({
      where: { id: { in: items.map((i: any) => i.productoId) } },
    });

    const lineas = items.map((i: any) => {
      const producto = productos.find((p) => p.id === i.productoId);
      if (!producto) throw new Error("Producto inválido en el carrito.");
      const cantidadPaquetesEquivalente = aPaquetes(producto, i.presentacion, i.cantidad);
      const precio = precioUnitario(producto, i.presentacion);
      return {
        productoId: producto.id,
        productoNombre: producto.nombre,
        presentacion: i.presentacion,
        cantidad: i.cantidad,
        cantidadPaquetesEquivalente,
        precioUnitario: precio,
        subtotal: precio * i.cantidad,
        minimoCompraPaquetes: producto.minimoCompraPaquetes,
      };
    });

    // Validación de mínimo de compra en servidor (nunca confiar sólo en el cliente)
    const { valido, errores } = validarMinimoCarrito(lineas);
    if (!valido) {
      return NextResponse.json({ error: errores.join(" ") }, { status: 400 });
    }

    const subtotal = lineas.reduce((acc, l) => acc + l.subtotal, 0);

    // Número de pedido correlativo (SQLite no soporta autoincrement en un
    // campo que no es la clave primaria, así que lo calculamos acá).
    // Empieza en 1001 para que se vea "prolijo" en los mensajes de WhatsApp/PDF.
    const ultimoPedido = await prisma.pedido.findFirst({ orderBy: { numero: "desc" } });
    const numero = (ultimoPedido?.numero ?? 1000) + 1;

    const pedido = await prisma.pedido.create({
      data: {
        numero,
        usuarioId: session.userId,
        subtotal,
        total: subtotal,
        direccionEntrega: direccionEntrega || "",
        items: {
          create: lineas.map((l) => ({
            productoId: l.productoId,
            presentacion: l.presentacion,
            cantidad: l.cantidad,
            cantidadPaquetesEquivalente: l.cantidadPaquetesEquivalente,
            precioUnitario: l.precioUnitario,
            subtotal: l.subtotal,
          })),
        },
      },
      include: { items: true },
    });

    // Descuenta stock (en paquetes)
    for (const l of lineas) {
      await prisma.producto.update({
        where: { id: l.productoId },
        data: { stockPaquetes: { decrement: l.cantidadPaquetesEquivalente } },
      });
    }

    return NextResponse.json({ ok: true, pedido });
  } catch (err: any) {
    if (err.message === "NO_AUTENTICADO") {
      return NextResponse.json({ error: "Iniciá sesión para completar el pedido." }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ error: err.message || "No se pudo crear el pedido." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { session } = await requireSession();
    const pedidos = await prisma.pedido.findMany({
      where: { usuarioId: session.userId },
      include: { items: { include: { producto: true } } },
      orderBy: { creadoEn: "desc" },
    });
    return NextResponse.json({ pedidos });
  } catch {
    return NextResponse.json({ error: "No autenticado." }, { status: 401 });
  }
}
