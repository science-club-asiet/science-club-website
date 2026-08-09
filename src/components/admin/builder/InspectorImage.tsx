"use client";

import { useCallback, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { MediaPickerModal } from "../media/MediaPickerModal";
import { toast } from "@/components/ui/Toast";

/** Compact controlled image field (drag-drop upload + URL) for the inspector. */
export function InspectorImage({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const [progress, setProgress] = useState(0);
  const [pickerOpen, setPickerOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const f = res?.[0];
      if (f) onChange(f.serverData?.url ?? f.ufsUrl);
      setProgress(0);
      toast("Image uploaded successfully", "success");
    },
    onUploadProgress: setProgress,
    onUploadError: (e) => {
      setProgress(0);
      toast(`Upload failed: ${e.message}`, "error");
    },
  });

  const onFiles = useCallback((files: FileList | null) => {
    const f = files?.[0];
    if (f) void startUpload([f]);
  }, [startUpload]);

  return (
    <div>
      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
          <button type="button" onClick={() => onChange("")} className="absolute top-1 right-1 bg-white/90 rounded-full p-1 shadow hover:bg-red hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={(e) => { e.preventDefault(); onFiles(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          role="button" tabIndex={0}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 text-center hover:border-red text-xs text-gray-500 cursor-pointer"
        >
          <UploadCloud className="w-5 h-5 mx-auto mb-1 text-gray-400" />
          {isUploading ? `Uploading… ${progress}%` : "Drop or click to upload"}
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e) => onFiles(e.target.files)} />
      <div className="flex gap-1.5 mt-1.5">
        <input
          type="url" value={value} onChange={(e) => onChange(e.target.value)}
          placeholder="or paste URL"
          className="flex-1 min-w-0 border border-gray-200 rounded px-2 py-1 text-[11px] text-navy focus:outline-none focus:border-red"
        />
        <button
          type="button"
          onClick={() => setPickerOpen(true)}
          className="bg-gray-100 hover:bg-gray-200 border border-gray-200 text-navy rounded px-2 py-1 text-[10px] font-medium transition-colors shrink-0 whitespace-nowrap"
        >
          Browse
        </button>
      </div>

      <MediaPickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(newUrl) => onChange(newUrl)}
      />
    </div>
  );
}
