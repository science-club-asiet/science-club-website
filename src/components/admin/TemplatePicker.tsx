"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Copy } from "lucide-react";
import { getTemplates, type Template } from "@/lib/admin/template-actions";

export function TemplatePicker({ kind }: { kind: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTemplateId = searchParams.get("templateId");
  
  const [templates, setTemplates] = useState<Template[]>([]);
  
  useEffect(() => {
    getTemplates(kind).then(setTemplates).catch(console.error);
  }, [kind]);

  if (templates.length === 0) return null;

  return (
    <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-navy shrink-0">
          <Copy className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-navy">Start from a template</p>
          <p className="text-xs text-gray-500">Prefill the form with a saved layout.</p>
        </div>
      </div>
      
      <select
        value={currentTemplateId || ""}
        onChange={(e) => {
          const val = e.target.value;
          if (val) {
            router.push(`?templateId=${val}`);
          } else {
            router.push("?");
          }
        }}
        className="bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-navy focus:outline-none focus:border-red min-w-[200px]"
      >
        <option value="">Blank layout</option>
        {templates.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
    </div>
  );
}
