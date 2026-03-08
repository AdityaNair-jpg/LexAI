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
  // Ensure pdf-parse only runs server-side
  serverExternalPackages: ["pdf-parse"],
};

export default nextConfig;
