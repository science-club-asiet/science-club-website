"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X } from "lucide-react";

type ToastMessage = { id: number; text: string; type: "success" | "error" };

let toastId = 0;
type Listener = (msg: ToastMessage) => void;
const listeners = new Set<Listener>();

export function toast(text: string, type: "success" | "error" = "success") {
  const msg = { id: ++toastId, text, type };
  listeners.forEach((l) => l(msg));
}

export function ToastProvider() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const listener = (msg: ToastMessage) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        setMessages((prev) => prev.filter((m) => m.id !== msg.id));
      }, 3000);
    };
    listeners.add(listener);
    return () => { listeners.delete(listener); };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {messages.map((m) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
            className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.05)] border ${
              m.type === "success" ? "bg-white border-gray-200 text-navy" : "bg-red text-white border-red"
            }`}
          >
            {m.type === "success" ? (
              <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-green-700" />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <X className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-sm font-medium">{m.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
