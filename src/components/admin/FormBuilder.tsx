"use client";

import { useState, useTransition } from "react";
import { FolderAutocompleteInput } from "@/components/admin/media/FolderAutocompleteInput";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Trash2,
  Plus,
  Type,
  AlignLeft,
  List,
  CheckSquare,
  CircleDot,
  Calendar,
  Clock,
  Sparkles,
  Eye,
  Settings2,
  Layers,
  CheckCircle2,
  LayoutList,
  BookmarkPlus,
  Save,
  X,
  Copy,
  Image as ImageIcon,
  SlidersHorizontal,
  Upload,
  ShieldCheck,
  PlusCircle,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  Folder,
  Sliders,
  Lock,
  MessageSquare,
  UserCheck,
  Check,
  AlertTriangle,
} from "lucide-react";
import {
  addFieldAction,
  duplicateFieldAction,
  updateFieldAction,
  deleteFieldAction,
  reorderFieldsAction,
  updateFormSettings,
  syncFormWithNexusAction,
} from "@/lib/admin/formActions";
import {
  FIELD_TYPES,
  type BuilderField,
  type ValidationRule,
} from "@/lib/admin/formTypes";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { toast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

const generateTempId = (prefix = "temp") => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
const generateFieldKey = (label: string) => `${label.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_${Math.random().toString(36).slice(2, 5)}`;

export type CustomPreset = {
  id: string;
  name: string;
  fields: { type: string; label: string; placeholder?: string; helpText?: string; options?: string[] }[];
};

const typeInfoMap: Record<
  string,
  { label: string; icon: React.ElementType; color: string; bg: string }
> = {
  text: { label: "Short Answer", icon: Type, color: "text-blue-600", bg: "bg-blue-50" },
  textarea: { label: "Paragraph", icon: AlignLeft, color: "text-purple-600", bg: "bg-purple-50" },
  radio: { label: "Multiple Choice", icon: CircleDot, color: "text-rose-600", bg: "bg-rose-50" },
  multiselect: { label: "Checkboxes", icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
  select: { label: "Dropdown", icon: List, color: "text-indigo-600", bg: "bg-indigo-50" },
  image: { label: "Image Block", icon: ImageIcon, color: "text-purple-600", bg: "bg-purple-50" },
  scale: { label: "Linear Scale", icon: SlidersHorizontal, color: "text-amber-600", bg: "bg-amber-50" },
  file: { label: "File Upload", icon: Upload, color: "text-cyan-600", bg: "bg-cyan-50" },
  date: { label: "Date", icon: Calendar, color: "text-orange-600", bg: "bg-orange-50" },
  time: { label: "Time", icon: Clock, color: "text-teal-600", bg: "bg-teal-50" },
  checkbox: { label: "Single Checkbox", icon: CheckSquare, color: "text-emerald-600", bg: "bg-emerald-50" },
  section: { label: "Section Header", icon: LayoutList, color: "text-red", bg: "bg-red/10" },
};

function FolderDestinationPicker({
  value,
  onChange,
}: {
  value?: string | null;
  onChange: (folderPath: string) => void;
}) {
  const currentPath = value || "forms";

  return (
    <div className="space-y-2 pt-2 border-t border-gray-100 mt-2">
      <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">
        Media Library Storage Destination Path
      </label>

      <FolderAutocompleteInput
        value={currentPath}
        onChange={(val) => onChange(val || "forms")}
        allFolders={["forms", "forms/submissions", "applications", "events", "execom", "general"]}
        placeholder="e.g. forms/submissions"
      />

      <div className="flex items-center gap-1.5 text-[10px] text-gray-400 pt-0.5">
        <Folder className="w-3.5 h-3.5 text-red shrink-0" />
        <span>
          Final Media Path: <strong className="font-mono text-navy font-bold">{currentPath}</strong>
        </span>
      </div>
    </div>
  );
}

function FieldCard({
  formId,
  field,
  index,
  onPatch,
  onDuplicate,
  onDelete,
  onDropNewField,
  isCollapsed,
  onToggleCollapse,
  childCount,
}: {
  formId: string;
  field: BuilderField;
  index: number;
  total?: number;
  onPatch: (patch: Partial<BuilderField>) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onMove?: (dir: -1 | 1) => void;
  onDropNewField?: (type: string, positionIdx: number) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  childCount?: number;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: field.id });
  const [, start] = useTransition();
  const [expanded, setExpanded] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const save = (patch: Partial<BuilderField>) => {
    onPatch(patch);
    if (!field.id.startsWith("temp_")) {
      start(async () => {
        await updateFieldAction(formId, field.id, patch);
      });
    }
  };

  const typeConfig = typeInfoMap[field.field_type] || {
    label: field.field_type,
    icon: Type,
    color: "text-navy",
    bg: "bg-gray-100",
  };
  const Icon = typeConfig.icon;
  const isSection = field.field_type === "section";
  const isImageBlock = field.field_type === "image";
  const isChoice = field.field_type === "radio" || field.field_type === "multiselect" || field.field_type === "select";

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const type = e.dataTransfer.getData("text/plain");
    if (type && onDropNewField) {
      onDropNewField(type, index + 1);
    }
  };

  // Section Header Card
  if (isSection) {
    return (
      <div
        ref={setNodeRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
        className={cn(
          "bg-navy text-white rounded-2xl p-5 shadow-md border transition-all relative group space-y-3",
          isDragOver ? "border-red ring-2 ring-red/50 scale-[1.01]" : "border-navy/20"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white p-1 rounded touch-none"
              title="Drag Section"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
              title={isCollapsed ? "Expand Section" : "Collapse Section"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <div className="bg-red text-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <LayoutList className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-oswald text-[10px] uppercase font-bold text-red tracking-widest block">
                  SECTION HEADER
                </span>
                {typeof childCount === "number" && (
                  <span className="bg-white/10 text-white/80 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {childCount} {childCount === 1 ? "question" : "questions"} {isCollapsed ? "hidden" : "inside"}
                  </span>
                )}
              </div>
              <input
                defaultValue={field.label || "Section Title"}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== field.label) save({ label: val });
                }}
                placeholder="Section Title (e.g. Section 2: Educational Identity)"
                className="w-full bg-transparent font-oswald text-xl uppercase font-bold text-white focus:outline-none focus:bg-white/10 rounded px-1.5 py-0.5"
              />
              <input
                defaultValue={field.help_text || ""}
                onBlur={(e) => save({ help_text: e.target.value })}
                placeholder="Optional Section Subtitle / Instructions"
                className="w-full bg-transparent text-xs text-white/70 focus:outline-none focus:bg-white/10 rounded px-1.5 py-0.5 mt-0.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Duplicate Section & All Questions Inside"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-white/60 hover:text-red hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Delete Section"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Standalone Image Block Card
  if (isImageBlock) {
    return (
      <div
        ref={setNodeRef}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
        className={cn(
          "bg-purple-950 text-white rounded-2xl p-5 shadow-md border transition-all relative group space-y-4",
          isDragOver ? "border-red ring-2 ring-red/50 scale-[1.01]" : "border-purple-900/40"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-white/40 hover:text-white p-1 rounded touch-none"
              title="Drag Image Block"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className="bg-purple-600 text-white p-2 rounded-xl flex items-center justify-center shrink-0 shadow-sm">
              <ImageIcon className="w-4 h-4" />
            </div>

            <div className="flex-1 min-w-0">
              <span className="font-oswald text-[10px] uppercase font-bold text-purple-300 tracking-widest block">
                IMAGE BLOCK
              </span>
              <input
                defaultValue={field.label || "Image Header Title"}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== field.label) save({ label: val });
                }}
                placeholder="Image Header Title (e.g. Diagram A: Campus Map)"
                className="w-full bg-transparent font-oswald text-xl uppercase font-bold text-white focus:outline-none focus:bg-white/10 rounded px-1.5 py-0.5"
              />
              <input
                defaultValue={field.help_text || ""}
                onBlur={(e) => save({ help_text: e.target.value })}
                placeholder="Optional Caption / Description"
                className="w-full bg-transparent text-xs text-purple-200/80 focus:outline-none focus:bg-white/10 rounded px-1.5 py-0.5 mt-0.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onDuplicate}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Duplicate Image Block"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={onDelete}
              className="p-2 text-white/60 hover:text-red hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
              title="Delete Image Block"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="bg-black/30 rounded-xl p-4 border border-white/10 space-y-3">
          {field.image_url ? (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden max-h-72 bg-black/40 border border-white/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={field.image_url} alt="" className="w-full h-full object-contain max-h-72" />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMediaPickerOpen(true)}
                  className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-purple-300" /> Change Image from Media Library
                </button>
                <button
                  type="button"
                  onClick={() => save({ image_url: null })}
                  className="text-xs text-red hover:underline"
                >
                  Remove Image
                </button>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center border-2 border-dashed border-white/20 rounded-xl space-y-2">
              <ImageIcon className="w-8 h-8 text-purple-300/60 mx-auto" />
              <p className="text-xs text-white/80 font-medium">No image selected for this block.</p>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-oswald uppercase tracking-widest font-bold px-4 py-2 rounded-xl transition-all shadow cursor-pointer inline-flex items-center gap-2"
              >
                <FolderOpen className="w-4 h-4" /> Select Image from Media Library
              </button>
            </div>
          )}
        </div>

        <MediaPickerModal
          isOpen={mediaPickerOpen}
          onClose={() => setMediaPickerOpen(false)}
          onSelect={(url) => save({ image_url: url })}
        />
      </div>
    );
  }

  // Option list handlers
  const addOption = () => {
    const opts = [...(field.options || [])];
    opts.push(`Option ${opts.length + 1}`);
    save({ options: opts });
  };

  const updateOption = (idx: number, val: string) => {
    const opts = [...(field.options || [])];
    opts[idx] = val;
    save({ options: opts });
  };

  const removeOption = (idx: number) => {
    const opts = (field.options || []).filter((_, i) => i !== idx);
    save({ options: opts });
  };

  return (
    <div
      ref={setNodeRef}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className={cn(
        "bg-white border rounded-2xl transition-all shadow-sm overflow-hidden group space-y-0 relative",
        isDragging ? "border-navy shadow-lg" : isDragOver ? "border-red ring-2 ring-red/50 scale-[1.01]" : "border-gray-200 hover:border-gray-300"
      )}
    >
      {/* Question Header & Control Bar */}
      <div className="p-4 sm:p-5 space-y-4 bg-white border-b border-gray-100">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-[240px]">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-navy p-1 rounded-lg hover:bg-gray-100 touch-none transition-colors"
              title="Drag to reorder question"
            >
              <GripVertical className="w-4 h-4" />
            </button>

            <div className={cn("p-2 rounded-xl flex items-center justify-center shrink-0", typeConfig.bg)}>
              <Icon className={cn("w-4 h-4", typeConfig.color)} />
            </div>

            <div className="flex-1 min-w-0">
              <input
                defaultValue={field.label}
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val && val !== field.label) {
                    const patchObj: Partial<BuilderField> = { label: val };
                    if (!field.field_key || field.field_key.startsWith("field_")) {
                      patchObj.field_key = val.toLowerCase().replace(/[^a-z0-9]+/g, "_");
                    }
                    save(patchObj);
                  }
                }}
                placeholder="Question Title (e.g. What is your t-shirt size?)"
                className="w-full bg-transparent text-sm sm:text-base font-bold text-navy focus:outline-none focus:bg-gray-50/80 rounded px-1.5 py-1"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <select
              defaultValue={field.field_type}
              onChange={(e) => save({ field_type: e.target.value })}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-navy font-semibold focus:outline-none focus:border-red"
            >
              {FIELD_TYPES.map((t) => (
                <option key={t} value={t}>
                  {typeInfoMap[t]?.label || t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input
          defaultValue={field.help_text || ""}
          onBlur={(e) => save({ help_text: e.target.value })}
          placeholder="Description / Helper hint (optional)"
          className="w-full bg-transparent text-xs text-gray-500 focus:outline-none focus:bg-gray-50 rounded px-2 py-1"
        />

        {field.image_url && (
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="relative rounded-lg overflow-hidden max-h-48 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={field.image_url} alt="" className="max-h-48 object-contain" />
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMediaPickerOpen(true)}
                className="text-xs font-bold text-navy hover:text-red transition-colors flex items-center gap-1"
              >
                <FolderOpen className="w-3.5 h-3.5" /> Change Question Image
              </button>
              <button
                type="button"
                onClick={() => save({ image_url: null })}
                className="text-xs text-red hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BESPOKE EDITORS */}
      <div className="p-4 sm:p-5 bg-gray-50/50 space-y-4">
        {isChoice && (
          <div className="space-y-2 max-w-md">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/60">
              Answer Options
            </label>

            <div className="space-y-2">
              {(field.options || []).map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  {field.field_type === "radio" ? (
                    <CircleDot className="w-4 h-4 text-rose-500 shrink-0" />
                  ) : field.field_type === "multiselect" ? (
                    <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0" />
                  ) : (
                    <span className="text-xs font-mono font-bold text-gray-400 w-4 text-center shrink-0">
                      {optIdx + 1}.
                    </span>
                  )}

                  <input
                    defaultValue={opt}
                    onBlur={(e) => updateOption(optIdx, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-navy focus:outline-none focus:border-red"
                    placeholder={`Option ${optIdx + 1}`}
                  />

                  {(field.options || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(optIdx)}
                      className="text-gray-400 hover:text-red p-1"
                      title="Remove Option"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}

              {field.allow_other && field.field_type !== "select" && (
                <div className="flex items-center gap-2 text-xs text-gray-400 italic pl-6 pt-1">
                  <span>Option: &quot;Other...&quot; (Applicant write-in enabled)</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={addOption}
                className="text-xs font-bold uppercase tracking-wider text-navy hover:text-red transition-colors flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" /> Add Option
              </button>

              {field.field_type !== "select" && (
                <button
                  type="button"
                  onClick={() => save({ allow_other: !field.allow_other })}
                  className={cn(
                    "text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer",
                    field.allow_other ? "text-red" : "text-gray-400 hover:text-navy"
                  )}
                >
                  {field.allow_other ? "✓ 'Other' Option Enabled" : "+ Add 'Other' Option"}
                </button>
              )}
            </div>
          </div>
        )}

        {field.field_type === "scale" && (
          <div className="space-y-3 max-w-lg bg-white p-4 rounded-xl border border-gray-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/60">
              Scale Bounds & Range
            </label>

            <div className="flex items-center gap-3">
              <select
                defaultValue={field.scale_min ?? 1}
                onChange={(e) => save({ scale_min: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy font-bold"
              >
                <option value={0}>0</option>
                <option value={1}>1</option>
              </select>
              <span className="text-xs text-gray-400">to</span>
              <select
                defaultValue={field.scale_max ?? 5}
                onChange={(e) => save({ scale_max: Number(e.target.value) })}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy font-bold"
              >
                {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">
                  Min Label (Optional)
                </label>
                <input
                  defaultValue={field.scale_min_label || ""}
                  onBlur={(e) => save({ scale_min_label: e.target.value })}
                  placeholder="e.g. Strongly Disagree"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">
                  Max Label (Optional)
                </label>
                <input
                  defaultValue={field.scale_max_label || ""}
                  onBlur={(e) => save({ scale_max_label: e.target.value })}
                  placeholder="e.g. Strongly Agree"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy"
                />
              </div>
            </div>
          </div>
        )}

        {field.field_type === "file" && (
          <div className="space-y-3 max-w-lg bg-white p-4 rounded-xl border border-gray-200">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/60">
              File Attachment Settings
            </label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Max File Count</label>
                <select
                  defaultValue={field.max_files ?? 1}
                  onChange={(e) => save({ max_files: Number(e.target.value) })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy font-semibold"
                >
                  <option value={1}>1 File</option>
                  <option value={5}>5 Files</option>
                  <option value={10}>10 Files</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-gray-400 mb-1">Max File Size</label>
                <select
                  defaultValue={field.max_file_size || "10MB"}
                  onChange={(e) => save({ max_file_size: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy font-semibold"
                >
                  <option value="1MB">1 MB</option>
                  <option value="10MB">10 MB</option>
                  <option value="100MB">100 MB</option>
                  <option value="1GB">1 GB</option>
                </select>
              </div>
            </div>

            <FolderDestinationPicker
              value={field.upload_folder}
              onChange={(path) => save({ upload_folder: path })}
            />
          </div>
        )}

        {(field.field_type === "text" || field.field_type === "textarea") && (
          <div className="max-w-md">
            <input
              defaultValue={field.placeholder || ""}
              onBlur={(e) => save({ placeholder: e.target.value })}
              placeholder="Placeholder text (e.g. Enter your response here)"
              className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-navy"
            />
          </div>
        )}

        {showValidation && (
          <div className="p-4 bg-white rounded-xl border border-gray-200 space-y-3 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <span className="font-oswald text-xs uppercase font-bold text-navy flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-red" /> Response Validation Rule
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowValidation(false);
                  save({ validation_rule: {} });
                }}
                className="text-xs text-red hover:underline"
              >
                Clear Rule
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <select
                defaultValue={field.validation_rule?.type || "email"}
                onChange={(e) =>
                  save({
                    validation_rule: {
                      ...field.validation_rule,
                      type: e.target.value as ValidationRule["type"],
                    },
                  })
                }
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy font-semibold"
              >
                <option value="email">Email Format</option>
                <option value="url">URL Link</option>
                <option value="number">Number Limits</option>
                <option value="length">Character Length</option>
                <option value="regex">Regex Match</option>
              </select>

              <input
                defaultValue={field.validation_rule?.value || ""}
                onBlur={(e) =>
                  save({
                    validation_rule: {
                      ...field.validation_rule,
                      value: e.target.value,
                    },
                  })
                }
                placeholder="Condition / Boundary value"
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy"
              />

              <input
                defaultValue={field.validation_rule?.customError || ""}
                onBlur={(e) =>
                  save({
                    validation_rule: {
                      ...field.validation_rule,
                      customError: e.target.value,
                    },
                  })
                }
                placeholder="Custom Error Message"
                className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs text-navy"
              />
            </div>
          </div>
        )}
      </div>

      {/* FOOTER ACTIONS BAR */}
      <div className="p-3 bg-white border-t border-gray-100 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1.5 text-navy/70 hover:text-red hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            title="Duplicate Question"
          >
            <Copy className="w-4 h-4" /> <span className="hidden sm:inline">Duplicate</span>
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 text-red/70 hover:text-red hover:bg-red/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            title="Delete Question"
          >
            <Trash2 className="w-4 h-4" /> <span className="hidden sm:inline">Delete</span>
          </button>

          <button
            type="button"
            onClick={() => setMediaPickerOpen(true)}
            className="p-1.5 text-navy/70 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold"
            title="Pick Image from Media Library"
          >
            <FolderOpen className="w-4 h-4 text-purple-600" /> <span className="hidden sm:inline">Pick Media Image</span>
          </button>

          <button
            type="button"
            onClick={() => setShowValidation(!showValidation)}
            className={cn(
              "p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 font-semibold",
              showValidation || field.validation_rule?.type
                ? "bg-red/10 text-red"
                : "text-navy/70 hover:text-navy hover:bg-gray-100"
            )}
            title="Response Validation Rules"
          >
            <ShieldCheck className="w-4 h-4" /> <span className="hidden sm:inline">Validation</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-navy font-bold cursor-pointer select-none border-l border-gray-200 pl-3">
            <input
              type="checkbox"
              defaultChecked={field.required}
              onChange={(e) => save({ required: e.target.checked })}
              className="w-4 h-4 accent-red rounded cursor-pointer"
            />
            Required
          </label>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className={cn(
              "p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer",
              expanded ? "bg-navy text-white" : "bg-gray-100 text-navy/70 hover:bg-gray-200"
            )}
            title="Advanced Machine Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="p-4 bg-gray-100/70 border-t border-gray-200 space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/60 mb-1">
                Machine Key (Database Identifier)
              </label>
              <input
                defaultValue={field.field_key}
                onBlur={(e) => {
                  const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
                  if (val && val !== field.field_key) save({ field_key: val });
                }}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-mono text-navy"
              />
            </div>
          </div>
        </div>
      )}

      <MediaPickerModal
        isOpen={mediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={(url) => save({ image_url: url })}
      />
    </div>
  );
}

export function FormBuilder({
  formId,
  initialForm,
  initialFields,
  categories = [],
}: {
  formId: string;
  initialForm?: Record<string, unknown>;
  initialFields: BuilderField[];
  categories?: string[];
}) {
  const [fields, setFields] = useState<BuilderField[]>(initialFields);
  const [activeTab, setActiveTab] = useState<"builder" | "settings" | "preview">("builder");
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sc_custom_form_presets");
        if (saved) return JSON.parse(saved);
      }
    } catch {}
    return [];
  });
  const [savePresetModalOpen, setSavePresetModalOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  
  // Section Delete Confirmation Modal State
  const [deleteSectionModal, setDeleteSectionModal] = useState<{
    sectionId: string;
    sectionTitle: string;
    childCount: number;
    childIds: string[];
  } | null>(null);

  const [, start] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [formSettings] = useState<Record<string, unknown>>(initialForm || {});
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingForm, setSavingForm] = useState(false);

  const sectionChildrenCounts: Record<string, number> = {};
  const hiddenFieldIds = new Set<string>();

  let currentSectionId: string | null = null;
  for (const f of fields) {
    if (f.field_type === "section") {
      currentSectionId = f.id;
      sectionChildrenCounts[currentSectionId] = 0;
    } else if (currentSectionId) {
      sectionChildrenCounts[currentSectionId] = (sectionChildrenCounts[currentSectionId] || 0) + 1;
      if (collapsedSections[currentSectionId]) {
        hiddenFieldIds.add(f.id);
      }
    }
  }

  const visibleFields = fields.filter((f) => !hiddenFieldIds.has(f.id));

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleSaveFullForm = () => {
    setSavingForm(true);
    start(async () => {
      await syncFormWithNexusAction(formId);
      toast("Form saved & synced with Visual Builder!", "success");
      setSavingForm(false);
    });
  };

  const handleSaveSettings = (fd: FormData) => {
    setSavingSettings(true);
    start(async () => {
      await updateFormSettings(formId, null, fd);
      await syncFormWithNexusAction(formId);
      toast("Form settings saved & synced!", "success");
      setSavingSettings(false);
    });
  };

  const saveCustomPreset = () => {
    if (!newPresetName.trim() || fields.length === 0) return;
    const newPreset: CustomPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      fields: fields.map((f) => ({
        type: f.field_type,
        label: f.label,
        placeholder: f.placeholder,
        helpText: f.help_text,
        options: f.options,
      })),
    };
    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    try {
      localStorage.setItem("sc_custom_form_presets", JSON.stringify(updated));
    } catch {}
    toast(`Preset '${newPreset.name}' saved!`, "success");
    setNewPresetName("");
    setSavePresetModalOpen(false);
  };

  const deleteCustomPreset = (id: string) => {
    const updated = customPresets.filter((p) => p.id !== id);
    setCustomPresets(updated);
    try {
      localStorage.setItem("sc_custom_form_presets", JSON.stringify(updated));
    } catch {}
    toast("Preset removed", "success");
  };

  const applyCustomPreset = (preset: CustomPreset) => {
    start(async () => {
      for (const item of preset.fields) {
        add(item.type, item.label);
      }
      toast(`Applied preset '${preset.name}'`, "success");
    });
  };

  // 0ms Optimistic Field Insertion (Supports Position Insertion via Drag and Drop)
  const add = (type: string, presetLabel?: string, positionIdx?: number) => {
    const tempId = generateTempId("temp");
    const labelVal = presetLabel || (typeInfoMap[type]?.label || type);
    const tempField: BuilderField = {
      id: tempId,
      label: labelVal,
      field_key: generateFieldKey(labelVal),
      field_type: type,
      required: false,
      placeholder: "",
      help_text: "",
      options: type === "radio" || type === "multiselect" || type === "select" ? ["Option 1", "Option 2"] : [],
      display_order: typeof positionIdx === "number" ? positionIdx : fields.length,
      image_url: null,
      validation_rule: {},
      allow_other: false,
      shuffle_options: false,
      scale_min: 1,
      scale_max: 5,
      scale_min_label: null,
      scale_max_label: null,
      grid_rows: [],
      grid_columns: [],
      file_types: [],
      max_file_size: "10MB",
      max_files: 1,
    };

    // INSTANT UI UPDATE (0ms)
    setFields((prev) => {
      const next = [...prev];
      if (typeof positionIdx === "number" && positionIdx >= 0 && positionIdx <= prev.length) {
        next.splice(positionIdx, 0, tempField);
      } else {
        next.push(tempField);
      }
      return next;
    });

    // DB SYNC IN BACKGROUND
    start(async () => {
      const realField = await addFieldAction(formId, type);
      if (presetLabel) {
        realField.label = presetLabel;
        realField.field_key = presetLabel.toLowerCase().replace(/[^a-z0-9]+/g, "_");
        await updateFieldAction(formId, realField.id, { label: realField.label, field_key: realField.field_key });
      }
      setFields((prev) => prev.map((item) => (item.id === tempId ? realField : item)));
    });
  };

  // 0ms Optimistic Duplication (Supports Deep Section Duplication)
  const duplicateField = (fieldId: string) => {
    const targetIdx = fields.findIndex((f) => f.id === fieldId);
    if (targetIdx === -1) return;

    const source = fields[targetIdx];

    // DEEP SECTION DUPLICATION: Duplicate Section Header AND all child questions inside it
    if (source.field_type === "section") {
      const blockToClone: BuilderField[] = [source];
      for (let i = targetIdx + 1; i < fields.length; i++) {
        if (fields[i].field_type === "section") break;
        blockToClone.push(fields[i]);
      }

      const tempClones: BuilderField[] = blockToClone.map((item, idx) => ({
        ...item,
        id: generateTempId(`temp_clone_${idx}`),
        label: idx === 0 ? `${item.label} (Copy)` : item.label,
        field_key: generateFieldKey(`${item.field_key}_copy`),
      }));

      // INSTANT UI UPDATE (0ms)
      const nextFields = [...fields];
      const insertAt = targetIdx + blockToClone.length;
      nextFields.splice(insertAt, 0, ...tempClones);
      setFields(nextFields);

      // DB SYNC IN BACKGROUND
      start(async () => {
        const realClones: BuilderField[] = [];
        for (const item of blockToClone) {
          const cloned = await duplicateFieldAction(formId, item.id);
          realClones.push(cloned);
        }
        setFields((prev) => {
          let updated = [...prev];
          tempClones.forEach((tempItem, idx) => {
            if (realClones[idx]) {
              updated = updated.map((f) => (f.id === tempItem.id ? realClones[idx] : f));
            }
          });
          return updated;
        });
        toast(`Section '${source.label}' duplicated with ${blockToClone.length - 1} question(s)!`, "success");
      });
      return;
    }

    // INDIVIDUAL QUESTION DUPLICATION
    const tempId = generateTempId("temp_clone");
    const tempClone: BuilderField = {
      ...source,
      id: tempId,
      label: `${source.label} (Copy)`,
      field_key: generateFieldKey(`${source.field_key}_copy`),
    };

    // INSTANT UI UPDATE (0ms)
    const nextFields = [...fields];
    nextFields.splice(targetIdx + 1, 0, tempClone);
    setFields(nextFields);

    // DB SYNC IN BACKGROUND
    start(async () => {
      const realField = await duplicateFieldAction(formId, fieldId);
      setFields((prev) => prev.map((item) => (item.id === tempId ? realField : item)));
    });
  };

  const addContactPreset = () => {
    add("text", "Full Name");
    add("text", "Email Address");
    add("text", "Phone Number");
  };

  const addStudentPreset = () => {
    add("text", "Roll / Admission Number");
    add("text", "Department / Branch");
    add("select", "Year of Study");
  };

  // Section & Question Delete Handlers
  const handleRemoveField = (id: string) => {
    const targetIdx = fields.findIndex((f) => f.id === id);
    if (targetIdx === -1) return;

    const targetField = fields[targetIdx];

    // If deleting a Section Header: check for child questions
    if (targetField.field_type === "section") {
      const childFields: BuilderField[] = [];
      for (let i = targetIdx + 1; i < fields.length; i++) {
        if (fields[i].field_type === "section") break;
        childFields.push(fields[i]);
      }

      if (childFields.length > 0) {
        setDeleteSectionModal({
          sectionId: id,
          sectionTitle: targetField.label || "Untitled Section",
          childCount: childFields.length,
          childIds: childFields.map((f) => f.id),
        });
        return;
      }
    }

    // Standard Direct Delete
    remove(id);
  };

  const remove = (id: string) => {
    setFields((f) => f.filter((x) => x.id !== id));
    if (!id.startsWith("temp_")) {
      start(() => deleteFieldAction(formId, id));
    }
  };

  const confirmDeleteSection = (deleteChildren: boolean) => {
    if (!deleteSectionModal) return;
    const { sectionId, childIds, childCount, sectionTitle } = deleteSectionModal;

    const idsToDelete = deleteChildren ? [sectionId, ...childIds] : [sectionId];
    const deleteSet = new Set(idsToDelete);

    // 0ms Optimistic Delete
    setFields((prev) => prev.filter((f) => !deleteSet.has(f.id)));
    setDeleteSectionModal(null);

    // DB SYNC IN BACKGROUND
    start(async () => {
      for (const id of idsToDelete) {
        if (!id.startsWith("temp_")) {
          await deleteFieldAction(formId, id);
        }
      }
      toast(
        deleteChildren
          ? `Deleted section '${sectionTitle}' and ${childCount} question(s)`
          : `Deleted section header '${sectionTitle}'`,
        "success"
      );
    });
  };

  const patch = (id: string, p: Partial<BuilderField>) =>
    setFields((f) => f.map((x) => (x.id === id ? { ...x, ...p } : x)));

  const moveField = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= fields.length) return;
    const next = arrayMove(fields, index, targetIdx);
    setFields(next);
    start(() => reorderFieldsAction(formId, next.map((f) => f.id)));
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const next = arrayMove(
      fields,
      fields.findIndex((f) => f.id === active.id),
      fields.findIndex((f) => f.id === over.id)
    );
    setFields(next);
    start(() => reorderFieldsAction(formId, next.map((f) => f.id)));
  };

  return (
    <div className="space-y-6 font-inter max-w-full mx-auto pb-12">
      {/* Header Bar with 3 Tabs & Explicit Save Form Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div>
          <h2 className="font-oswald text-xl font-bold uppercase text-navy flex items-center gap-2">
            <Layers className="w-5 h-5 text-red" /> Form Architect & Field Engine
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Drag & drop element insertion, 0ms optimistic updates, section delete options.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("builder")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "builder" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
              )}
            >
              <Settings2 className="w-3.5 h-3.5" /> Field Builder ({fields.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("settings")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "settings" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
              )}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" /> Form Settings
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
                activeTab === "preview" ? "bg-red text-white shadow-sm" : "text-navy/60 hover:text-navy"
              )}
            >
              <Eye className="w-3.5 h-3.5" /> Live Preview
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveFullForm}
            disabled={savingForm}
            className="bg-green-600 hover:bg-green-700 text-white font-oswald uppercase tracking-widest text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow flex items-center gap-2 cursor-pointer disabled:opacity-60 shrink-0"
          >
            <Save className="w-4 h-4 text-white" /> {savingForm ? "Saving..." : "Save Form"}
          </button>
        </div>
      </div>

      {activeTab === "builder" ? (
        /* FIELD BUILDER TAB WITH STICKY LEFT PALETTE */
        <div className="flex flex-col lg:flex-row items-start gap-6 relative">
          {/* STICKY LEFT SIDEBAR PALETTE */}
          <aside className="w-full lg:w-72 shrink-0 sticky top-6 self-start space-y-4 z-20">
            {/* Primary Save Form Action */}
            <button
              type="button"
              onClick={handleSaveFullForm}
              disabled={savingForm}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-oswald uppercase tracking-widest text-xs font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <Check className="w-4 h-4 text-white font-bold" /> {savingForm ? "Saving Changes..." : "Save Form Changes"}
            </button>

            {/* Quick Add & Drag-and-Drop Palette Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
                <span className="font-oswald text-xs font-bold uppercase tracking-wider text-navy flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-red" /> Insert Form Elements
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Drag or Click</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {FIELD_TYPES.map((t) => {
                  const conf = typeInfoMap[t] || { label: t, icon: Plus, color: "text-navy", bg: "bg-gray-100" };
                  const IconComp = conf.icon;
                  return (
                    <button
                      key={t}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", t);
                        e.dataTransfer.effectAllowed = "copy";
                      }}
                      onClick={() => add(t)}
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/60 hover:bg-white hover:border-red transition-all text-left group cursor-grab active:cursor-grabbing flex items-center gap-2 select-none"
                      title={`Drag to position or click to add ${conf.label}`}
                    >
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center shrink-0", conf.bg)}>
                        <IconComp className={cn("w-3.5 h-3.5", conf.color)} />
                      </div>
                      <span className="font-oswald text-[11px] font-bold uppercase text-navy group-hover:text-red transition-colors truncate">
                        {conf.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Presets & Custom Templates Card */}
            <div className="bg-gradient-to-br from-navy to-navy/90 text-white rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="font-oswald text-xs uppercase font-bold tracking-widest text-red flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-red" /> Presets
                </span>
                {fields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSavePresetModalOpen(true)}
                    className="text-[10px] bg-red hover:bg-white hover:text-navy text-white px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                  >
                    + Save Preset
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={addContactPreset}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer block truncate"
                >
                  + Contact Block
                </button>
                <button
                  type="button"
                  onClick={addStudentPreset}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-left text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-white/10 transition-colors cursor-pointer block truncate"
                >
                  + Student Block
                </button>

                {customPresets.map((cp) => (
                  <div key={cp.id} className="flex items-center justify-between bg-red/80 text-white rounded-lg px-2.5 py-1.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => applyCustomPreset(cp)}
                      className="truncate text-left flex-1"
                    >
                      + {cp.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCustomPreset(cp.id)}
                      className="text-white/70 hover:text-white p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* MAIN FIELD CANVAS (Right Column - Drop Target) */}
          <main
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const type = e.dataTransfer.getData("text/plain");
              if (type) add(type);
            }}
            className="flex-1 min-w-0 space-y-4 rounded-2xl transition-all"
          >
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={visibleFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                {visibleFields.map((f, idx) => (
                  <FieldCard
                    key={f.id}
                    formId={formId}
                    field={f}
                    index={idx}
                    total={visibleFields.length}
                    onPatch={(p) => patch(f.id, p)}
                    onDuplicate={() => duplicateField(f.id)}
                    onDelete={() => handleRemoveField(f.id)}
                    onMove={(dir) => moveField(idx, dir)}
                    onDropNewField={(type, pos) => add(type, undefined, pos)}
                    isCollapsed={f.field_type === "section" ? Boolean(collapsedSections[f.id]) : undefined}
                    onToggleCollapse={f.field_type === "section" ? () => toggleSectionCollapse(f.id) : undefined}
                    childCount={f.field_type === "section" ? sectionChildrenCounts[f.id] ?? 0 : undefined}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {fields.length === 0 && (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const type = e.dataTransfer.getData("text/plain");
                  if (type) add(type);
                }}
                className="border-2 border-dashed border-gray-200 hover:border-red rounded-2xl p-12 text-center bg-white transition-colors cursor-pointer"
              >
                <Layers className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-sm font-bold uppercase tracking-wider text-navy">No fields added yet</p>
                <p className="text-xs text-gray-400 mt-1">Drag any element from the palette on the left and drop it here.</p>
              </div>
            )}
          </main>
        </div>
      ) : activeTab === "settings" ? (
        /* FORM SETTINGS TAB */
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-8 max-w-4xl mx-auto">
          <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-oswald uppercase font-bold text-amber-500 tracking-widest block mb-1">
                RESPONSE & AUTOMATION ENGINE
              </span>
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy">
                Form Settings & Auto-Closing Rules
              </h3>
            </div>
          </div>

          <form action={handleSaveSettings} className="space-y-6">
            {/* General Section */}
            <div className="space-y-4">
              <h4 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-1.5 flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-red" /> General Parameters
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    Form Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    defaultValue={(formSettings.title as string) || ""}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy font-semibold focus:outline-none focus:border-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    defaultValue={(formSettings.slug as string) || ""}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs font-mono text-navy focus:outline-none focus:border-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  name="description"
                  rows={2}
                  defaultValue={(formSettings.description as string) || ""}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy focus:outline-none focus:border-red"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    Form Category
                  </label>
                  <select
                    name="category"
                    defaultValue={(formSettings.category as string) || "General"}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy font-semibold focus:outline-none focus:border-red"
                  >
                    {Array.from(
                      new Set(["General", "Registrations", "Recruitment", "Feedback", "Competitions", ...(categories || [])])
                    ).map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 pt-1">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_active"
                      defaultChecked={formSettings.is_active !== false}
                      className="w-5 h-5 accent-red rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-navy block">
                        Accepting Responses (Active)
                      </span>
                      <span className="text-[10px] text-gray-400 block">
                        Toggle false to manually lock form registration
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_template"
                      defaultChecked={Boolean(formSettings.is_template)}
                      className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-navy block">
                        Save as Master Preset / Template
                      </span>
                      <span className="text-[10px] text-amber-600 font-medium block">
                        When checked, this form appears in the Presets & Templates tab for 1-click reuse
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Auto-closing Rules */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-1.5 flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" /> Auto-Closing Triggers & Boundaries
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    Registration Deadline (Auto-close Date)
                  </label>
                  <input
                    type="date"
                    name="close_at"
                    defaultValue={formSettings.close_at ? String(formSettings.close_at).slice(0, 10) : ""}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy focus:outline-none focus:border-red"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Form automatically locks when this date passes
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    Max Response Cap (Auto-close after N entries)
                  </label>
                  <input
                    type="number"
                    name="max_responses"
                    defaultValue={(formSettings.max_responses as number | string) || ""}
                    placeholder="Unlimited"
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy focus:outline-none focus:border-red"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Form automatically closes once submission limit is reached
                  </span>
                </div>
              </div>
            </div>

            {/* Custom Messages */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-1.5 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-600" /> Custom Confirmation & Closed Messages
              </h4>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    Post-Submission Thank-You Message
                  </label>
                  <textarea
                    name="confirmation_message"
                    rows={2}
                    defaultValue={(formSettings.confirmation_message as string) || "Thank you! Your response has been recorded."}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy focus:outline-none focus:border-red"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">
                    Closed Form Notice Message
                  </label>
                  <textarea
                    name="closed_message"
                    rows={2}
                    defaultValue={(formSettings.closed_message as string) || "This form is no longer accepting responses."}
                    className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-navy focus:outline-none focus:border-red"
                  />
                </div>
              </div>
            </div>

            {/* Access Rules */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <h4 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-1.5 flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-emerald-600" /> Response Restrictions
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="limit_one_per_user"
                    defaultChecked={Boolean(formSettings.limit_one_per_user)}
                    className="w-5 h-5 accent-red rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-navy block">
                      Limit 1 Response per User
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Enforces single submission per authenticated user
                    </span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="show_submit_another"
                    defaultChecked={formSettings.show_submit_another !== false}
                    className="w-5 h-5 accent-red rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-navy block">
                      Show &apos;Submit Another Response&apos; Link
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      Displays link on thank-you screen
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={savingSettings}
                className="bg-navy hover:bg-red text-white font-oswald uppercase tracking-widest text-xs font-bold px-8 py-3 rounded-full shadow-md transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                <Save className="w-4 h-4 text-red" /> {savingSettings ? "Saving Settings..." : "Save Settings"}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* LIVE APPLICANT PREVIEW MODE */
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-sm space-y-6 max-w-2xl mx-auto">
          <div className="border-b border-gray-100 pb-4">
            <span className="text-[10px] font-oswald uppercase font-bold text-red tracking-widest block mb-1">
              LIVE APPLICANT PREVIEW
            </span>
            <h3 className="font-oswald text-2xl font-bold uppercase text-navy">
              Application Registration Form
            </h3>
            <p className="text-xs text-gray-500 mt-1">This is an exact preview of how your form renders for applicants.</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            {fields.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-8">Add fields in the builder tab to see the live form preview.</p>
            ) : (
              fields.map((f) => {
                if (f.field_type === "section") {
                  return (
                    <div key={f.id} className="pt-4 border-t border-gray-200">
                      <h4 className="font-oswald text-lg font-bold uppercase text-navy border-l-4 border-red pl-3">
                        {f.label || "Section Breakpoint"}
                      </h4>
                      {f.help_text && <p className="text-xs text-gray-500 pl-4 mt-0.5">{f.help_text}</p>}
                    </div>
                  );
                }

                if (f.field_type === "image") {
                  return (
                    <div key={f.id} className="space-y-2 border border-gray-200 rounded-2xl p-4 bg-gray-50/50">
                      <h4 className="font-oswald text-lg font-bold uppercase text-navy">
                        {f.label || "Image Block"}
                      </h4>
                      {f.help_text && <p className="text-xs text-gray-500">{f.help_text}</p>}
                      {f.image_url ? (
                        <div className="rounded-xl overflow-hidden border border-gray-200 max-h-80 bg-black/5 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={f.image_url} alt={f.label} className="max-h-80 object-contain" />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">No image selected</p>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={f.id} className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy">
                      {f.label || "Untitled Field"}{" "}
                      {f.required && <span className="text-red font-bold">*</span>}
                    </label>

                    {f.image_url && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={f.image_url} alt="" className="max-h-48 rounded-xl border border-gray-200 object-cover" />
                    )}

                    {f.help_text && <p className="text-[11px] text-gray-400">{f.help_text}</p>}

                    {f.field_type === "textarea" ? (
                      <textarea
                        placeholder={f.placeholder}
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-navy focus:outline-none focus:border-red"
                      />
                    ) : f.field_type === "select" ? (
                      <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy font-medium focus:outline-none focus:border-red">
                        <option value="">{f.placeholder || "-- Select an option --"}</option>
                        {(f.options || []).map((opt, i) => (
                          <option key={i} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : f.field_type === "radio" ? (
                      <div className="space-y-2 pt-1">
                        {(f.options || []).map((opt, i) => (
                          <label key={i} className="flex items-center gap-2 text-xs text-navy cursor-pointer">
                            <input type="radio" name={f.field_key} className="w-3.5 h-3.5 accent-red" />
                            {opt}
                          </label>
                        ))}
                        {f.allow_other && (
                          <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
                            <input type="radio" name={f.field_key} className="w-3.5 h-3.5 accent-red" />
                            <span>Other:</span>
                            <input type="text" placeholder="Specify..." className="border-b border-gray-300 text-xs px-1" />
                          </label>
                        )}
                      </div>
                    ) : f.field_type === "scale" ? (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between text-xs text-gray-400 font-medium">
                          <span>{f.scale_min_label}</span>
                          <span>{f.scale_max_label}</span>
                        </div>
                        <div className="flex items-center justify-between gap-1 bg-gray-50 p-3 rounded-xl border border-gray-200">
                          {Array.from(
                            { length: (f.scale_max ?? 5) - (f.scale_min ?? 1) + 1 },
                            (_, i) => (f.scale_min ?? 1) + i
                          ).map((val) => (
                            <label key={val} className="flex flex-col items-center gap-1 cursor-pointer">
                              <span className="text-xs font-bold text-navy">{val}</span>
                              <input type="radio" name={f.field_key} className="accent-red" />
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : f.field_type === "file" ? (
                      <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center bg-gray-50">
                        <Upload className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                        <span className="text-xs font-bold text-navy block">Click to upload file</span>
                        <span className="text-[10px] text-gray-400">Max {f.max_files} file(s), up to {f.max_file_size}</span>
                      </div>
                    ) : f.field_type === "date" || f.field_type === "time" ? (
                      <DatePicker
                        placeholder={f.placeholder || (f.field_type === "date" ? "YYYY-MM-DD" : "HH:MM")}
                        showTime={f.field_type === "time"}
                      />
                    ) : (
                      <input
                        type="text"
                        placeholder={f.placeholder}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-navy focus:outline-none focus:border-red"
                      />
                    )}
                  </div>
                );
              })
            )}

            {fields.length > 0 && (
              <div className="pt-4 border-t border-gray-100">
                <button
                  type="button"
                  className="bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-full shadow-md hover:bg-navy transition-colors flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" /> Submit Application
                </button>
              </div>
            )}
          </form>
        </div>
      )}

      {/* Save Custom Preset Modal */}
      {savePresetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-oswald text-lg font-bold uppercase text-navy flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-red" /> Save as Custom Preset
              </h3>
              <button
                type="button"
                onClick={() => setSavePresetModalOpen(false)}
                className="text-gray-400 hover:text-navy p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Save all {fields.length} current fields as a reusable template. You can insert this preset into any form in 1 click!
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1">Preset Name</label>
              <input
                type="text"
                value={newPresetName}
                onChange={(e) => setNewPresetName(e.target.value)}
                placeholder="e.g. Workshop Dietary & Logistics Specs"
                className="w-full border-gray-200 rounded-xl text-xs bg-gray-50 p-3 text-navy font-semibold focus:outline-none focus:border-red"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSavePresetModalOpen(false)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy/70 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveCustomPreset}
                className="bg-navy hover:bg-red text-white text-xs font-oswald uppercase tracking-widest font-bold px-5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Save className="w-4 h-4 text-red" /> Save Preset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Section Modal Popup */}
      {deleteSectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-gray-100 pb-3 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red/10 text-red rounded-xl shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-oswald uppercase font-bold text-red tracking-wider block">
                    DELETE SECTION CONFIRMATION
                  </span>
                  <h3 className="font-oswald text-lg font-bold uppercase text-navy">
                    Delete Section &quot;{deleteSectionModal.sectionTitle}&quot;?
                  </h3>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDeleteSectionModal(null)}
                className="text-gray-400 hover:text-navy p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              This section contains <strong className="text-navy">{deleteSectionModal.childCount} question(s)</strong> inside it. How would you like to proceed?
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => confirmDeleteSection(true)}
                className="w-full bg-red hover:bg-red-700 text-white text-xs font-oswald uppercase tracking-wider font-bold p-3.5 rounded-xl transition-all shadow-sm flex items-center justify-between cursor-pointer"
              >
                <span>Delete Section & All {deleteSectionModal.childCount} Questions</span>
                <Trash2 className="w-4 h-4 text-white" />
              </button>

              <button
                type="button"
                onClick={() => confirmDeleteSection(false)}
                className="w-full bg-gray-100 hover:bg-gray-200 text-navy text-xs font-oswald uppercase tracking-wider font-bold p-3.5 rounded-xl transition-all flex items-center justify-between cursor-pointer"
              >
                <span>Delete Section Only (Keep Questions)</span>
                <LayoutList className="w-4 h-4 text-navy" />
              </button>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="button"
                onClick={() => setDeleteSectionModal(null)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-navy/60 hover:text-navy transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
