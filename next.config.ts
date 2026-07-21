import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Serve modern formats; place photos have content-addressed (immutable)
    // filenames, so they can be cached aggressively once optimized.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 days
    qualities: [50, 65, 75],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/locations",
        destination: "/places",
        permanent: true,
      },
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
