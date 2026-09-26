import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Permite subir la imagen opcional de cada rutina (máximo 4 MB + margen del multipart).
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
