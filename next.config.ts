import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.8",
    "192.168.1.8:3000",
    "localhost",
    "localhost:3000",
    "127.0.0.1",
    "127.0.0.1:3000",
  ],
  // Tailwind CSS v4 dijalankan lewat loader Turbopack. Tanpa entri ini
  // `@import "tailwindcss"` dan `@theme` tidak diproses sehingga seluruh
  // utility class hilang dan halaman tampil tanpa style.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
