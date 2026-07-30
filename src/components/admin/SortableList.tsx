"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { reorderResource } from "@/lib/admin/actions";
import { DeleteButton } from "./DeleteButton";

export type Row = { id: string; title: string; badgeLabel?: string; badgeOn?: boolean };

function Badge({ label, on }: { label?: string; on?: boolean }) {
  if (!label) return null;
  return (
    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border ${on ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500 border-gray-200"}`}>
      {label}
    </span>
  );
}

function RowActions({ resourceKey, row, showRegistrations, hasBuilder }: { resourceKey: string; row: Row; showRegistrations: boolean; hasBuilder: boolean }) {
  return (
    <>
      <Badge label={row.badgeLabel} on={row.badgeOn} />
      {hasBuilder && (
        <Link href={`/admin/pagebuilder/${resourceKey === "events" ? "event" : resourceKey === "posts" ? "post" : resourceKey}/${row.id}`} className="text-xs font-semibold uppercase tracking-widest text-red/80 hover:text-red">
          Design
        </Link>
      )}
      {showRegistrations && (
        <Link href={`/admin/registrations/${row.id}`} className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">
          Registrations
        </Link>
      )}
      <Link href={`/admin/${resourceKey}/${row.id}`} className="text-xs font-semibold uppercase tracking-widest text-navy/60 hover:text-red">
        Edit
      </Link>
      <DeleteButton resourceKey={resourceKey} id={row.id} />
    </>
  );
}

function SortableRow({ row, resourceKey, showRegistrations, hasBuilder }: { row: Row; resourceKey: string; showRegistrations: boolean; hasBuilder: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: row.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="group flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50/80 transition-colors"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400 hover:!text-navy touch-none transition-colors" aria-label="Drag to reorder">
        <GripVertical className="w-4 h-4" />
      </button>
      <span className="flex-1 min-w-0 font-medium truncate">{row.title}</span>
      <RowActions resourceKey={resourceKey} row={row} showRegistrations={showRegistrations} hasBuilder={hasBuilder} />
    </div>
  );
}

export function SortableList({
  resourceKey, rows: initial, sortable, showRegistrations = false, hasBuilder = false,
}: {
  resourceKey: string;
  rows: Row[];
  sortable: boolean;
  showRegistrations?: boolean;
  hasBuilder?: boolean;
}) {
  const [rows, setRows] = useState(initial);
  const [, startTransition] = useTransition();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (rows.length === 0) {
    return <p className="p-8 text-center text-gray-400 text-sm">Nothing here yet.</p>;
  }

  if (!sortable) {
    return (
      <div>
        {rows.map((row) => (
          <div key={row.id} className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors">
            <span className="flex-1 min-w-0 font-medium truncate">{row.title}</span>
            <RowActions resourceKey={resourceKey} row={row} showRegistrations={showRegistrations} hasBuilder={hasBuilder} />
          </div>
        ))}
      </div>
    );
  }

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = rows.findIndex((r) => r.id === active.id);
    const newIndex = rows.findIndex((r) => r.id === over.id);
    const next = arrayMove(rows, oldIndex, newIndex);
    setRows(next); // optimistic
    startTransition(() => {
      void reorderResource(resourceKey, next.map((r) => r.id));
    });
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
        {rows.map((row) => (
          <SortableRow key={row.id} row={row} resourceKey={resourceKey} showRegistrations={showRegistrations} hasBuilder={hasBuilder} />
        ))}
      </SortableContext>
    </DndContext>
  );
}
