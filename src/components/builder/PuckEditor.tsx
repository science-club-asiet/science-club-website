"use client";

import { useRef } from "react";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "@/lib/puck/config";
import { savePuckData } from "@/lib/admin/puckActions";
import { toast } from "@/components/ui/Toast";

export function PuckEditor({
  kind, id, data, title, backHref, previewHref,
}: {
  kind: string;
  id: string;
  data: Partial<Data>;
  title: string;
  backHref: string;
  previewHref?: string;
}) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = async (d: Data) => {
    const res = await savePuckData(kind, id, d);
    if (res.error) toast(`Save failed: ${res.error}`, "error");
    else toast("Saved", "success");
  };

  const onChange = (d: Data) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void save(d), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-white">
      <Puck
        config={puckConfig}
        data={data as Data}
        onChange={onChange}
        onPublish={save}
        headerTitle={title}
        overrides={{
          headerActions: ({ children }) => (
            <>
              <a href={backHref} className="text-sm text-navy/70 hover:text-red px-3 py-1.5">← Exit</a>
              {previewHref && (
                <a href={previewHref} target="_blank" rel="noreferrer" className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 hover:border-red">
                  Preview
                </a>
              )}
              {children}
            </>
          ),
        }}
      />
    </div>
  );
}
