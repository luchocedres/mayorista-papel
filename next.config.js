/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // Desactivado: el optimizador de imágenes de Next.js necesita el paquete
    // nativo "sharp" para funcionar fuera de Vercel. Sin él, las fotos
    // muestran el ícono de "imagen rota" en producción (Render, etc).
    // Para un catálogo como este no hace falta optimización on-the-fly.
    unoptimized: true,
  },
};
module.exports = nextConfig;
