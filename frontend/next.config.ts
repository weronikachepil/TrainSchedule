import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: `${process.env.BACKEND_URL ?? 'https://trainschedule-production.up.railway.app'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
