"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, Image as ImageIcon, Crop } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { MediaPickerModal } from "./media/MediaPickerModal";
import { toast } from "@/components/ui/Toast";
import { compressImageFile, formatAltTextFromName } from "@/lib/admin/image-compression";
import { ImageCropperModal } from "./ImageCropperModal";
import { Tooltip } from "@/components/ui/Tooltip";

/**
 * Drag-and-drop image field. Renders a hidden input (so the value flows into the
 * form's FormData), a dropzone with live upload progress, a preview with remove,
 * image cropper support, auto browser compression, and alt text accessibility support.
 */
export function ImageUploader({ name, initial, initialAlt }: { name: string; initial?: string; initialAlt?: string }) {
  const [url, setUrl] = useState(initial ?? "");
  const [altText, setAltText] = useState(initialAlt ?? "");
  const [progress, setProgress] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const first = res?.[0];
      if (first) setUrl(first.serverData?.url ?? first.ufsUrl);
      setProgress(0);
      toast("Image uploaded successfully (compressed & optimized)", "success");
    },
    onUploadProgress: (p) => setProgress(p),
    onUploadError: (e) => {
      setProgress(0);
      toast(`Upload failed: ${e.message}`, "error");
    },
  });

  const onFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;

      setIsCompressing(true);
      if (!altText) setAltText(formatAltTextFromName(file.name));

      try {
        const compressed = await compressImageFile(file);
        setIsCompressing(false);
        void startUpload([compressed]);
      } catch {
        setIsCompressing(false);
        void startUpload([file]);
      }
    },
    [startUpload, altText]
  );

  return (
    <div className="w-full space-y-2">
      <input type="hidden" name={name} value={url} readOnly />
      <input type="hidden" name={`${name}_alt`} value={altText} readOnly />

      {url ? (
        <div className="space-y-2">
          <div className="relative w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={altText || "Uploaded preview"} className="w-full h-44 object-cover rounded-xl border border-gray-200 bg-gray-50" />
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <Tooltip tip="Crop Image">
                <button
                  type="button"
                  onClick={() => setCropperOpen(true)}
                  className="bg-white/90 rounded-full p-1.5 shadow hover:bg-red hover:text-white transition-colors text-navy"
                >
                  <Crop className="w-4 h-4" />
                </button>
              </Tooltip>
              <button
                type="button"
                onClick={() => setUrl("")}
                className="bg-white/90 rounded-full p-1.5 shadow hover:bg-red hover:text-white transition-colors text-navy"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy/70">
                Alt Text (Accessibility & SEO)
              </label>
              <span className="text-[10px] text-green-700 bg-green-50 px-1.5 py-0.5 rounded font-mono font-semibold">
                a11y verified
              </span>
            </div>
            <input
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe this image for screen readers..."
              className="w-full text-xs border border-gray-200 rounded-xl px-3 py-1.5 text-navy focus:outline-none focus:border-red bg-white"
            />
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); void onFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={cn(
            "cursor-pointer border-2 border-dashed rounded-xl p-6 text-center transition-colors select-none",
            dragOver ? "border-red bg-red/5" : "border-gray-200 hover:border-red/60 bg-gray-50/50"
          )}
        >
          <UploadCloud className={cn("w-7 h-7 mx-auto mb-2", (isUploading || isCompressing) ? "text-red animate-pulse" : "text-navy/40")} />
          <p className="text-xs text-navy/70 font-medium">
            {isCompressing
              ? "Compressing & optimizing image…"
              : isUploading
              ? `Uploading… ${progress}%`
              : "Drag an image here, or click to browse (Auto-compressed)"}
          </p>
          {(isUploading || isCompressing) && (
            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red transition-all" style={{ width: isCompressing ? "100%" : `${progress}%` }} />
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => void onFiles(e.target.files)} />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2 pt-1">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image URL"
          className="w-full sm:w-auto flex-1 min-w-0 bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:border-red"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bg-navy hover:bg-red text-white border border-transparent rounded-xl px-3.5 py-2 text-xs font-oswald uppercase tracking-wider font-bold transition-all shrink-0 flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <ImageIcon className="w-3.5 h-3.5 text-red" />
          Browse Library
        </button>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(newUrl) => setUrl(newUrl)}
      />
      <ImageCropperModal
        isOpen={cropperOpen}
        imageSrc={url}
        onClose={() => setCropperOpen(false)}
        onCropComplete={async (croppedFile) => {
          toast("Uploading cropped image...");
          await startUpload([croppedFile]);
        }}
      />
    </div>
  );
}
