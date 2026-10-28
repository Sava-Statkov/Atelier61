import type { NextConfig } from "next";
import { series } from "./src/content/series";
import { seriesPath } from "./src/lib/paths";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // No on-screen Next.js badge in development; build and runtime errors still show as an overlay.
  devIndicators: false,
  experimental: {
    // Root layout lives in app/[lang], so unmatched URLs need a global 404 (app/global-not-found.tsx).
    globalNotFound: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 75 for thumbnails, 90 for the artwork view and close inspection.
    qualities: [75, 90],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560, 3200],
  },
  // Bulgarian is served without a prefix: /tvorbi is rendered by app/[lang]/tvorbi with lang = "bg".
  // Other locales keep their prefix (/en/...) and are enabled in src/i18n/config.ts.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/", destination: "/bg" },
        { source: "/:first((?!bg$|en$)[^/.]+)/:rest*", destination: "/bg/:first/:rest*" },
      ],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: "/bg", destination: "/", permanent: true },
      { source: "/bg/:path*", destination: "/:path*", permanent: true },
      // Practices used to live under /cikli/; send old links to their own address.
      ...series
        .filter((s) => s.kind === "practice")
        .map((s) => ({ source: `/cikli/${s.slug}`, destination: seriesPath(s), permanent: true })),
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
