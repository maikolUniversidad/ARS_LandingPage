import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
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
