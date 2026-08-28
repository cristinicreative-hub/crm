import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabilita Turbopack
  experimental: {
    turbo: false,
  },
  // Disabilita SWC minify
  swcMinify: false,
  // Forza Webpack come compilatore (evita SWC che richiede glibc 2.29+)
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