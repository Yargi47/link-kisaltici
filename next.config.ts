import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⬅️ Bunu ekledik
  },
  // başka ayarların varsa buraya eklersin
};

export default nextConfig;
