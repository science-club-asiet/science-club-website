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
      { protocol: "https", hostname: "cdn.simpleicons.org" },
      { protocol: "https", hostname: "cdn.pixabay.com" },
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      // UploadThing — where all admin-uploaded images live
      { protocol: "https", hostname: "*.ufs.sh" },
      { protocol: "https", hostname: "utfs.io" },
      { protocol: "https", hostname: "uploadthing.com" },
      { protocol: "https", hostname: "*.uploadthing.com" },
    ],
  },
};

export default nextConfig;
