"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Folder, FolderPlus, FolderOpen, Check, Layers, ChevronRight } from "lucide-react";
import { FolderAutocompleteInput } from "./FolderAutocompleteInput";
import { formatFolderLabel } from "@/lib/admin/media-folder-utils";

export function FolderMoveModal({
  isOpen,
  count,
  initialFolder,
  allFolders,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  count: number;
  initialFolder: string;
  allFolders: string[];
  onClose: () => void;
  onSubmit: (targetFolder: string) => void;
}) {
  const [targetFolder, setTargetFolder] = useState(initialFolder);

  useEffect(() => {
    setTargetFolder(initialFolder);
  }, [initialFolder, isOpen]);

  // Group base folders and subfolders for quick chips display
  const folderTree = useMemo(() => {
    const map = new Map<string, string[]>();
    allFolders.forEach((f) => {
      const parts = f.split("/");
      const root = parts[0];
      if (!map.has(root)) map.set(root, []);
      if (parts.length > 1) {
        map.get(root)?.push(f);
      }
    });
    return Array.from(map.entries()).map(([root, subfolders]) => ({
      root,
      subfolders,
    }));
  }, [allFolders]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = targetFolder.trim().toLowerCase() || "general";
    onSubmit(clean);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[400] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden font-inter flex flex-col"
        >
          {/* Top Bar */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-navy text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-red text-white flex items-center justify-center shadow-sm">
                <FolderOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-oswald text-lg font-bold uppercase text-white leading-none">
                  Move {count} Selected Asset(s)
                </h3>
                <p className="text-xs text-white/70 mt-0.5">Select target base folder or subfolder</p>
              </div>
            </div>

            <button onClick={onClose} className="p-1.5 text-white/60 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy/70 mb-1.5">
                Target Folder / Subfolder
              </label>
              <FolderAutocompleteInput
                value={targetFolder}
                onChange={setTargetFolder}
                allFolders={allFolders}
                placeholder="e.g. events/2026 or execom"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Type &apos;/&apos; for subfolder autocomplete or select from available folders below
              </p>
            </div>

            {/* Visual Quick Select Tree / Chips */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-navy/50 mb-2 flex items-center gap-1">
                <Layers className="w-3 h-3 text-red" />
                Available Base Folders & Subfolders:
              </label>

              <div className="max-h-48 overflow-y-auto bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2 text-xs">
                {folderTree.map(({ root, subfolders }) => (
                  <div key={root} className="space-y-1">
                    {/* Root folder tag */}
                    <button
                      type="button"
                      onClick={() => setTargetFolder(root)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-semibold flex items-center gap-1.5 transition-all w-full text-left ${
                        targetFolder.trim().toLowerCase() === root
                          ? "bg-navy text-white shadow-sm"
                          : "bg-white border border-gray-200 text-navy hover:border-navy"
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5 text-red shrink-0" />
                      <span className="truncate">{formatFolderLabel(root)}</span>
                      {targetFolder.trim().toLowerCase() === root && <Check className="w-3 h-3 ml-auto text-red" />}
                    </button>

                    {/* Subfolders tags */}
                    {subfolders.length > 0 && (
                      <div className="pl-4 flex flex-wrap gap-1">
                        {subfolders.map((sub) => {
                          const isSubSelected = targetFolder.trim().toLowerCase() === sub.toLowerCase();
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => setTargetFolder(sub)}
                              className={`px-2 py-0.5 rounded-md font-mono text-[10px] flex items-center gap-1 transition-all ${
                                isSubSelected
                                  ? "bg-red text-white font-bold shadow-sm"
                                  : "bg-gray-200/70 text-navy/80 hover:bg-gray-200"
                              }`}
                            >
                              <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
                              <span className="truncate">{sub}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-xs uppercase tracking-wider text-navy hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-red hover:bg-navy text-white px-5 py-2 rounded-xl font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Move Assets
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
