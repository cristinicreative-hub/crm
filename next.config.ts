import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false,
  },
  swcMinify: false,
  // Disabilita completamente SWC (usa solo Webpack)
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@next/swc-linux-x64-gnu': false,
      '@next/swc-linux-x64-musl': false,
    };
    return config;
  },
  output: 'standalone',
};

export default nextConfig;