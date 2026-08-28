import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabilita Turbopack (usa SWC che richiede glibc 2.29+)
  // Usa Webpack per compatibilità con server con glibc vecchi
  experimental: {
    turbo: false,
  },
  // Disabilita minificazione SWC (usa terser/webpack)
  swcMinify: false,
  // Output standalone per hosting Node.js
  output: 'standalone',
};

export default nextConfig;