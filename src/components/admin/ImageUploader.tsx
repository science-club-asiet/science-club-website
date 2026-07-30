"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { MediaPickerModal } from "./media/MediaPickerModal";

/**
 * Drag-and-drop image field. Renders a hidden input (so the value flows into the
 * form's FormData), a dropzone with live upload progress, a preview with remove,
 * and a manual URL fallback.
 */
export function ImageUploader({ name, initial }: { name: string; initial?: string }) {
  const [url, setUrl] = useState(initial ?? "");
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const first = res?.[0];
      if (first) setUrl(first.serverData?.url ?? first.ufsUrl);
      setProgress(0);
    },
    onUploadProgress: (p) => setProgress(p),
    onUploadError: (e) => {
      setProgress(0);
      alert(`Upload failed: ${e.message}`);
    },
  });

  const onFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.[0];
      if (file) void startUpload([file]);
    },
    [startUpload]
  );

  return (
    <div className="max-w-md">
      <input type="hidden" name={name} value={url} readOnly />

      {url ? (
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="preview" className="w-full h-44 object-cover rounded-xl border border-gray-200 bg-gray-50" />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:bg-red hover:text-white transition-colors"
            aria-label="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          className={cn(
            "cursor-pointer border-2 border-dashed rounded-xl p-8 text-center transition-colors select-none",
            dragOver ? "border-red bg-red/5" : "border-gray-300 hover:border-red/60"
          )}
        >
          <UploadCloud className={cn("w-8 h-8 mx-auto mb-2", isUploading ? "text-red animate-pulse" : "text-gray-400")} />
          <p className="text-sm text-gray-500">
            {isUploading ? `Uploading… ${progress}%` : "Drag an image here, or click to browse"}
          </p>
          {isUploading && (
            <div className="mt-3 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-red transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
        </div>
      )}

      <div className="flex gap-2 mt-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="…or paste an image URL"
          className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-red"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-navy rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap"
        >
          Browse Library
        </button>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(newUrl) => setUrl(newUrl)}
      />
    </div>
  );
}
