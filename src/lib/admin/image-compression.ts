"use client";

/**
 * Client-side HTML5 Canvas image compression utility.
 * Resizes large photos (>1920x1080) and encodes them to optimized WebP at 85% quality
 * in the browser before upload, achieving 70%-90% file size reduction.
 */
export async function compressImageFile(
  file: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<File> {
  const { maxWidth = 1920, maxHeight = 1080, quality = 0.85 } = options;

  // 1. Skip non-raster images (SVGs, GIFs)
  if (!file.type.startsWith("image/") || file.type.includes("svg") || file.type.includes("gif")) {
    return file;
  }

  // 2. Skip files already small (< 300 KB)
  if (file.size < 300 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // Scale dimensions proportionally
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      const outputType = "image/webp";
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If blob failed or compressed file is somehow larger, return original file
            resolve(file);
            return;
          }

          const compressedName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const compressedFile = new File([blob], compressedName, {
            type: outputType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };

    img.src = objectUrl;
  });
}

/**
 * Derives a clean human-readable alt text from a file name.
 */
export function formatAltTextFromName(fileName: string): string {
  return fileName
    .replace(/\.[^/.]+$/, "") // Remove file extension
    .replace(/[-_]+/g, " ")   // Replace hyphens and underscores with spaces
    .replace(/\s+/g, " ")     // Collapse spaces
    .trim();
}
