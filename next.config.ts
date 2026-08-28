import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false,
    // Forza SWC WASM per compatibilità con glibc vecchi
    swcBinary: 'wasm',
  },
  swcMinify: false,
  output: 'standalone',
};

export default nextConfig;