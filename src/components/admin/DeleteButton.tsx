"use client";

import { deleteResourceAction } from "@/lib/admin/actions";

export function DeleteButton({ resourceKey, id }: { resourceKey: string; id: string }) {
  return (
    <form
      action={deleteResourceAction.bind(null, resourceKey, id)}
      onSubmit={(e) => {
        if (!confirm("Delete this item permanently?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="text-xs font-semibold uppercase tracking-widest text-gray-400 hover:text-red transition-colors"
      >
        Delete
      </button>
    </form>
  );
}
