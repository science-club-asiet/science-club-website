"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Folder, FolderPlus, ChevronRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function FolderAutocompleteInput({
  value,
  onChange,
  allFolders,
  name = "folder",
  placeholder = "e.g. events/2026",
}: {
  value: string;
  onChange: (val: string) => void;
  allFolders: string[];
  name?: string;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Split input value into prefix (before last slash) and search query (after last slash)
  const { prefix, query, isSubfolderInput } = useMemo(() => {
    const hasSlash = value.includes("/");
    if (!hasSlash) {
      return { prefix: "", query: value.trim().toLowerCase(), isSubfolderInput: false };
    }
    const lastSlashIdx = value.lastIndexOf("/");
    return {
      prefix: value.slice(0, lastSlashIdx + 1), // e.g. "events/"
      query: value.slice(lastSlashIdx + 1).trim().toLowerCase(), // e.g. "2026"
      isSubfolderInput: true,
    };
  }, [value]);

  // Extract base folders (root folders without slashes)
  const baseFolders = useMemo(() => {
    const set = new Set<string>();
    allFolders.forEach((f) => {
      const root = f.split("/")[0].trim().toLowerCase();
      if (root) set.add(root);
    });
    return Array.from(set).sort();
  }, [allFolders]);

  // Filter options based on whether user is typing a base folder or a subfolder path
  const suggestions = useMemo(() => {
    if (!isSubfolderInput) {
      // User is typing a base folder
      return baseFolders.filter((b) => b.includes(query));
    } else {
      // User typed a slash (e.g. "events/") -> search subfolders matching prefix and query (SQL LIKE match)
      const cleanPrefix = prefix.toLowerCase();
      return allFolders.filter((f) => {
        const lower = f.toLowerCase();
        if (!lower.startsWith(cleanPrefix)) return false;
        const remainder = lower.slice(cleanPrefix.length);
        return !query || remainder.includes(query);
      });
    }
  }, [isSubfolderInput, baseFolders, query, prefix, allFolders]);

  const showCreateOption = Boolean(value.trim()) && !allFolders.includes(value.trim().toLowerCase());

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <input
          name={name}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full text-xs font-mono border border-gray-200 rounded-lg px-3 py-2 text-navy focus:outline-none focus:border-red focus:ring-1 focus:ring-red bg-white pr-8"
        />
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="absolute right-2 text-gray-400 hover:text-navy p-1 transition-colors"
        >
          <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", isOpen && "rotate-90 text-red")} />
        </button>
      </div>

      {/* Autocomplete Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto font-inter text-xs">
          {/* Header indicator */}
          <div className="px-3 py-1.5 bg-gray-50 border-b border-gray-100 text-[10px] font-bold uppercase tracking-wider text-navy/50 flex items-center justify-between">
            <span>{isSubfolderInput ? `Subfolders under "${prefix}"` : "Base Folders"}</span>
            <span className="font-mono text-[9px] text-navy/40">Type &apos;/&apos; for subfolder</span>
          </div>

          {suggestions.length > 0 ? (
            <div className="p-1 space-y-0.5">
              {suggestions.map((item) => {
                const isSelected = value.trim().toLowerCase() === item.toLowerCase();
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      onChange(item);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg flex items-center justify-between font-mono transition-colors",
                      isSelected ? "bg-navy text-white font-bold" : "hover:bg-gray-100 text-navy"
                    )}
                  >
                    <span className="flex items-center gap-2 truncate">
                      <Folder className="w-3.5 h-3.5 shrink-0 opacity-70" />
                      <span className="truncate">{item}</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-red" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-400 text-[11px] italic text-center">
              No matching {isSubfolderInput ? "subfolder" : "base folder"} found.
            </div>
          )}

          {/* Quick Create Option */}
          {showCreateOption && (
            <div className="p-1 border-t border-gray-100 bg-gray-50/80">
              <button
                type="button"
                onClick={() => {
                  onChange(value.trim().toLowerCase());
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg flex items-center gap-2 text-red font-semibold hover:bg-red/10 transition-colors"
              >
                <FolderPlus className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">Use new path: &quot;{value.trim().toLowerCase()}&quot;</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
