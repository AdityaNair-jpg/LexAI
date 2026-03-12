import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow external images from Convex
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.convex.cloud",
      },
    ],
  },
  // Ensure pdf-parse and pdfjs-dist only run server-side
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
