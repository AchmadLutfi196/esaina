import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Semua halaman baca sesi (runtime). Cache Components tidak memberi nilai
  // untuk MVP ini dan memaksa Suspense di setiap route; dimatikan.
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
