"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search, UploadCloud, Check, Image as ImageIcon, Folder, Loader2, RotateCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/components/ui/Toast";
import { syncUploadThingAssets } from "@/lib/admin/media-actions";
import { getDynamicFolders, formatFolderLabel, isAssetInFolder } from "@/lib/admin/media-folder-utils";
import { compressImageFile } from "@/lib/admin/image-compression";

export type MediaAssetItem = {
  id: string;
  url: string;
  name: string;
  folder?: string | null;
  created_at: string;
};

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const { data, error } = await createClient()
      .from("media_assets")
      .select("id, url, name, folder, created_at")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAssets(data);
    }
    setLoading(false);
  }, []);

  const folderList = useMemo(() => ["all", ...getDynamicFolders(assets)], [assets]);

  const handleSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await syncUploadThingAssets();
      if (res.synced > 0) {
        toast(`Synced ${res.synced} file(s) from UploadThing`, "success");
      } else {
        toast("All UploadThing files are synced", "success");
      }
      await fetchAssets();
    } catch (err: unknown) {
      toast("Sync error: " + (err as Error).message, "error");
    }
    setIsSyncing(false);
  }, [fetchAssets]);

  useEffect(() => {
    if (isOpen) {
      void fetchAssets().then(() => {
        void syncUploadThingAssets().then((res) => {
          if (res.synced > 0) void fetchAssets();
        }).catch(() => {});
      });
    }
  }, [isOpen, fetchAssets]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setUploadProgress(0);
      toast("Image uploaded & compressed", "success");
      void fetchAssets();
      if (res && res[0]?.url) {
        onSelect(res[0].url);
        onClose();
      }
    },
    onUploadProgress: setUploadProgress,
    onUploadError: (e) => {
      setUploadProgress(0);
      toast(`Upload failed: ${e.message}`, "error");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const fileArr = Array.from(e.target.files);
    toast("Compressing image...");
    const compressedList = await Promise.all(fileArr.map((f) => compressImageFile(f)));
    void startUpload(compressedList);
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (!isAssetInFolder(a.folder, activeFolder)) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [assets, activeFolder, search]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[350] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[85vh] font-inter"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-oswald text-lg font-bold uppercase text-navy leading-none">Media Library</h3>
                <p className="text-xs text-gray-400 mt-0.5">Select an asset or upload a new photo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-white border border-gray-200 text-navy hover:border-red hover:text-red px-3.5 py-2 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
                title="Sync files from UploadThing"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Cloud"}
              </button>

              <label className="bg-red hover:bg-navy text-white px-4 py-2 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center gap-2 shadow-sm">
                <UploadCloud className="w-4 h-4" />
                {isUploading ? `Uploading ${uploadProgress}%` : "Upload New"}
                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
              </label>

              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-navy transition-colors rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search & Dynamic Folder Pills */}
          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:bg-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
              {folderList.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFolder(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all shrink-0 ${
                    activeFolder === f ? "bg-navy text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {formatFolderLabel(f)}
                </button>
              ))}
            </div>
          </div>

          {/* Asset Grid Container */}
          <div className="p-6 overflow-y-auto flex-1 min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                <Loader2 className="w-6 h-6 animate-spin text-navy" />
                <span className="text-xs font-medium">Loading media assets...</span>
              </div>
            ) : filteredAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                <Folder className="w-8 h-8 opacity-40" />
                <p className="text-sm font-medium text-gray-500">No media assets found in this folder.</p>
                <p className="text-xs text-gray-400">Upload a new photo using the button above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => {
                      onSelect(asset.url);
                      onClose();
                    }}
                    className="group relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-red hover:shadow-md transition-all duration-200"
                  >
                    <div className="aspect-square relative overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="bg-red text-white text-[10px] font-oswald uppercase tracking-widest font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow">
                          <Check className="w-3 h-3" /> Select
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-white border-t border-gray-100">
                      <p className="text-[11px] font-medium text-navy truncate" title={asset.name}>
                        {asset.name}
                      </p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5 truncate">{asset.folder || "general"}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
