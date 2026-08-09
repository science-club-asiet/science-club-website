"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy } from "lucide-react";
import { duplicateFormAction } from "@/lib/admin/formActions";
import { toast } from "@/components/ui/Toast";

export function DuplicateFormButton({ formId, className }: { formId: string; className?: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        const res = await duplicateFormAction(formId);
        if (res.error) {
          toast(res.error, "error");
        } else {
          toast("Form duplicated successfully!", "success");
          if (res.id) router.push(`/admin/forms/${res.id}`);
          else router.refresh();
        }
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDuplicate}
      disabled={isPending}
      className={
        className ||
        "text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
      }
      title="Duplicate Form & Fields"
    >
      <Copy className="w-3.5 h-3.5 text-navy/60" />
      {isPending ? "Duplicating..." : "Duplicate"}
    </button>
  );
}
