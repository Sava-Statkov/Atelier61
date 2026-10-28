import type { NextConfig } from "next";

// Photographs of the works are served from Supabase Storage (public bucket "artworks").
const supabase = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "http://127.0.0.1:54321");
const isLocalSupabase = ["127.0.0.1", "localhost"].includes(supabase.hostname);

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
    remotePatterns: [
      {
        protocol: supabase.protocol.replace(":", "") as "http" | "https",
        hostname: supabase.hostname,
        port: supabase.port,
        pathname: "/storage/v1/object/public/artworks/**",
      },
    ],
    // A photograph never changes under its address (the file name is its SHA-256), so the resized
    // versions can be kept for a month.
    minimumCacheTTL: 2678400,
    // Only for the local Supabase in Docker, which runs on this machine.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  // Bulgarian is served without a prefix: /tvorbi is rendered by app/[lang]/tvorbi with lang = "bg".
  // Other locales keep their prefix (/en/...) and are enabled in src/i18n/config.ts. The admin is not
  // localised and keeps its own address.
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [
        { source: "/", destination: "/bg" },
        // The first segment is checked up to its end ("/" or end of address), so /admin/… stays itself.
        { source: "/:first((?!(?:bg|en|admin)(?:/|$))[^/.]+)/:rest*", destination: "/bg/:first/:rest*" },
      ],
      fallback: [],
    };
  },
  async redirects() {
    return [
      { source: "/bg", destination: "/", permanent: true },
      { source: "/bg/:path*", destination: "/:path*", permanent: true },
    ];
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
