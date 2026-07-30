"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UploadCloud, Folder, Image as ImageIcon, FileText, Search, X, Check, Trash2, Link as LinkIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { updateMediaAsset, deleteMediaAsset } from "@/lib/admin/media-actions";

export type MediaAsset = {
  id: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  folder: string;
  alt: string | null;
  tags: string[];
  created_at: string;
};

const FOLDERS = [
  { id: "general", label: "General", icon: Folder },
  { id: "events", label: "Events", icon: Folder },
  { id: "posts", label: "Posts", icon: FileText },
  { id: "people", label: "People", icon: Folder },
  { id: "brand", label: "Brand", icon: ImageIcon },
];

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"], i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function MediaLibraryClient({ initialAssets, onSelectMode = false, onSelectAsset }: { initialAssets: MediaAsset[], onSelectMode?: boolean, onSelectAsset?: (url: string) => void }) {
  const router = useRouter();
  const [assets] = useState<MediaAsset[]>(initialAssets);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [isPending, startTransition] = useTransition();

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      setUploadProgress(0);
      router.refresh(); // Reload to get new assets
    },
    onUploadProgress: setUploadProgress,
    onUploadError: (e) => {
      setUploadProgress(0);
      alert(`Upload failed: ${e.message}`);
    },
  });

  const onFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);
    void startUpload(fileArray);
  }, [startUpload]);

  // Filtering
  const filteredAssets = assets.filter(a => {
    if (activeFolder !== "all" && a.folder !== activeFolder) return false;
    if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  async function handleUpdateAsset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAsset) return;
    const fd = new FormData(e.currentTarget);
    const alt = fd.get("alt") as string;
    const folder = fd.get("folder") as string;
    startTransition(async () => {
      try {
        await updateMediaAsset(selectedAsset.id, { alt, folder });
        setSelectedAsset(null);
        router.refresh();
      } catch (err: unknown) {
        alert("Failed to update: " + (err as Error).message);
      }
    });
  }

  async function handleDeleteAsset(id: string) {
    if (!confirm("Are you sure you want to delete this asset? It may break public pages where it's used.")) return;
    startTransition(async () => {
      try {
        await deleteMediaAsset(id);
        setSelectedAsset(null);
        router.refresh();
      } catch (err: unknown) {
        alert("Failed to delete: " + (err as Error).message);
      }
    });
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("URL copied to clipboard");
  };

  return (
    <div className="flex h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/30">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-oswald uppercase font-bold text-navy">Library</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <button
            onClick={() => setActiveFolder("all")}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
              activeFolder === "all" ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <ImageIcon className="w-4 h-4" /> All Assets
          </button>
          {FOLDERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFolder(f.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                activeFolder === f.id ? "bg-navy text-white" : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <f.icon className="w-4 h-4" /> {f.label}
            </button>
          ))}
        </div>

        {/* Dropzone */}
        <div className="p-4 border-t border-gray-100">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); onFiles(e.dataTransfer.files); }}
            className={cn(
              "border-2 border-dashed rounded-xl p-4 text-center transition-colors relative overflow-hidden",
              dragOver ? "border-red bg-red/5" : "border-gray-300 bg-white"
            )}
          >
            <UploadCloud className={cn("w-6 h-6 mx-auto mb-2", isUploading ? "text-red animate-pulse" : "text-gray-400")} />
            <p className="text-xs text-gray-500 font-medium">
              {isUploading ? `Uploading... ${uploadProgress}%` : "Drop images to upload"}
            </p>
            {isUploading && (
              <div className="absolute bottom-0 left-0 h-1 bg-red transition-all" style={{ width: `${uploadProgress}%` }} />
            )}
            <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => onFiles(e.target.files)} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-red focus:ring-1 focus:ring-red"
            />
          </div>
          <div className="text-sm text-gray-500">{filteredAssets.length} items</div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-max">
            {filteredAssets.map(asset => (
              <div
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className="group relative aspect-square bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:border-red transition-colors shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={asset.url} alt={asset.alt || asset.name} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-[10px] truncate font-medium">{asset.name}</p>
                </div>
              </div>
            ))}
          </div>
          {filteredAssets.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <ImageIcon className="w-12 h-12 mb-3 opacity-20" />
              <p>No assets found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Detail Drawer */}
      {selectedAsset && (
        <div className="w-80 border-l border-gray-100 bg-white flex flex-col h-full shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-oswald uppercase font-bold text-navy truncate pr-4">Asset Details</h3>
            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-navy">
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedAsset.url} alt="" className="w-full rounded-lg border border-gray-200 bg-white shadow-sm" />
            </div>
            
            <form id="asset-form" onSubmit={handleUpdateAsset} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">File Name</label>
                <div className="text-sm truncate text-navy">{selectedAsset.name}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Type</label>
                  <div className="text-sm truncate text-navy">{selectedAsset.mime}</div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Size</label>
                  <div className="text-sm text-navy">{formatBytes(selectedAsset.size)}</div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Folder</label>
                  <select name="folder" defaultValue={selectedAsset.folder} className="w-full text-sm border-gray-200 rounded-lg">
                    {FOLDERS.map(f => (
                      <option key={f.id} value={f.id}>{f.label}</option>
                    ))}
                    <option value="general">General</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Alt Text (Accessibility)</label>
                  <textarea name="alt" defaultValue={selectedAsset.alt || ""} rows={3} className="w-full text-sm border-gray-200 rounded-lg" placeholder="Describe the image..." />
                </div>
              </div>
            </form>
          </div>
          
          <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
            {onSelectMode && onSelectAsset ? (
              <button
                type="button"
                onClick={() => onSelectAsset(selectedAsset.url)}
                className="w-full bg-navy text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Select Asset
              </button>
            ) : (
              <button
                type="submit"
                form="asset-form"
                disabled={isPending}
                className="w-full bg-navy text-white px-4 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red transition-colors disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Save Details"}
              </button>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopyUrl(selectedAsset.url)}
                className="flex-1 bg-white border border-gray-200 text-navy px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-1"
              >
                <LinkIcon className="w-3 h-3" /> Copy URL
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAsset(selectedAsset.id)}
                disabled={isPending}
                className="flex-1 bg-white border border-red/20 text-red px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red/5 transition-colors flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
