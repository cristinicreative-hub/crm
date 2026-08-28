import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false,
    // Forza SWC WASM (evita binari nativi che richiedono glibc 2.29+)
    swcBinary: 'wasm',
  },
  swcMinify: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@next/swc-linux-x64-gnu': false,
        '@next/swc-linux-x64-musl': false,
      };
    }
    return config;
  },
  output: 'standalone',
};

export default nextConfig;