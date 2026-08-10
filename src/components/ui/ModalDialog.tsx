"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Edit3, X } from "lucide-react";
import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConfirmConfig {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export interface PromptConfig {
  title?: string;
  label?: string;
  initialValue?: string;
  placeholder?: string;
  submitText?: string;
  cancelText?: string;
  onSubmit: (val: string) => void;
  onCancel: () => void;
}

// ── Imperative API ────────────────────────────────────────────────────────────

type ConfirmListener = (cfg: ConfirmConfig) => void;
type PromptListener  = (cfg: PromptConfig)  => void;
const confirmListeners = new Set<ConfirmListener>();
const promptListeners  = new Set<PromptListener>();

export function showConfirm(cfg: ConfirmConfig) {
  confirmListeners.forEach((l) => l(cfg));
}

export function showPrompt(cfg: PromptConfig) {
  promptListeners.forEach((l) => l(cfg));
}

// ── Global provider — mount once in AdminShell ────────────────────────────────

export function DialogProvider() {
  const [confirmCfg, setConfirmCfg] = useState<ConfirmConfig | null>(null);
  const [promptCfg,  setPromptCfg]  = useState<PromptConfig  | null>(null);

  useEffect(() => {
    const cl: ConfirmListener = (cfg) => setConfirmCfg(cfg);
    const pl: PromptListener  = (cfg) => setPromptCfg(cfg);
    confirmListeners.add(cl);
    promptListeners.add(pl);
    return () => { confirmListeners.delete(cl); promptListeners.delete(pl); };
  }, []);

  const closeConfirm = () => setConfirmCfg(null);
  const closePrompt  = () => setPromptCfg(null);

  return (
    <>
      <ConfirmModal
        isOpen={!!confirmCfg}
        config={confirmCfg ? {
          ...confirmCfg,
          onConfirm: () => { confirmCfg.onConfirm(); closeConfirm(); },
          onCancel:  () => { confirmCfg.onCancel();  closeConfirm(); },
        } : null}
      />
      <PromptModal
        isOpen={!!promptCfg}
        config={promptCfg ? {
          ...promptCfg,
          onSubmit: (val) => { promptCfg.onSubmit(val); closePrompt(); },
          onCancel: () => { promptCfg.onCancel(); closePrompt(); },
        } : null}
      />
    </>
  );
}

// ── ConfirmModal ──────────────────────────────────────────────────────────────

export function ConfirmModal({ isOpen, config }: { isOpen: boolean; config: ConfirmConfig | null }) {
  if (!isOpen || !config) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-navy text-white border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 font-inter relative"
        >
          <div className="flex items-start gap-4">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.isDanger ? "bg-red/10 text-red border border-red/30" : "bg-white/10 text-white"}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-oswald text-xl uppercase font-bold tracking-wide text-white">
                {config.title || "Confirm Action"}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {config.message}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={config.onCancel}
              className="px-5 py-2.5 rounded-full border border-white/20 font-oswald text-xs uppercase tracking-widest font-bold hover:bg-white/10 text-white transition-all cursor-pointer"
            >
              {config.cancelText || "Cancel"}
            </button>
            <button
              onClick={config.onConfirm}
              className={`px-5 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-md cursor-pointer ${
                config.isDanger ? "bg-red text-white hover:bg-white hover:text-navy" : "bg-white text-navy hover:bg-red hover:text-white"
              }`}
            >
              {config.confirmText || "Confirm"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── PromptModal ───────────────────────────────────────────────────────────────

export function PromptModal({ isOpen, config }: { isOpen: boolean; config: PromptConfig | null }) {
  const [val, setVal] = useState(config?.initialValue || "");

  useEffect(() => {
    setVal(config?.initialValue || "");
  }, [config]);

  if (!isOpen || !config) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] bg-navy/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md bg-navy text-white border border-white/15 rounded-2xl p-6 shadow-2xl space-y-5 font-inter"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <Edit3 className="w-5 h-5 text-red" />
              <h3 className="font-oswald text-xl uppercase font-bold tracking-wide text-white">
                {config.title || "Input Required"}
              </h3>
            </div>
            <button onClick={config.onCancel} className="text-white/50 hover:text-white transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              config.onSubmit(val);
            }}
            className="space-y-4"
          >
            {config.label && (
              <label className="block text-xs font-semibold uppercase tracking-widest text-white/70">
                {config.label}
              </label>
            )}
            <input
              type="text"
              autoFocus
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder={config.placeholder}
              className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/20 transition-all font-inter text-sm"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={config.onCancel}
                className="px-5 py-2.5 rounded-full border border-white/20 font-oswald text-xs uppercase tracking-widest font-bold hover:bg-white/10 text-white transition-all cursor-pointer"
              >
                {config.cancelText || "Cancel"}
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-full bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold hover:bg-white hover:text-navy transition-all shadow-md cursor-pointer"
              >
                {config.submitText || "Save"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
