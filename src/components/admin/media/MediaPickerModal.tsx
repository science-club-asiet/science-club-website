"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Search, UploadCloud, Check, Image as ImageIcon, Folder, FolderOpen,
  Loader2, RotateCw, Edit2, Crop, FolderPlus, ChevronRight, ChevronDown, Grid
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/components/ui/Toast";
import { syncUploadThingAssets, updateMediaAsset } from "@/lib/admin/media-actions";
import { getDynamicFolders, formatFolderLabel, isAssetInFolder, getDirectSubfolders } from "@/lib/admin/media-folder-utils";
import { compressImageFile } from "@/lib/admin/image-compression";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { FolderCreateModal } from "@/components/admin/media/FolderCreateModal";
import { PromptModal, type PromptConfig } from "@/components/ui/ModalDialog";
import { cn } from "@/lib/utils";

export type MediaAssetItem = {
  id: string;
  url: string;
  name: string;
  folder?: string | null;
  created_at: string;
};

/**
 * Windows File Explorer Style Path Breadcrumb Bar
 */
export function MediaBreadcrumbPath({
  activeFolder,
  setActiveFolder,
}: {
  activeFolder: string;
  setActiveFolder: (folder: string) => void;
}) {
  const segments = useMemo(() => {
    if (!activeFolder || activeFolder === "all") return [];
    const parts = activeFolder.split("/");
    let accum = "";
    return parts.map((part) => {
      accum = accum ? `${accum}/${part}` : part;
      return {
        path: accum,
        label: part.charAt(0).toUpperCase() + part.slice(1),
      };
    });
  }, [activeFolder]);

  return (
    <div className="flex items-center gap-1 bg-gray-100/90 border border-gray-200 rounded-xl px-3 py-1.5 font-mono text-xs text-navy shadow-inner overflow-x-auto select-none max-w-full">
      <button
        type="button"
        onClick={() => setActiveFolder("all")}
        className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 font-bold text-[11px]",
          activeFolder === "all" ? "bg-navy text-white shadow-xs" : "hover:bg-gray-200/80 text-navy/80"
        )}
      >
        <span className="text-xs">🖥️</span>
        <span>PC / Media Vault</span>
      </button>

      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        return (
          <React.Fragment key={seg.path}>
            <span className="text-navy/40 text-[11px] shrink-0 font-bold">›</span>
            <button
              type="button"
              onClick={() => setActiveFolder(seg.path)}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-lg transition-colors cursor-pointer shrink-0 text-[11px] font-semibold",
                isLast ? "bg-navy/10 text-navy font-bold border border-navy/20" : "hover:bg-gray-200/80 text-navy/70"
              )}
            >
              <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{seg.label}</span>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  onSelectMultiple,
  allowMultiple = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  onSelectMultiple?: (urls: string[]) => void;
  allowMultiple?: boolean;
}) {
  const [assets, setAssets] = useState<MediaAssetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFolder, setActiveFolder] = useState("all");
  const [includeSubfolders, setIncludeSubfolders] = useState<boolean>(false);
  const [gridCols, setGridCols] = useState<number>(4);
  const [folderSearchQuery, setFolderSearchQuery] = useState("");
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});
  const [uploadProgress, setUploadProgress] = useState(0);

  // Multi-selection state inside picker
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(allowMultiple);
  const [selectedUrls, setSelectedUrls] = useState<Set<string>>(new Set());

  // Folder Create Modal state
  const [folderModalState, setFolderModalState] = useState<{ isOpen: boolean; initialValue: string }>({
    isOpen: false,
    initialValue: "",
  });

  // Synchronize multi-select state when modal opens or allowMultiple prop changes
  useEffect(() => {
    setIsMultiSelectMode(allowMultiple);
    if (!allowMultiple) setSelectedUrls(new Set());
  }, [allowMultiple, isOpen]);

  // Cropper & Prompt state
  const [cropperSrc, setCropperSrc] = useState<string | File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);

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

  const folderList = useMemo(
    () => getDynamicFolders(assets, customFolders),
    [assets, customFolders]
  );

  // Group folders by root folder for collapsible tree rendering
  const folderTree = useMemo(() => {
    const tree: { root: string; subfolders: string[] }[] = [];
    const rootMap = new Map<string, string[]>();

    folderList.forEach((f) => {
      const parts = f.split("/");
      const root = parts[0];
      if (!rootMap.has(root)) {
        rootMap.set(root, []);
      }
      if (parts.length > 1) {
        rootMap.get(root)?.push(f);
      }
    });

    rootMap.forEach((subfolders, root) => {
      tree.push({ root, subfolders });
    });

    return tree;
  }, [folderList]);

  const filteredFolderTree = useMemo(() => {
    if (!folderSearchQuery.trim()) return folderTree;
    const q = folderSearchQuery.trim().toLowerCase();
    return folderTree
      .map(({ root, subfolders }) => ({
        root,
        subfolders: subfolders.filter((s) => s.toLowerCase().includes(q)),
      }))
      .filter(({ root, subfolders }) => root.toLowerCase().includes(q) || subfolders.length > 0);
  }, [folderTree, folderSearchQuery]);

  const directSubfolders = useMemo(() => {
    if (includeSubfolders) return [];
    return getDirectSubfolders(folderList, activeFolder);
  }, [folderList, activeFolder, includeSubfolders]);

  const toggleFolderCollapse = (root: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedFolders((prev) => ({ ...prev, [root]: !prev[root] }));
  };

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
    let ignore = false;
    if (isOpen) {
      void createClient()
        .from("media_assets")
        .select("id, url, name, folder, created_at")
        .order("created_at", { ascending: false })
        .then(({ data, error }) => {
          if (!ignore) {
            if (!error && data) setAssets(data);
            setLoading(false);
          }
          void syncUploadThingAssets().then((res) => {
            if (!ignore && res.synced > 0) {
              void createClient()
                .from("media_assets")
                .select("id, url, name, folder, created_at")
                .order("created_at", { ascending: false })
                .then(({ data: d2, error: e2 }) => {
                  if (!ignore && !e2 && d2) setAssets(d2);
                });
            }
          }).catch(() => {});
        });
    }
    return () => {
      ignore = true;
    };
  }, [isOpen]);

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      setUploadProgress(0);
      toast("Image uploaded & compressed", "success");
      void fetchAssets();
      if (res && res[0]?.url && !allowMultiple) {
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
      if (!isAssetInFolder(a.folder, activeFolder, includeSubfolders)) return false;
      if (search && !a.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [assets, activeFolder, includeSubfolders, search]);

  const handleRenameAsset = (asset: MediaAssetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setPromptConfig({
      title: `Rename Image`,
      label: "Enter new image title/name:",
      initialValue: asset.name,
      submitText: "Save Name",
      onCancel: () => setPromptConfig(null),
      onSubmit: async (newName: string) => {
        setPromptConfig(null);
        const clean = newName.trim();
        if (!clean || clean === asset.name) return;

        setAssets((prev) => prev.map((a) => (a.id === asset.id ? { ...a, name: clean } : a)));
        try {
          await updateMediaAsset(asset.id, { name: clean });
          toast("Asset renamed", "success");
        } catch (err: unknown) {
          toast("Failed to rename: " + (err as Error).message, "error");
          void fetchAssets();
        }
      },
    });
  };

  const handleCropAsset = (asset: MediaAssetItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setCropperSrc(asset.url);
    setIsCropperOpen(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[350] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col h-[85vh] font-inter"
        >
          {/* Top Bar */}
          <div className="px-6 py-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-navy text-white flex items-center justify-center">
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-oswald text-lg font-bold uppercase text-navy leading-none">Media Vault & Picker</h3>
                <p className="text-xs text-gray-400 mt-0.5">Select photos, navigate folders, or upload new assets</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSync}
                disabled={isSyncing}
                className="bg-white border border-gray-200 text-navy hover:border-red hover:text-red px-3.5 py-1.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                title="Sync files from UploadThing"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {isSyncing ? "Syncing..." : "Sync Cloud"}
              </button>

              <label className="bg-red hover:bg-navy text-white px-4 py-1.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all cursor-pointer flex items-center gap-2 shadow-xs">
                <UploadCloud className="w-4 h-4" />
                {isUploading ? `Uploading ${uploadProgress}%` : "Upload New"}
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isUploading} />
              </label>

              <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-navy transition-colors rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Modal Main Body (2-Column Folders + Grid Layout) */}
          <div className="flex-1 flex min-h-0 overflow-hidden">
            {/* Left Column: Folders Sidebar (Same as Media Page) */}
            <div className="w-60 border-r border-gray-100 flex flex-col bg-gray-50/50 shrink-0">
              <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                <h4 className="font-oswald uppercase font-bold text-navy text-xs tracking-wider">Folders</h4>
                <button
                  type="button"
                  onClick={() => setFolderModalState({ isOpen: true, initialValue: "" })}
                  className="p-1 text-navy/70 hover:text-navy hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                  title="Create New Folder"
                >
                  <FolderPlus className="w-3.5 h-3.5 text-red" />
                </button>
              </div>

              {/* Folder Search */}
              <div className="px-2.5 pt-2.5 pb-1">
                <div className="relative">
                  <Search className="w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search folders..."
                    value={folderSearchQuery}
                    onChange={(e) => setFolderSearchQuery(e.target.value)}
                    className="w-full pl-7 pr-2 py-1 bg-white border border-gray-200 rounded-lg text-xs text-navy focus:outline-none focus:border-red"
                  />
                </div>
              </div>

              {/* Folders Tree List */}
              <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
                <button
                  onClick={() => setActiveFolder("all")}
                  className={cn(
                    "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    activeFolder === "all" ? "bg-navy text-white shadow-xs" : "text-navy/70 hover:bg-gray-100"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <ImageIcon className="w-3.5 h-3.5" /> All Assets
                  </span>
                  <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-mono", activeFolder === "all" ? "bg-white/20 text-white" : "bg-gray-200 text-navy/60")}>
                    {assets.length}
                  </span>
                </button>

                <div className="pt-2 pb-1 px-2.5 text-[9px] font-bold uppercase tracking-widest text-navy/40">
                  Folders Tree
                </div>

                {filteredFolderTree.map(({ root, subfolders }) => {
                  const isRootSelected = activeFolder === root;
                  const rootCount = assets.filter((a) => isAssetInFolder(a.folder, root, true)).length;
                  const hasSubfolders = subfolders.length > 0;
                  const isCollapsed = Boolean(collapsedFolders[root]);

                  return (
                    <div key={root} className="space-y-0.5">
                      <div className="group relative flex items-center">
                        {hasSubfolders && (
                          <button
                            type="button"
                            onClick={(e) => toggleFolderCollapse(root, e)}
                            className="p-1 text-gray-400 hover:text-navy transition-colors shrink-0"
                          >
                            {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        )}

                        <button
                          onClick={() => setActiveFolder(root)}
                          className={cn(
                            "w-full flex items-center justify-between px-2 py-1.5 rounded-xl text-xs font-medium transition-all",
                            !hasSubfolders && "ml-3.5",
                            isRootSelected ? "bg-navy text-white font-bold shadow-xs" : "text-navy/80 hover:bg-gray-100"
                          )}
                        >
                          <span className="flex items-center gap-1.5 truncate pr-1">
                            {isRootSelected ? <FolderOpen className="w-3.5 h-3.5 text-red shrink-0" /> : <Folder className="w-3.5 h-3.5 text-navy/50 shrink-0" />}
                            <span className="truncate">{formatFolderLabel(root)}</span>
                          </span>
                          <span className={cn("text-[9px] px-1.5 py-0.2 rounded-full font-mono shrink-0", isRootSelected ? "bg-white/20 text-white" : "bg-gray-200 text-navy/60")}>
                            {rootCount}
                          </span>
                        </button>
                      </div>

                      {/* Subfolders */}
                      {!isCollapsed &&
                        subfolders.map((sub) => {
                          const isSubSelected = activeFolder === sub;
                          const subCount = assets.filter((a) => isAssetInFolder(a.folder, sub, true)).length;

                          return (
                            <div key={sub} className="flex items-center ml-4">
                              <button
                                onClick={() => setActiveFolder(sub)}
                                className={cn(
                                  "w-full flex items-center justify-between px-2 py-1 rounded-lg text-[11px] font-medium transition-all",
                                  isSubSelected ? "bg-navy text-white font-bold shadow-xs" : "text-navy/70 hover:bg-gray-100"
                                )}
                              >
                                <span className="flex items-center gap-1.5 truncate pr-1">
                                  <Folder className="w-3 h-3 text-amber-500 shrink-0" />
                                  <span className="truncate">{sub.split("/").pop()}</span>
                                </span>
                                <span className={cn("text-[9px] px-1.5 py-0.2 rounded-full font-mono shrink-0", isSubSelected ? "bg-white/20 text-white" : "bg-gray-200 text-navy/60")}>
                                  {subCount}
                                </span>
                              </button>
                            </div>
                          );
                        })}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Main Explorer Panel */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
              {/* Explorer Top Bar: Breadcrumb Path + Search & Multi-select & Subfolders Toggle */}
              <div className="px-5 py-3 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
                <MediaBreadcrumbPath activeFolder={activeFolder} setActiveFolder={setActiveFolder} />

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Grid Column Slider */}
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1 text-xs text-navy shrink-0 shadow-xs">
                    <Grid className="w-3.5 h-3.5 text-navy/60 shrink-0" />
                    <span className="text-[10px] font-bold font-mono text-navy/70 shrink-0">
                      {gridCols} / row
                    </span>
                    <input
                      type="range"
                      min="2"
                      max="8"
                      value={gridCols}
                      onChange={(e) => setGridCols(Number(e.target.value))}
                      className="w-16 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-navy"
                      title="Adjust grid items per row"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setIncludeSubfolders(!includeSubfolders)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all border flex items-center gap-1.5 cursor-pointer shadow-xs",
                      includeSubfolders
                        ? "bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200"
                        : "bg-gray-50 text-navy border-gray-200 hover:bg-gray-100"
                    )}
                    title={includeSubfolders ? "Currently showing all nested subfolder images recursively" : "Currently showing direct folder images + subfolder cards only"}
                  >
                    <Folder className="w-3.5 h-3.5 text-amber-500" />
                    {includeSubfolders ? "Subfolders: Recursive" : "Subfolders: Direct Only"}
                  </button>

                  <div className="relative w-44">
                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search files..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-8 pr-2.5 py-1.5 text-xs text-navy placeholder:text-gray-400 focus:outline-none focus:border-red focus:bg-white transition-all"
                    />
                  </div>

                  {allowMultiple && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMultiSelectMode(!isMultiSelectMode);
                        if (isMultiSelectMode) setSelectedUrls(new Set());
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border shadow-xs ${
                        isMultiSelectMode ? "bg-navy text-white border-navy" : "bg-gray-50 text-navy border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {isMultiSelectMode ? "Done Multi-Select" : "Multi-Select"}
                    </button>
                  )}
                </div>
              </div>

              {/* Asset Grid Container */}
              <div className="p-5 overflow-y-auto flex-1 min-h-[300px]">
                {loading ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-3 text-gray-400">
                    <Loader2 className="w-6 h-6 animate-spin text-navy" />
                    <span className="text-xs font-medium">Loading media assets...</span>
                  </div>
                ) : filteredAssets.length === 0 && directSubfolders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-48 gap-2 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    <Folder className="w-8 h-8 opacity-40 text-amber-500" />
                    <p className="text-sm font-medium text-gray-500">No media assets or subfolders found in this directory.</p>
                    <p className="text-xs text-gray-400">Upload a new photo or select another folder from the tree.</p>
                  </div>
                ) : (
                  <div
                    className="grid gap-3.5"
                    style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
                  >
                    {/* Render Direct Subfolders Cards first */}
                    {!includeSubfolders && directSubfolders.map((subPath) => {
                      const folderName = subPath.split("/").pop() || subPath;
                      const childCount = assets.filter((a) => isAssetInFolder(a.folder, subPath, true)).length;

                      return (
                        <div
                          key={subPath}
                          onClick={() => setActiveFolder(subPath)}
                          className="group relative bg-amber-50/60 border border-amber-200/80 hover:border-amber-400 rounded-xl p-3.5 cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col justify-between aspect-square"
                        >
                          <div className="flex-1 flex flex-col items-center justify-center text-center gap-2">
                            <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white transition-all shadow-xs">
                              <Folder className="w-6 h-6 fill-current" />
                            </div>
                            <div>
                              <h5 className="font-oswald text-xs font-bold uppercase text-navy group-hover:text-red transition-colors truncate max-w-[120px]" title={folderName}>
                                {folderName}
                              </h5>
                              <span className="text-[10px] text-gray-500 font-mono block mt-0.5">
                                {childCount} asset{childCount === 1 ? "" : "s"}
                              </span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[9px] font-mono text-amber-700 font-bold uppercase">
                            <span>Subfolder</span>
                            <span className="group-hover:translate-x-1 transition-transform">Open ↗</span>
                          </div>
                        </div>
                      );
                    })}

                    {/* Render Direct Assets */}
                    {filteredAssets.map((asset) => {
                      const isSelected = selectedUrls.has(asset.url);

                      return (
                        <div
                          key={asset.id}
                          onClick={() => {
                            if (isMultiSelectMode) {
                              setSelectedUrls((prev) => {
                                const next = new Set(prev);
                                if (next.has(asset.url)) next.delete(asset.url);
                                else next.add(asset.url);
                                return next;
                              });
                            } else {
                              onSelect(asset.url);
                              onClose();
                            }
                          }}
                          className={cn(
                            "group relative bg-gray-50 border rounded-xl overflow-hidden cursor-pointer hover:shadow-md transition-all duration-200 flex flex-col justify-between aspect-square",
                            isSelected ? "border-red ring-2 ring-red ring-offset-1" : "border-gray-200 hover:border-red"
                          )}
                        >
                          <div className="aspect-square relative overflow-hidden bg-gray-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.url}
                              alt={asset.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />

                            {/* Multi-Select Checkbox overlay */}
                            {isMultiSelectMode ? (
                              <div
                                className={cn(
                                  "absolute top-2 left-2 w-5 h-5 rounded-md border flex items-center justify-center transition-all z-10",
                                  isSelected ? "bg-red border-red text-white shadow-xs" : "bg-white/90 border-gray-300"
                                )}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            ) : (
                              /* Quick Hover Actions Overlay */
                              <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1.5 z-10 overflow-hidden">
                                <span className="bg-red text-white text-[10px] font-oswald uppercase tracking-wider font-bold px-2.5 py-1 rounded-full flex items-center justify-center gap-1 shadow-xs max-w-[95%] truncate">
                                  <Check className="w-3 h-3 shrink-0" />
                                  {gridCols >= 7 ? "" : "Select"}
                                </span>

                                <div className="flex items-center justify-center gap-1 mt-0.5 max-w-full">
                                  <button
                                    type="button"
                                    onClick={(e) => handleCropAsset(asset, e)}
                                    className="bg-white/95 text-navy hover:bg-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                                    title="Crop / Round Crop"
                                  >
                                    <Crop className="w-3 h-3 text-red shrink-0" />
                                    {gridCols < 6 && <span>Crop</span>}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => handleRenameAsset(asset, e)}
                                    className="bg-white/95 text-navy hover:bg-white px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-xs cursor-pointer hover:scale-105 transition-transform shrink-0"
                                    title="Rename Image"
                                  >
                                    <Edit2 className="w-3 h-3 text-navy shrink-0" />
                                    {gridCols < 6 && <span>Rename</span>}
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium text-navy truncate" title={asset.name}>
                                {asset.name}
                              </p>
                              <p className="text-[9px] text-gray-400 uppercase tracking-wider truncate">{asset.folder || "general"}</p>
                            </div>
                            {!isMultiSelectMode && (
                              <button
                                type="button"
                                onClick={(e) => handleRenameAsset(asset, e)}
                                className="text-gray-300 hover:text-navy p-1 transition-colors shrink-0"
                                title="Rename Image"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Bar for Multi-Select Confirmation */}
          {selectedUrls.size > 0 && (
            <div className="px-6 py-3 bg-navy text-white flex items-center justify-between gap-4 border-t border-navy/20 shrink-0">
              <div className="text-xs font-medium">
                <span className="font-oswald uppercase tracking-wider font-bold text-red">
                  {selectedUrls.size} Image(s) Selected
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedUrls(new Set())}
                  className="px-3 py-1.5 rounded-lg text-xs text-gray-300 hover:text-white transition-colors"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const urlArr = Array.from(selectedUrls);
                    if (onSelectMultiple) {
                      onSelectMultiple(urlArr);
                    } else if (urlArr.length > 0) {
                      onSelect(urlArr[0]);
                    }
                    onClose();
                  }}
                  className="bg-red hover:bg-red/90 text-white px-5 py-1.5 rounded-lg text-xs font-oswald uppercase tracking-widest font-bold shadow-xs transition-all cursor-pointer"
                >
                  Confirm Selection ({selectedUrls.size})
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* Dynamic Modals */}
        <FolderCreateModal
          isOpen={folderModalState.isOpen}
          initialValue={folderModalState.initialValue}
          allFolders={folderList}
          onClose={() => setFolderModalState({ isOpen: false, initialValue: "" })}
          onSubmit={(newFolder) => {
            setCustomFolders((prev) => Array.from(new Set([...prev, newFolder])));
            setActiveFolder(newFolder);
            toast(`Folder '${newFolder}' created`, "success");
          }}
        />
        <PromptModal isOpen={Boolean(promptConfig)} config={promptConfig} />
        <ImageCropperModal
          isOpen={isCropperOpen}
          imageSrc={cropperSrc}
          onClose={() => {
            setIsCropperOpen(false);
            setCropperSrc(null);
          }}
          onCropComplete={async (croppedFile, croppedUrl) => {
            toast("Uploading cropped asset...");
            await startUpload([croppedFile]);
            onSelect(croppedUrl);
            onClose();
          }}
        />
      </div>
    </AnimatePresence>
  );
}
