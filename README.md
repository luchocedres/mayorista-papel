# New Pel Mayorista — Plataforma B2B

Plataforma de venta mayorista de papel y productos de limpieza (marca destacada **New Pel**),
construida con **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Prisma**.

## ⚠️ Importante sobre este entrego

Este proyecto fue generado y probado en un entorno de desarrollo con acceso a internet
restringido (no tiene salida a `binaries.prisma.sh`), así que **no pude ejecutar
`prisma generate` / `prisma db push` ni levantar el servidor de desarrollo para verificar
el build final acá mismo**. El código está completo y revisado a mano, pero corré los
pasos de abajo en tu máquina (con internet normal) para la primera puesta en marcha:
ahí Prisma va a poder descargar sus binarios sin problema.

## 1. Instalación

```bash
npm install
```

## 2. Variables de entorno

Ya incluí un archivo `.env` con valores por defecto para desarrollo local:

```
DATABASE_URL="file:./dev.db"        # SQLite local, para arrancar rápido
JWT_SECRET="cambiar-este-secreto-en-produccion"
NEXT_PUBLIC_WHATSAPP_NUMERO="5493442000000"   # número real del negocio, sin "+"
```

Para producción real: cambiá `DATABASE_URL` a una conexión Postgres (Render, Supabase,
Neon, etc.) y en `prisma/schema.prisma` cambiá `provider = "sqlite"` por
`provider = "postgresql"`. El resto del schema no necesita tocarse.

## 3. Base de datos

```bash
npx prisma generate
npx prisma db push      # crea las tablas según el schema
npm run db:seed         # carga marcas, categorías, productos de ejemplo y el admin
```

El seed crea un usuario administrador:
- **Email:** admin@newpel.com
- **Password:** admin123

(Cambiá esta contraseña antes de llevarlo a producción.)

### Si ya tenías el proyecto corriendo de antes (actualización)

Esta versión agrega dos tablas nuevas al schema (galería de fotos por producto y
configuración del hero). Si ya tenías `dev.db` creado, sólo hace falta:

```bash
npx prisma generate
npx prisma db push
```

No hace falta borrar la base ni volver a correr el seed — `db push` sólo agrega lo que
falta, no toca los datos que ya tenías cargados.

## 4. Correr en desarrollo

```bash
npm run dev
```

Abrí `http://localhost:3000`.

- **Tienda (comerciantes):** `/`, `/catalogo`, `/producto/[id]`, `/carrito`, `/cuenta`
- **Registro/Login:** `/registro`, `/login`
- **Panel admin:** `/admin` (entrá con el usuario admin del seed)

## Estructura del proyecto

```
app/
  page.tsx                    Home (banner New Pel, categorías, destacados)
  (shop)/catalogo/             Catálogo con filtros (categoría, marca, presentación)
  (shop)/producto/[id]/        Ficha de producto + calculadora bulto/pallet
  (shop)/carrito/              Carrito, validación de mínimo, PDF, checkout WhatsApp
  (shop)/cuenta/                Historial de pedidos + "Repetir pedido"
  (shop)/login|registro/       Autenticación de comerciantes
  admin/                       Panel: métricas, catálogo (CRUD), pedidos
  api/                         Todas las rutas de backend (Next.js Route Handlers)
components/                    Navbar, SearchBar, ProductCard, calculadora, PDF, WhatsApp
lib/                           prisma client, auth (JWT), pricing (conversión de unidades), whatsapp
store/                         Carrito global (Zustand + localStorage)
prisma/schema.prisma           Modelo de datos completo
prisma/seed.js                 Datos de ejemplo
```

## Cómo funciona la conversión de unidades

Cada producto define:
- `paquetesPorBulto`
- `bultosPorPallet`

`lib/pricing.ts` convierte cualquier cantidad comprada en **PAQUETE / BULTO_CERRADO /
PALLET_COMPLETO** a su equivalente en paquetes (para stock y mínimos), y calcula el precio
unitario aplicando los descuentos por volumen (`descuentoBultoPct`, `descuentoPalletPct`)
si no hay un precio fijo cargado para esa presentación.

## Checkout doble vía

Al tocar "Finalizar pedido por WhatsApp" (`components/WhatsAppCheckoutButton.tsx`):
1. Se guarda el pedido estructurado en la base vía `POST /api/orders` (aparece al instante
   en `/admin/pedidos` y en el historial del comerciante).
2. Se abre WhatsApp Web/App con un mensaje ya formateado, al número configurado en
   `NEXT_PUBLIC_WHATSAPP_NUMERO`.

## Estados de pedido y avisos por WhatsApp

