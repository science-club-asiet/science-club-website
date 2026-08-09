"use client";

import { useState } from "react";
import { HardDrive, RotateCw, Folder, FileImage, ShieldCheck, UploadCloud } from "lucide-react";
import { syncUploadThingAssets } from "@/lib/admin/media-actions";
import { toast } from "@/components/ui/Toast";

export type StorageAsset = {
  id: string;
  size: number;
  folder: string;
};

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"], i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function SettingsStorage({ assets }: { assets: StorageAsset[] }) {
  const [isSyncing, setIsSyncing] = useState(false);

  const totalAssets = assets.length;
  const totalSizeBytes = assets.reduce((sum, a) => sum + (a.size || 0), 0);

  // Folder breakdown
  const folderCounts = assets.reduce((acc, a) => {
    const f = a.folder || "general";
    acc[f] = (acc[f] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncUploadThingAssets();
      if (res.synced > 0) {
        toast(`Synced ${res.synced} file(s) from UploadThing`, "success");
      } else {
        toast("All UploadThing assets are fully synced", "success");
      }
    } catch (err: unknown) {
      toast("Sync failed: " + (err as Error).message, "error");
    }
    setIsSyncing(false);
  };

  return (
    <div className="space-y-6 font-inter max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h2 className="font-oswald text-2xl font-bold uppercase text-navy">Storage & Cloud Media</h2>
          <p className="text-xs text-gray-500 mt-1">UploadThing S3 CDN usage, storage statistics, and cloud synchronization.</p>
        </div>

        <button
          type="button"
          onClick={handleSync}
          disabled={isSyncing}
          className="bg-navy hover:bg-red text-white px-4 py-2 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <RotateCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Cloud Storage"}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center">
              <FileImage className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-oswald font-bold text-navy">{totalAssets}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Total Assets</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-oswald font-bold text-navy">{formatBytes(totalSizeBytes)}</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-navy/50">Storage Used</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50/80 border border-gray-200/80 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy text-white flex items-center justify-center">
              <UploadCloud className="w-5 h-5 text-red" />
            </div>
            <div>
              <div className="text-2xl font-oswald font-bold text-navy">UploadThing</div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-navy/50">CDN Engine</div>
            </div>
          </div>
        </div>
      </div>

      {/* Folder Distribution */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
          <Folder className="w-4 h-4 text-red" /> Asset Folder Distribution
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(folderCounts).map(([folder, count]) => (
            <div key={folder} className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center justify-between">
              <span className="text-xs font-semibold text-navy uppercase font-mono">{folder}</span>
              <span className="text-xs font-mono font-bold bg-navy text-white px-2 py-0.5 rounded-full">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upload Policy */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
        <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-red" /> Upload Policy & Limits
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-navy">
          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="font-bold text-navy/60 uppercase tracking-wider text-[10px]">Max File Size Limit</div>
            <div className="text-sm font-bold text-navy mt-1">8 MB per image</div>
          </div>

          <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
            <div className="font-bold text-navy/60 uppercase tracking-wider text-[10px]">Allowed File Types</div>
            <div className="text-sm font-bold text-navy mt-1">JPG, PNG, WebP, GIF, SVG</div>
          </div>
        </div>
      </div>
    </div>
  );
}
