import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  // La presentación 3D completa vive como estáticos en public/analiticas-3d.
  // Redirección (no rewrite): sus scripts son rutas relativas y necesitan la
  // URL con la carpeta para resolverse.
  async redirects() {
    return [{ source: "/analiticas-3d", destination: "/analiticas-3d/index.html", permanent: false }];
  },
  images: {
    // AVIF primero (mejor compresión); webp como fallback. next/image sirve
    // las imágenes redimensionadas y en formato moderno automáticamente.
    formats: ["image/avif", "image/webp"],
  },
  turbopack: {
    // inferencejs (Roboflow on-device) arrastra node-fetch/fetch-blob, que usan
    // APIs de Node y rompen el bundle de navegador. Los aliaseamos a shims que
    // reexportan los globales nativos del browser (fetch, Blob, …).
    resolveAlias: {
      "node-fetch": "./src/lib/shims/node-fetch.js",
      "fetch-blob": "./src/lib/shims/fetch-blob.js",
      "fetch-blob/from.js": "./src/lib/shims/fetch-blob.js",
    },
  },
};

export default nextConfig;
