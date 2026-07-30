"use client";

import { useState, useTransition } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Plus } from "lucide-react";
import { addFieldAction, updateFieldAction, deleteFieldAction, reorderFieldsAction } from "@/lib/admin/formActions";
import { FIELD_TYPES, FIELDS_WITH_OPTIONS, type BuilderField } from "@/lib/admin/formTypes";
import { toast } from "@/components/ui/Toast";

const input = "w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-navy placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-navy/10 focus:border-navy transition-all duration-200 hover:border-gray-300 shadow-sm";

function FieldCard({
  formId, field, onPatch, onDelete,
}: {
  formId: string;
  field: BuilderField;
  onPatch: (patch: Partial<BuilderField>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });
  const [, start] = useTransition();

  const save = (patch: Partial<BuilderField>) => {
    onPatch(patch);
    start(async () => {
      await updateFieldAction(formId, field.id, patch);
      toast("Field updated", "success");
    });
  };

  const hasOptions = FIELDS_WITH_OPTIONS.has(field.field_type);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      className="rounded-xl border border-gray-200 bg-white p-4"
    >
      <div className="flex items-center gap-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none" aria-label="Drag">
          <GripVertical className="w-4 h-4" />
        </button>
        <input
          defaultValue={field.label}
          onBlur={(e) => e.target.value !== field.label && save({ label: e.target.value })}
          placeholder="Field label"
          className={`${input} flex-1 font-medium`}
        />
        <select
          defaultValue={field.field_type}
          onChange={(e) => save({ field_type: e.target.value })}
          className={input}
        >
          {FIELD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <label className="flex items-center gap-1.5 text-xs text-gray-500 whitespace-nowrap">
          <input type="checkbox" defaultChecked={field.required} onChange={(e) => save({ required: e.target.checked })} className="h-4 w-4 rounded border-gray-300 text-navy focus:ring-navy/20 transition-all cursor-pointer" />
          Required
        </label>
        <button onClick={onDelete} className="text-gray-300 hover:text-red" aria-label="Delete field">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
        <input
          defaultValue={field.field_key}
          onBlur={(e) => e.target.value !== field.field_key && save({ field_key: e.target.value })}
          placeholder="field_key (unique)"
          className={`${input} font-mono text-xs`}
        />
        <input
          defaultValue={field.placeholder}
          onBlur={(e) => e.target.value !== field.placeholder && save({ placeholder: e.target.value })}
          placeholder="Placeholder"
          className={input}
        />
      </div>

      {hasOptions && (
        <textarea
          defaultValue={field.options.join("\n")}
          onBlur={(e) => save({ options: e.target.value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean) })}
          placeholder="One option per line"
          rows={3}
          className={`${input} w-full mt-2`}
        />
      )}
    </div>
  );
}

export function FormBuilder({ formId, initialFields }: { formId: string; initialFields: BuilderField[] }) {
  const [fields, setFields] = useState(initialFields);
  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const add = (type: string) =>
    start(async () => {
      const nf = await addFieldAction(formId, type);
      setFields((f) => [...f, nf]);
    });

  const remove = (id: string) => {
    setFields((f) => f.filter((x) => x.id !== id));
    start(() => deleteFieldAction(formId, id));
  };

  const patch = (id: string, p: Partial<BuilderField>) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(fields, fields.findIndex((f) => f.id === active.id), fields.findIndex((f) => f.id === over.id));
    setFields(next);
    start(() => reorderFieldsAction(formId, next.map((f) => f.id)));
  };

  return (
    <div>
      <div className="space-y-3">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((f) => (
              <FieldCard key={f.id} formId={formId} field={f} onPatch={(p) => patch(f.id, p)} onDelete={() => remove(f.id)} />
            ))}
          </SortableContext>
        </DndContext>
        {fields.length === 0 && <p className="text-gray-400 text-sm py-6 text-center border border-dashed border-gray-200 rounded-xl">No fields yet — add one below.</p>}
      </div>

      <div className="flex flex-wrap gap-2 mt-5">
        {FIELD_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => add(t)}
            className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-navy/60 border border-gray-200 rounded-full px-3 py-1.5 hover:border-red hover:text-red transition-colors"
          >
            <Plus className="w-3 h-3" /> {t}
          </button>
        ))}
      </div>
    </div>
  );
}
