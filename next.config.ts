import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: false,
  },
  swcMinify: false,
  output: 'standalone',
};

export default nextConfig;