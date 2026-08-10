"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FolderPlus, X } from "lucide-react";
import { FolderAutocompleteInput } from "./FolderAutocompleteInput";

export function FolderCreateModal({
  isOpen,
  initialValue = "",
  allFolders,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  initialValue?: string;
  allFolders: string[];
  onClose: () => void;
  onSubmit: (folderPath: string) => void;
}) {
  const [folderPath, setFolderPath] = useState(initialValue);
  const [prevInit, setPrevInit] = useState(initialValue);

  if (initialValue !== prevInit) {
    setPrevInit(initialValue);
    setFolderPath(initialValue);
  }

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[320] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-navy text-white border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 font-inter relative"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <FolderPlus className="w-5 h-5 text-red" />
              <h3 className="font-oswald text-xl uppercase font-bold tracking-wide text-white">
                Create New Folder / Subfolder
              </h3>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const clean = folderPath.trim().toLowerCase();
              if (clean) {
                onSubmit(clean);
                onClose();
              }
            }}
            className="space-y-4"
          >
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">
                Enter Folder or Subfolder Path:
              </label>

              <FolderAutocompleteInput
                value={folderPath}
                onChange={setFolderPath}
                allFolders={allFolders}
                placeholder="e.g. events/2026 or team/execom"
              />
              <p className="text-[10px] text-white/50 mt-1.5 font-mono">
                Select base folder or type &apos;/&apos; for live subfolder suggestions (LIKE search)
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full border border-white/20 font-oswald text-xs uppercase tracking-widest font-bold hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-navy transition-all shadow-md cursor-pointer"
              >
                Create Folder
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
