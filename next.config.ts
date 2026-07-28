import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Serve modern formats (AVIF first, WebP fallback) from the built-in
    // optimizer. This re-encodes the upstream CDN images smaller than the
    // WebP-only `auto=format` Unsplash already applies.
    formats: ["image/avif", "image/webp"],

    // Cache optimized images for 30 days. These are static stock/avatar assets
    // that never change, so a long TTL avoids repeated re-optimization and
    // upstream fetches (the Next 16 default is only 4 hours).
    minimumCacheTTL: 60 * 60 * 24 * 30,

    // Only the remote hosts we actually load through next/image. Everything
    // else (SVG brand logos, the map iframe, the video) stays as-is.
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      // UploadThing — where all admin-uploaded images live (per the SRS, to keep
      // off Supabase's thin free-tier storage). New app-scoped host + legacy host.
      { protocol: "https", hostname: "*.ufs.sh", pathname: "/f/**" },
      { protocol: "https", hostname: "utfs.io", pathname: "/f/**" },
    ],
  },
};

export default nextConfig;
