import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "admin.akaratistanbul.net",
      },
    ],
  },
};

export default nextConfig;
