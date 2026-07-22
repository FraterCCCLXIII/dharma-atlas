import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Serve modern formats; place photos have content-addressed (immutable)
    // filenames, so they can be cached aggressively once optimized.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 2678400, // 31 days
    // Prefer 65 on place pages; keep 50/75 available for explicit overrides.
    qualities: [50, 65, 75],
    // Cap retina srcset so heroes never request 2048/3840 (sources are ≤1600px).
    deviceSizes: [640, 750, 828, 1080, 1200, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "covers.openlibrary.org",
      },
      {
        protocol: "https",
        hostname: "ws-na.amazon-adsystem.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
    ],
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