Desde **Admin → Pedidos** podés cambiar el estado con el desplegable de cada pedido
(Pendiente → Confirmado → En preparación → Enviado → Entregado, o Cancelado). Al cambiarlo,
se abre automáticamente una pestaña de WhatsApp con el mensaje ya redactado para el cliente
— sólo falta que apretés "Enviar" ahí. También hay un botón "Avisar" para reenviar el aviso
del estado actual sin cambiar nada.

⚠️ Esto **no** es un envío 100% automático/silencioso: WhatsApp no permite mandar mensajes
sin intervención humana salvo que se contrate la API oficial de WhatsApp Business (a través
de Meta o un proveedor como Twilio), que tiene costo y proceso de aprobación. Si en algún
momento quieren automatizar esto del todo, es el paso que habría que dar.

## Diseño del banner principal

En **Admin → Diseño** se puede subir una foto para el fondo del hero de la Home. Si no se
sube ninguna, se usa un fondo ilustrado (SVG) por defecto para que igual se vea prolijo.

## Galería de fotos, navegación y recomendados en la ficha de producto

- Desde **Admin → Catálogo**, cada producto tiene una foto de portada (la que se ve en las
  cards y el buscador) y una galería adicional opcional con varias fotos.
- En la ficha del producto (`/producto/[id]`) hay miniaturas para navegar la galería, botones
  de "producto anterior/siguiente" dentro de la misma categoría, y una sección "también te
  recomendamos" con 4 productos al azar.

## Ofertas en la Home

Los productos que tengan cargado un `% de descuento por bulto o pallet` en el admin aparecen
automáticamente en el carrusel de "Ofertas por volumen" de la Home, con auto-rotación cada
3.5 segundos (se pausa al pasar el mouse).

## Sobre los roles (por qué "no me toma como admin")

El formulario de `/registro` **siempre** crea cuentas de tipo comerciante — es lo correcto,
para que cualquier cliente pueda darse de alta. La única forma de tener una cuenta admin es:

1. La cuenta que crea `npm run db:seed` (`admin@newpel.com` / `admin123`), o
2. Que un admin existente le dé permisos a otra cuenta desde **Admin → Clientes**, con el
   botón del escudo (✔️ da admin / 🚫 lo quita). Ahí también podés activar/desactivar
   comercios. El sistema no te deja sacarte el rol a vos mismo ni quedarte sin ningún admin.

## ⚠️ Si ya habías corrido `prisma db push` antes y te fallaba el login

Versiones anteriores del schema usaban `enum` de Prisma y un `@default(autoincrement())`
en un campo que no era la clave primaria — **SQLite no soporta ninguna de las dos cosas**,
así que `prisma db push` fallaba con un error de validación y la base nunca llegaba a
crearse (por eso el usuario admin "no existía" y el login daba credenciales inválidas). Ya
está corregido: los enums ahora son `String` simple y el número de pedido se calcula a mano
en `app/api/orders/route.ts` en vez de pedirle autoincrement a SQLite.

Si ya tenías un `dev.db` de un intento anterior, borralo antes de continuar (puede haber
quedado en un estado parcial o vacío):

```bash
# Windows (PowerShell), parado en la carpeta del proyecto:
del prisma\dev.db

# o simplemente borralo desde el Explorador de archivos

npx prisma generate
npx prisma db push
npm run db:seed
```

## Gestión de Marcas, Categorías y Clientes

Ya no hace falta tocar la base de datos ni el seed para esto — están en el panel:
- **Admin → Marcas**: alta/edición/borrado, y marcar cuál es la "destacada" (banner de la Home).
- **Admin → Categorías**: alta/edición/borrado.
- **Admin → Clientes**: listado de comercios registrados, dar/quitar admin, activar/desactivar cuentas.

## Subida de imágenes

Desde **Admin → Catálogo** y **Admin → Marcas** ahora se sube el archivo directamente
(JPG/PNG/WEBP/GIF, máx. 5MB) — se guarda en `public/uploads/products` o `public/uploads/brands`
y queda accesible en `/uploads/...`.

⚠️ Ojo si en el futuro alojás esto en un hosting con sistema de archivos efímero
(Render free tier, Vercel serverless, etc.): las imágenes subidas así se pierden en cada
redeploy. Para producción real conviene subir a un storage externo (Cloudinary, S3,
Supabase Storage) — el componente `components/admin/ImageUploader.tsx` y la ruta
`app/api/admin/upload/route.ts` están aislados justamente para poder cambiar el destino
del archivo sin tocar el resto de la app.

## Pendientes sugeridos para producción

- Notificación por email cuando entra un pedido nuevo (lo dejamos para más adelante).
- Rate limiting / captcha en registro y login.
- Migrar `DATABASE_URL` a Postgres antes de ir a producción.
- Si subís a un hosting con filesystem efímero, migrar la subida de imágenes a un storage externo (ver arriba).
