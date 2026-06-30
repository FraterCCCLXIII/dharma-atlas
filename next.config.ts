import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/teachers",
        destination: "/people",
        permanent: true,
      },
      {
        source: "/teacher/:slug",
        destination: "/person/:slug",
        permanent: true,
      },
      {
        source: "/teachers/:file",
        destination: "/people/:file",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
