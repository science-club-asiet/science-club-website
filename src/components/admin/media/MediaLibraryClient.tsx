"use client";

import React, { useState, useCallback, useTransition, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud, Folder, Image as ImageIcon, Search, Trash2, Link as LinkIcon, RotateCw,
  FolderPlus, Edit2, Check, FolderOpen, ChevronDown, ChevronRight, FolderPlus as SubfolderIcon, Crop
} from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import {
  updateMediaAsset, deleteMediaAsset, syncUploadThingAssets,
  renameMediaFolder, deleteMediaFolder
} from "@/lib/admin/media-actions";
import { getDynamicFolders, formatFolderLabel, isAssetInFolder } from "@/lib/admin/media-folder-utils";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal, PromptModal, type ConfirmConfig, type PromptConfig } from "@/components/ui/ModalDialog";
import { FolderAutocompleteInput } from "@/components/admin/media/FolderAutocompleteInput";
import { FolderCreateModal } from "@/components/admin/media/FolderCreateModal";
import { FolderMoveModal } from "@/components/admin/media/FolderMoveModal";
import { compressImageFile, formatAltTextFromName } from "@/lib/admin/image-compression";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";

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

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const k = 1024, sizes = ["B", "KB", "MB", "GB"], i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

export function MediaLibraryClient({
  initialAssets,
  onSelectMode = false,
  onSelectAsset,
}: {
  initialAssets: MediaAsset[];
  onSelectMode?: boolean;
  onSelectAsset?: (url: string) => void;
}) {
  const router = useRouter();
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [customFolders, setCustomFolders] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [folderSearchQuery, setFolderSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [inspectorFolder, setInspectorFolder] = useState("");
  const [inspectorName, setInspectorName] = useState("");
  const [inspectorAlt, setInspectorAlt] = useState("");
  const [collapsedFolders, setCollapsedFolders] = useState<Record<string, boolean>>({});

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isMultiSelect, setIsMultiSelect] = useState(false);
  const [imgDimensions, setImgDimensions] = useState<{ width: number; height: number } | null>(null);

  // Folder Move Modal state
  const [moveModalState, setMoveModalState] = useState<{ isOpen: boolean; count: number; initialFolder: string }>({
    isOpen: false,
    count: 0,
    initialFolder: "general",
  });

  // Image Cropper modal state
  const [cropperSrc, setCropperSrc] = useState<string | File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);

  const [isPending, startTransition] = useTransition();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Modals state
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [folderModalState, setFolderModalState] = useState<{ isOpen: boolean; initialValue: string }>({
    isOpen: false,
    initialValue: "",
  });

  // Sync assets state with initialAssets prop on server revalidate
  useEffect(() => {
    setAssets(initialAssets);
  }, [initialAssets]);

  // Sync inspector values and measure image resolution when selectedAsset changes
  useEffect(() => {
    if (selectedAsset) {
      setInspectorFolder(selectedAsset.folder || "general");
      setInspectorName(selectedAsset.name || "");
      setInspectorAlt(selectedAsset.alt || "");

      if (selectedAsset.width && selectedAsset.height) {
        setImgDimensions({ width: selectedAsset.width, height: selectedAsset.height });
      } else {
        setImgDimensions(null);
        const img = new Image();
        img.src = selectedAsset.url;
        img.onload = () => {
          setImgDimensions({ width: img.naturalWidth, height: img.naturalHeight });
        };
      }
    }
  }, [selectedAsset]);

  // Derive all dynamic folders and subfolders
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

  // Filtered folder list based on folder search query
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

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncUploadThingAssets();
      if (res.synced > 0) {
        toast(`Synced ${res.synced} file(s) from UploadThing`, "success");
      } else {
        toast("All UploadThing files are synced", "success");
      }
      router.refresh();
    } catch (err: unknown) {
      toast("Sync error: " + (err as Error).message, "error");
    }
    setIsSyncing(false);
  };

  const { startUpload, isUploading } = useUploadThing("imageUploader", {
    onClientUploadComplete: () => {
      setUploadProgress(0);
      toast("Assets uploaded & auto-compressed", "success");
      router.refresh();
    },
    onUploadProgress: setUploadProgress,
    onUploadError: (e) => {
      setUploadProgress(0);
      toast(`Upload failed: ${e.message}`, "error");
    },
  });

  const onFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      const fileArr = Array.from(files);
      toast("Compressing & optimizing image(s)...");
      const compressedList = await Promise.all(fileArr.map((f) => compressImageFile(f)));
      void startUpload(compressedList);
    },
    [startUpload]
  );

  // Filtering assets
  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      if (!isAssetInFolder(a.folder, activeFolder)) return false;
      if (searchQuery && !a.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [assets, activeFolder, searchQuery]);

  // Asset Details Update Handler
  async function handleUpdateAsset(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedAsset) return;
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const alt = (fd.get("alt") as string).trim();
    const folder = inspectorFolder.trim() || "general";

    // Immediately update local state so UI updates instantly
    setAssets((prev) =>
      prev.map((a) => (a.id === selectedAsset.id ? { ...a, name, alt, folder } : a))
    );
    setSelectedAsset((prev) => (prev ? { ...prev, name, alt, folder } : null));

    startTransition(async () => {
      try {
        await updateMediaAsset(selectedAsset.id, { name, alt, folder });
        toast("Asset details saved", "success");
        router.refresh();
      } catch (err: unknown) {
        toast("Failed to update: " + (err as Error).message, "error");
      }
    });
  }

  function handleDeleteAsset(id: string) {
    setConfirmConfig({
      title: "Delete Media Asset",
      message: "Are you sure you want to delete this asset? It may break public pages where it is used.",
      confirmText: "Delete Asset",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        setAssets((prev) => prev.filter((a) => a.id !== id));
        setSelectedAsset(null);
        startTransition(async () => {
          try {
            await deleteMediaAsset(id);
            toast("Asset deleted", "success");
            router.refresh();
          } catch (err: unknown) {
            toast("Failed to delete: " + (err as Error).message, "error");
          }
        });
      },
    });
  }

  // Multi-selection Handlers
  const toggleSelectAsset = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(filteredAssets.map((a) => a.id)));
  };

  const handleDeselectAll = () => {
    setSelectedIds(new Set());
  };

  const handleBatchDelete = () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    setConfirmConfig({
      title: `Delete ${count} Selected Asset(s)`,
      message: `Are you sure you want to delete ${count} selected assets permanently? This cannot be undone.`,
      confirmText: `Delete ${count} Assets`,
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        const ids = Array.from(selectedIds);
        setAssets((prev) => prev.filter((a) => !selectedIds.has(a.id)));
        setSelectedIds(new Set());
        setSelectedAsset(null);

        startTransition(async () => {
          try {
            await Promise.all(ids.map((id) => deleteMediaAsset(id)));
            toast(`Deleted ${count} asset(s)`, "success");
            router.refresh();
          } catch (err: unknown) {
            toast("Batch delete error: " + (err as Error).message, "error");
          }
        });
      },
    });
  };

  const handleBatchMoveFolder = () => {
    if (selectedIds.size === 0) return;
    setMoveModalState({
      isOpen: true,
      count: selectedIds.size,
      initialFolder: activeFolder === "all" ? "general" : activeFolder,
    });
  };

  const handleMoveModalSubmit = (newFolder: string) => {
    const count = selectedIds.size;
    setMoveModalState({ isOpen: false, count: 0, initialFolder: "general" });
    const clean = newFolder.trim().toLowerCase() || "general";
    const ids = Array.from(selectedIds);

    setAssets((prev) =>
      prev.map((a) => (selectedIds.has(a.id) ? { ...a, folder: clean } : a))
    );
    setSelectedIds(new Set());

    startTransition(async () => {
      try {
        await Promise.all(ids.map((id) => updateMediaAsset(id, { folder: clean })));
        toast(`Moved ${count} asset(s) to '${clean}'`, "success");
        router.refresh();
      } catch (err: unknown) {
        toast("Failed to move assets: " + (err as Error).message, "error");
      }
    });
  };

  const handleBatchCopyUrls = () => {
    if (selectedIds.size === 0) return;
    const selectedUrls = assets.filter((a) => selectedIds.has(a.id)).map((a) => a.url);
    navigator.clipboard.writeText(selectedUrls.join("\n"));
    toast(`Copied ${selectedUrls.length} URL(s) to clipboard`, "success");
  };

  // Folder Tree Actions
  function toggleFolderCollapse(root: string, e: React.MouseEvent) {
    e.stopPropagation();
    setCollapsedFolders((prev) => ({ ...prev, [root]: !prev[root] }));
  }

  function handleCreateFolder(initialPath = "") {
    setFolderModalState({ isOpen: true, initialValue: initialPath });
  }

  function handleFolderCreated(folderPath: string) {
    const clean = folderPath.trim().toLowerCase();
    if (!clean) return;
    setCustomFolders((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
    setActiveFolder(clean);
    toast(`Folder '${clean}' created`, "success");
  }

  function handleRenameFolder(folderPath: string, e: React.MouseEvent) {
    e.stopPropagation();
    setPromptConfig({
      title: `Rename Folder '${folderPath}'`,
      label: "Enter new folder name or subfolder path:",
      initialValue: folderPath,
      submitText: "Rename Folder",
      onCancel: () => setPromptConfig(null),
      onSubmit: (newFolder: string) => {
        setPromptConfig(null);
        const clean = newFolder.trim().toLowerCase();
        if (!clean || clean === folderPath) return;

        setAssets((prev) =>
          prev.map((a) => {
            if (a.folder === folderPath) return { ...a, folder: clean };
            if (a.folder.startsWith(folderPath + "/")) {
              return { ...a, folder: clean + a.folder.slice(folderPath.length) };
            }
            return a;
          })
        );
        if (activeFolder === folderPath) setActiveFolder(clean);

        startTransition(async () => {
          try {
            await renameMediaFolder(folderPath, clean);
            toast(`Folder renamed to '${clean}'`, "success");
            router.refresh();
          } catch (err: unknown) {
            toast("Failed to rename: " + (err as Error).message, "error");
          }
        });
      },
    });
  }

  function handleDeleteFolder(folderPath: string, e: React.MouseEvent) {
    e.stopPropagation();
    setConfirmConfig({
      title: `Delete Folder '${folderPath}'`,
      message: `Delete folder '${folderPath}'? All assets inside will be moved to 'general'.`,
      confirmText: "Delete Folder",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        setAssets((prev) =>
          prev.map((a) =>
            a.folder === folderPath || a.folder.startsWith(folderPath + "/")
              ? { ...a, folder: "general" }
              : a
          )
        );
        if (activeFolder === folderPath) setActiveFolder("all");
        setCustomFolders((prev) => prev.filter((f) => f !== folderPath));

        startTransition(async () => {
          try {
            await deleteMediaFolder(folderPath);
            toast(`Folder '${folderPath}' deleted`, "success");
            router.refresh();
          } catch (err: unknown) {
            toast("Failed to delete folder: " + (err as Error).message, "error");
          }
        });
      },
    });
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast("URL copied to clipboard", "success");
  };

  return (
    <div className="flex h-full bg-white rounded-2xl border border-gray-200 overflow-hidden font-inter">
      {/* Sidebar */}
      <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/50 shrink-0">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-oswald uppercase font-bold text-navy text-lg">Folders</h2>
          <button
            type="button"
            onClick={() => handleCreateFolder("")}
            className="p-1.5 text-navy/70 hover:text-navy hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-200 cursor-pointer flex items-center gap-1 text-[11px] font-bold"
            title="Create New Folder"
          >
            <FolderPlus className="w-4 h-4 text-red" />
          </button>
        </div>

        {/* Folder Search Bar */}
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search folders..."
              value={folderSearchQuery}
              onChange={(e) => setFolderSearchQuery(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-navy focus:outline-none focus:border-red"
            />
          </div>
        </div>

        {/* Collapsible Folder Tree */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => setActiveFolder("all")}
            className={cn(
              "w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
              activeFolder === "all" ? "bg-navy text-white shadow-sm" : "text-navy/70 hover:bg-gray-100"
            )}
          >
            <ImageIcon className="w-4 h-4" /> All Assets
          </button>

          <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-navy/40">
            Folders Tree
          </div>

          {filteredFolderTree.map(({ root, subfolders }) => {
            const isRootSelected = activeFolder === root;
            const rootCount = assets.filter((a) => isAssetInFolder(a.folder, root)).length;
            const hasSubfolders = subfolders.length > 0;
            const isCollapsed = Boolean(collapsedFolders[root]);

            return (
              <div key={root} className="space-y-0.5">
                {/* Root Folder Item */}
                <div className="group relative flex items-center">
                  {hasSubfolders && (
                    <button
                      type="button"
                      onClick={(e) => toggleFolderCollapse(root, e)}
                      className="p-1 text-gray-400 hover:text-navy transition-colors shrink-0"
                      title={isCollapsed ? "Expand subfolders" : "Collapse subfolders"}
                    >
                      {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}

                  <button
                    onClick={() => setActiveFolder(root)}
                    className={cn(
                      "w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all",
                      !hasSubfolders && "ml-4",
                      isRootSelected ? "bg-navy text-white font-bold shadow-sm" : "text-navy/80 hover:bg-gray-100"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate pr-2">
                      {isRootSelected ? <FolderOpen className="w-3.5 h-3.5 shrink-0 text-red" /> : <Folder className="w-3.5 h-3.5 shrink-0 text-navy/50" />}
                      <span className="truncate">{formatFolderLabel(root)}</span>
                    </span>
                    <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full font-mono shrink-0", isRootSelected ? "bg-white/20 text-white" : "bg-gray-200 text-navy/60")}>
                      {rootCount}
                    </span>
                  </button>

                  {/* Root Folder Hover Actions */}
                  <div className="absolute right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-gray-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleCreateFolder(`${root}/`)}
                      className="p-1 text-gray-400 hover:text-red"
                      title="Add Subfolder"
                    >
                      <SubfolderIcon className="w-3 h-3" />
                    </button>
                    {root !== "general" && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleRenameFolder(root, e)}
                          className="p-1 text-gray-400 hover:text-navy"
                          title="Rename Folder"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteFolder(root, e)}
                          className="p-1 text-gray-400 hover:text-red"
                          title="Delete Folder"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Subfolders List (Collapsible) */}
                {!isCollapsed &&
                  subfolders.map((sub) => {
                    const isSubSelected = activeFolder === sub;
                    const subCount = assets.filter((a) => isAssetInFolder(a.folder, sub)).length;

                    return (
                      <div key={sub} className="group relative flex items-center ml-5">
                        <button
                          onClick={() => setActiveFolder(sub)}
                          className={cn(
                            "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all",
                            isSubSelected ? "bg-navy text-white font-bold shadow-sm" : "text-navy/70 hover:bg-gray-100"
                          )}
                        >
                          <span className="flex items-center gap-2 truncate pr-2">
                            {isSubSelected ? <FolderOpen className="w-3 h-3 shrink-0 text-red" /> : <Folder className="w-3 h-3 shrink-0 text-navy/40" />}
                            <span className="truncate">{formatFolderLabel(sub)}</span>
                          </span>
                          <span className={cn("text-[9px] px-1.5 py-0.5 rounded-full font-mono shrink-0", isSubSelected ? "bg-white/20 text-white" : "bg-gray-200 text-navy/60")}>
                            {subCount}
                          </span>
                        </button>

                        <div className="absolute right-1 opacity-0 group-hover:opacity-100 flex items-center gap-1 bg-white/90 backdrop-blur-sm p-1 rounded-md shadow-sm border border-gray-100 transition-opacity">
                          <button
                            type="button"
                            onClick={(e) => handleRenameFolder(sub, e)}
                            className="p-1 text-gray-400 hover:text-navy"
                            title="Rename Subfolder"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteFolder(sub, e)}
                            className="p-1 text-gray-400 hover:text-red"
                            title="Delete Subfolder"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </div>

        {/* Dropzone */}
        <div className="p-3 border-t border-gray-100">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              onFiles(e.dataTransfer.files);
            }}
            className={cn(
              "border-2 border-dashed rounded-xl p-3 text-center transition-colors relative overflow-hidden",
              dragOver ? "border-red bg-red/5" : "border-gray-200 bg-white"
            )}
          >
            <UploadCloud className={cn("w-5 h-5 mx-auto mb-1", isUploading ? "text-red animate-pulse" : "text-navy/40")} />
            <p className="text-[11px] text-navy/70 font-medium">
              {isUploading ? `Uploading ${uploadProgress}%` : "Drop images to upload"}
            </p>
            {isUploading && (
              <div className="absolute bottom-0 left-0 h-1 bg-red transition-all" style={{ width: `${uploadProgress}%` }} />
            )}
            <input type="file" multiple accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={(e) => onFiles(e.target.files)} />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-navy focus:outline-none focus:border-red"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setIsMultiSelect(!isMultiSelect);
                if (isMultiSelect) setSelectedIds(new Set());
              }}
              className={cn(
                "px-3.5 py-1.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 border shadow-sm cursor-pointer",
                isMultiSelect ? "bg-navy text-white border-navy" : "bg-white text-navy border-gray-200 hover:border-navy"
              )}
            >
              <Check className="w-3.5 h-3.5" />
              {isMultiSelect ? "Done Selecting" : "Select Multiple"}
            </button>

            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="bg-white border border-gray-200 text-navy hover:border-red hover:text-red px-3.5 py-1.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
              title="Sync files from UploadThing"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Cloud"}
            </button>
            <div className="text-xs font-bold text-navy/60 uppercase tracking-wider">{filteredAssets.length} items</div>
          </div>
        </div>

        {/* Multi-Select Floating Batch Actions Bar */}
        {(isMultiSelect || selectedIds.size > 0) && (
          <div className="px-6 py-2.5 bg-navy text-white flex items-center justify-between gap-4 border-b border-navy/20 shrink-0">
            <div className="flex items-center gap-3 text-xs font-medium">
              <span className="font-oswald uppercase tracking-wider font-bold text-red">
                {selectedIds.size} Selected
              </span>
              <button onClick={handleSelectAll} className="hover:underline text-gray-300 text-[11px]">
                Select All ({filteredAssets.length})
              </button>
              <span>•</span>
              <button onClick={handleDeselectAll} className="hover:underline text-gray-300 text-[11px]">
                Deselect All
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleBatchCopyUrls}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5" /> Copy URLs
                </button>
                <button
                  type="button"
                  onClick={handleBatchMoveFolder}
                  className="bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Folder className="w-3.5 h-3.5" /> Move
                </button>
                <button
                  type="button"
                  onClick={handleBatchDelete}
                  className="bg-red hover:bg-red/90 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-max">
            {filteredAssets.map((asset) => {
              const isSelected = selectedIds.has(asset.id);
              const isCurrentInspector = selectedAsset?.id === asset.id;

              return (
                <div
                  key={asset.id}
                  onClick={(e) => {
                    if (isMultiSelect || e.shiftKey || e.ctrlKey || e.metaKey) {
                      toggleSelectAsset(asset.id, e);
                    } else {
                      setSelectedAsset(asset);
                    }
                  }}
                  className={cn(
                    "group relative bg-white rounded-xl border overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected
                      ? "border-red ring-2 ring-red ring-offset-1"
                      : isCurrentInspector
                      ? "border-navy ring-2 ring-navy/10"
                      : "border-gray-200 hover:border-navy"
                  )}
                >
                  <div className="aspect-square relative overflow-hidden bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={asset.url} alt={asset.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

                    {/* Checkbox overlay */}
                    <div
                      onClick={(e) => toggleSelectAsset(asset.id, e)}
                      className={cn(
                        "absolute top-2 left-2 w-5 h-5 rounded-md border flex items-center justify-center transition-all cursor-pointer z-10",
                        isSelected
                          ? "bg-red border-red text-white shadow-sm"
                          : "bg-white/80 border-gray-300 opacity-0 group-hover:opacity-100 hover:bg-white"
                      )}
                      title="Select Image"
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-medium text-navy truncate" title={asset.name}>
                      {asset.name}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">{asset.folder}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Inspector Sidebar */}
      {selectedAsset && (
        <div className="w-80 border-l border-gray-100 flex flex-col bg-white shrink-0">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-oswald uppercase font-bold text-navy">Asset Details</h3>
            <button onClick={() => setSelectedAsset(null)} className="text-gray-400 hover:text-navy">
              &times;
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={selectedAsset.url} alt="" className="w-full rounded-lg border border-gray-200 bg-white shadow-sm" />
            </div>

            <form id="asset-form" onSubmit={handleUpdateAsset} className="p-4 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Asset Name</label>
                <input
                  key={selectedAsset.id}
                  name="name"
                  value={inspectorName}
                  onChange={(e) => setInspectorName(e.target.value)}
                  required
                  className="w-full text-xs font-medium border border-gray-200 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-red bg-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-navy/60 mb-0.5">Resolution</label>
                  <div className="text-[11px] font-mono font-bold text-navy">
                    {imgDimensions
                      ? `${imgDimensions.width}×${imgDimensions.height}`
                      : selectedAsset.width && selectedAsset.height
                      ? `${selectedAsset.width}×${selectedAsset.height}`
                      : "..."}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-navy/60 mb-0.5">Format</label>
                  <div className="text-[11px] font-mono truncate text-navy">
                    {selectedAsset.mime?.split("/")[1]?.toUpperCase() || selectedAsset.mime}
                  </div>
                </div>
                <div>
                  <label className="block text-[9px] font-bold uppercase tracking-widest text-navy/60 mb-0.5">Size</label>
                  <div className="text-[11px] font-mono text-navy">{formatBytes(selectedAsset.size)}</div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Folder / Subfolder</label>
                  <FolderAutocompleteInput
                    name="folder"
                    value={inspectorFolder}
                    onChange={setInspectorFolder}
                    allFolders={folderList}
                    placeholder="e.g. events/2026"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Select base folder or type &apos;/&apos; for live subfolder suggestions</p>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/60 mb-1">Alt Text</label>
                  <textarea
                    key={`alt-${selectedAsset.id}`}
                    name="alt"
                    value={inspectorAlt}
                    onChange={(e) => setInspectorAlt(e.target.value)}
                    rows={2}
                    className="w-full text-xs border border-gray-200 rounded-lg p-2.5 text-navy focus:outline-none focus:border-red bg-white"
                    placeholder="Describe the image..."
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="p-4 border-t border-gray-100 space-y-2 bg-gray-50">
            <button
              type="button"
              onClick={() => {
                setCropperSrc(selectedAsset.url);
                setIsCropperOpen(true);
              }}
              className="w-full bg-white border border-gray-200 text-navy px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm mb-1"
            >
              <Crop className="w-3.5 h-3.5 text-red" /> Crop / Round Crop
            </button>

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
                className="w-full bg-navy text-white px-4 py-2.5 rounded-lg font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isPending ? "Saving..." : "Save Details"}
              </button>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopyUrl(selectedAsset.url)}
                className="flex-1 bg-white border border-gray-200 text-navy px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <LinkIcon className="w-3 h-3" /> Copy URL
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAsset(selectedAsset.id)}
                disabled={isPending}
                className="flex-1 bg-white border border-red/20 text-red px-3 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-red/5 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Theme Modals */}
      <ConfirmModal isOpen={Boolean(confirmConfig)} config={confirmConfig} />
      <PromptModal isOpen={Boolean(promptConfig)} config={promptConfig} />
      <FolderCreateModal
        isOpen={folderModalState.isOpen}
        initialValue={folderModalState.initialValue}
        allFolders={folderList}
        onClose={() => setFolderModalState({ isOpen: false, initialValue: "" })}
        onSubmit={handleFolderCreated}
      />
      <FolderMoveModal
        isOpen={moveModalState.isOpen}
        count={moveModalState.count}
        initialFolder={moveModalState.initialFolder}
        allFolders={folderList}
        onClose={() => setMoveModalState({ isOpen: false, count: 0, initialFolder: "general" })}
        onSubmit={handleMoveModalSubmit}
      />
      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropperSrc}
        onClose={() => {
          setIsCropperOpen(false);
          setCropperSrc(null);
        }}
        onCropComplete={async (croppedFile) => {
          toast("Uploading cropped asset...");
          await startUpload([croppedFile]);
        }}
      />
    </div>
  );
}
