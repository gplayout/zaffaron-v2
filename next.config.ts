import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "givukaorkjkksslrzuum.supabase.co",
      },
    ],
  },
};

export default nextConfig;
