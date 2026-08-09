"use client";

import { deleteResourceAction } from "@/lib/admin/actions";
import { useState } from "react";
import { ConfirmModal } from "@/components/ui/ModalDialog";

export function DeleteButton({ resourceKey, id }: { resourceKey: string; id: string }) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-red transition-colors cursor-pointer"
      >
        Delete
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        config={{
          title: "Delete Item",
          message: "Are you sure you want to delete this item permanently?",
          confirmText: "Delete",
          isDanger: true,
          onCancel: () => setShowConfirm(false),
          onConfirm: async () => {
            setShowConfirm(false);
            await deleteResourceAction(resourceKey, id);
          },
        }}
      />
    </>
  );
}
