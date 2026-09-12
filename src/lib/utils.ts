import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isUnoptimizedImage(src?: string | null): boolean {
  if (!src) return true;
  const s = src.toLowerCase();
  return (
    s.startsWith("data:") ||
    s.startsWith("blob:") ||
    s.endsWith(".svg") ||
    s.includes("utfs.io") ||
    s.includes("ufs.sh") ||
    s.includes("uploadthing.com")
  );
}
