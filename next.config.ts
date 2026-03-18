import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
});

const nextConfig: NextConfig = withPWA({
  reactStrictMode: true,
  // ✅ Disable Turbopack for Webpack PWA compatibility
  experimental: {
    turbo: false,
  },
});

export default nextConfig;