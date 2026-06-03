import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",
  images: {
    // AVIF primero (mejor compresión); webp como fallback. next/image sirve
    // las imágenes redimensionadas y en formato moderno automáticamente.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
