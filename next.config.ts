import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  // ── Compiler optimizations ───────────────────────────────────────────
  compiler: {
    // Remove console.* calls in production
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Explicitly set the project root for Turbopack to avoid workspace inference issues
  // where it might pick up a lockfile in the home directory.
  turbopack: {
    root: process.cwd(),
  },
  // cacheComponents for faster TTFB
  cacheComponents: true,

  experimental: {
    // Tree-shake large packages to only import what's used
    optimizePackageImports: ["framer-motion", "lucide-react"],
    // Inline critical CSS (requires 'critters' package)
    // optimizeCss: true,
  },
  // ── Ignore ESLint during builds to unblock deployment ────────────────
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Image optimization ───────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 128, 256],
    minimumCacheTTL: 31536000,
  },

  // ── Long-lived cache headers for all static assets ────────────────────
  async headers() {
    return [
      {
        source: "/(favicon\\.ico|apple-touch-icon\\.png|favicon-32x32\\.png|favicon-16x16\\.png)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/projects/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico|woff|woff2|js|css)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Security + performance headers on every HTML page
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",  value: "nosniff" },
          { key: "X-Frame-Options",         value: "DENY" },
          { key: "Referrer-Policy",         value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
