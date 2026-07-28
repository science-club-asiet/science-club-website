"use client";

import { usePathname } from "next/navigation";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Loader } from "@/components/Loader";

/**
 * Wraps the marketing site in the Loader intro + Lenis smooth scroll, but skips
 * both on /admin routes — the admin panel is a data UI where a 2s loader and
 * hijacked scrolling would only get in the way.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin") ?? false;

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Loader />
      <SmoothScroll>{children}</SmoothScroll>
    </>
  );
}
