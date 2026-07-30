"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { MediaLibraryClient, type MediaAsset } from "./MediaLibraryClient";
import { getMediaAssets } from "@/lib/admin/media-actions";

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);

  useEffect(() => {
    if (isOpen && !assets) {
      getMediaAssets().then(data => {
        setAssets(data as MediaAsset[]);
      }).catch(err => {
        console.error(err);
        // Fallback or error handling
      });
    }
  }, [isOpen, assets]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-navy/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[85vh] flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <h2 className="font-oswald text-xl uppercase font-bold text-navy">Choose from Library</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red transition-colors rounded-full hover:bg-red/5">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 min-h-0 bg-gray-50">
          {!assets ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-red border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MediaLibraryClient
              initialAssets={assets}
              onSelectMode={true}
              onSelectAsset={(url) => {
                onSelect(url);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
