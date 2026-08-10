"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  LayoutTemplate,
  Plus,
  Search,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  Inbox,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookmarkPlus,
  ArrowRight,
  Tag,
  Loader2,
  X,
  FolderTree,
  Blocks,
  ChevronUp,
  ChevronDown,
  ListPlus,
  CheckSquare,
  Star,
  Upload,
  Calendar,
  Clock,
  Heading,
  Image as ImageIcon,
  Grid,
  Sliders,
} from "lucide-react";
import {
  createForm,
  deleteForm,
  duplicateFormAction,
  instantiateTemplateAction,
  saveFormAsTemplateAction,
  createFormCategoryAction,
  deleteFormCategoryAction,
} from "@/lib/admin/formActions";
import { toast } from "@/components/ui/Toast";
import { showConfirm } from "@/components/ui/ModalDialog";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export type FormItem = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  purpose?: string | null;
  category?: string | null;
  is_template?: boolean;
  is_active?: boolean;
  created_at: string;
  submission_count?: number;
};

export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
};

export type PresetFieldItem = {
  id: string;
  label: string;
  field_type: string;
  required: boolean;
  options?: string[];
};

export type BlockPreset = {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: PresetFieldItem[];
};

const FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: FileText },
  { value: "textarea", label: "Paragraph / Long Text", icon: Sliders },
  { value: "select", label: "Dropdown Select", icon: ListPlus },
  { value: "checkbox", label: "Single Checkbox / Agreement", icon: CheckSquare },
  { value: "multiselect", label: "Checkbox Group", icon: CheckSquare },
  { value: "scale", label: "Linear Rating Scale (1-5)", icon: Star },
  { value: "file", label: "File Upload", icon: Upload },
  { value: "date", label: "Date Picker", icon: Calendar },
  { value: "time", label: "Time Picker", icon: Clock },
  { value: "section", label: "Section Header Break", icon: Heading },
  { value: "image", label: "Image / Display Card", icon: ImageIcon },
  { value: "grid_radio", label: "Single-Choice Grid", icon: Grid },
  { value: "grid_checkbox", label: "Multiple-Choice Grid", icon: Grid },
];

const INITIAL_BLOCK_PRESETS: BlockPreset[] = [
  {
    id: "contact-block",
    name: "Contact Information Block",
    category: "General",
    description: "Standard contact fields: Full Name, Email Address, and Phone Number.",
    fields: [
      { id: "f1", label: "Full Name", field_type: "text", required: true },
      { id: "f2", label: "Email Address", field_type: "text", required: true },
      { id: "f3", label: "Phone Number", field_type: "text", required: false },
    ],
  },
  {
    id: "student-block",
    name: "Student Identity Block",
    category: "Recruitment",
    description: "Academic profile fields: Roll Number, Department / Branch, and Year of Study.",
    fields: [
      { id: "f1", label: "Roll / Admission Number", field_type: "text", required: true },
      { id: "f2", label: "Department / Branch", field_type: "text", required: true },
      { id: "f3", label: "Year of Study", field_type: "select", required: true, options: ["1st Year", "2nd Year", "3rd Year", "4th Year"] },
    ],
  },
  {
    id: "feedback-block",
    name: "Feedback & Rating Block",
    category: "Feedback",
    description: "Linear rating scale (1-5), event highlights paragraph, and suggestions.",
    fields: [
      { id: "f1", label: "Overall Event Rating", field_type: "scale", required: true },
      { id: "f2", label: "Event Highlight", field_type: "textarea", required: false },
      { id: "f3", label: "Suggestions for Improvement", field_type: "textarea", required: false },
    ],
  },
  {
    id: "team-block",
    name: "Team & Hackathon RSVP Block",
    category: "Registrations",
    description: "Team entry fields: Team Name, Team Lead Name, Lead Email, and Team Size.",
    fields: [
      { id: "f1", label: "Team Name", field_type: "text", required: true },
      { id: "f2", label: "Team Lead Name", field_type: "text", required: true },
      { id: "f3", label: "Team Lead Email", field_type: "text", required: true },
      { id: "f4", label: "Team Size", field_type: "select", required: true, options: ["Solo (1)", "Pair (2)", "Team of 3-4"] },
    ],
  },
];

export function FormsManagerClient({
  initialForms,
  initialCategories = [],
}: {
  initialForms: FormItem[];
  initialCategories?: CategoryItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"forms" | "templates" | "categories">("forms");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [presetSubTab, setPresetSubTab] = useState<"master" | "blocks">("master");
  const [isPending, startTransition] = useTransition();

  // Block Presets State
  const [blockPresets, setBlockPresets] = useState<BlockPreset[]>(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("sc_admin_block_presets_v3");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch {}
    return INITIAL_BLOCK_PRESETS;
  });

  // New Form / Template / Category / Block Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"form" | "template" | "category" | "block">("form");

  // Form & Category creation state
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newCatDescription, setNewCatDescription] = useState("");

  // Block Editor Specific State (Visual Field Builder inside Modal)
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const [blockFields, setBlockFields] = useState<PresetFieldItem[]>([]);

  const saveBlockPresetsToStorage = (updated: BlockPreset[]) => {
    setBlockPresets(updated);
    try {
      localStorage.setItem("sc_admin_block_presets_v3", JSON.stringify(updated));
    } catch {}
  };

  // Separate forms & templates
  const liveForms = initialForms.filter((f) => !f.is_template);
  const templateForms = initialForms.filter((f) => f.is_template);

  // Dynamic Categories list
  const categoryNames = Array.from(
    new Set([
      ...initialCategories.map((c) => c.name),
      ...initialForms.map((f) => f.category || "General").filter(Boolean),
      "General",
      "Registrations",
      "Recruitment",
      "Feedback",
      "Competitions",
    ])
  );

  const currentList = activeTab === "forms" ? liveForms : templateForms;

  // Filter forms list by category & search query
  const filteredList = currentList.filter((item) => {
    const itemCat = item.category || "General";
    const matchesCat = selectedCategory === "ALL" || itemCat === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  // Filter Block Presets by category & search query
  const filteredBlockPresets = blockPresets.filter((block) => {
    const matchesCat = selectedCategory === "ALL" || block.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      block.name.toLowerCase().includes(q) ||
      block.description.toLowerCase().includes(q) ||
      block.fields.some((f) => f.label.toLowerCase().includes(q) || f.field_type.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  const handleDuplicate = (id: string) => {
    startTransition(async () => {
      const res = await duplicateFormAction(id);
      if (res.error) {
        toast(`Failed to duplicate: ${res.error}`, "error");
      } else {
        toast("Form duplicated successfully", "success");
        if (res.id) router.push(`/admin/forms/${res.id}`);
      }
    });
  };

  const handleUseTemplate = (templateId: string) => {
    startTransition(async () => {
      const res = await instantiateTemplateAction(templateId);
      if (res.error) {
        toast(`Failed to use template: ${res.error}`, "error");
      } else {
        toast("Form created from preset template!", "success");
        if (res.id) router.push(`/admin/forms/${res.id}`);
      }
    });
  };

  const handleSaveAsTemplate = (formId: string) => {
    startTransition(async () => {
      const res = await saveFormAsTemplateAction(formId);
      if (res.error) {
        toast(`Failed to save template: ${res.error}`, "error");
      } else {
        toast("Saved as reusable preset template!", "success");
        setActiveTab("templates");
        setPresetSubTab("master");
      }
    });
  };

  // Block Builder Field Manipulation Handlers
  const addBlockField = (fieldType: string = "text") => {
    const isChoice = ["select", "multiselect", "grid_radio", "grid_checkbox"].includes(fieldType);
    const newF: PresetFieldItem = {
      id: "f_" + Date.now() + "_" + Math.random().toString(36).slice(2, 5),
      label:
        fieldType === "text"
          ? "New Short Answer Question"
          : fieldType === "textarea"
          ? "New Paragraph Question"
          : fieldType === "select"
          ? "New Dropdown Question"
          : fieldType === "multiselect"
          ? "New Checkbox Group Question"
          : "New Question",
      field_type: fieldType,
      required: false,
      options: isChoice ? ["Option 1", "Option 2", "Option 3"] : undefined,
    };
    setBlockFields([...blockFields, newF]);
  };

  const updateBlockField = (id: string, patch: Partial<PresetFieldItem>) => {
    setBlockFields(
      blockFields.map((f) => {
        if (f.id !== id) return f;
        const updated = { ...f, ...patch };
        // If type changed to choice field and options is empty, populate defaults
        if (
          ["select", "multiselect", "grid_radio", "grid_checkbox"].includes(updated.field_type) &&
          (!updated.options || updated.options.length === 0)
        ) {
          updated.options = ["Option 1", "Option 2"];
        }
        return updated;
      })
    );
  };

  const removeBlockField = (id: string) => {
    setBlockFields(blockFields.filter((f) => f.id !== id));
  };

  const moveBlockField = (index: number, direction: -1 | 1) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= blockFields.length) return;
    const copy = [...blockFields];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;
    setBlockFields(copy);
  };

  const handleSaveBlockPreset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast("Block title is required", "error");
      return;
    }

    if (blockFields.length === 0) {
      toast("Please add at least 1 field to this block preset", "error");
      return;
    }

    if (editingBlockId) {
      const updated = blockPresets.map((b) =>
        b.id === editingBlockId
          ? {
              ...b,
              name: newTitle.trim(),
              category: newCategory,
              description: newCatDescription.trim(),
              fields: blockFields,
            }
          : b
      );
      saveBlockPresetsToStorage(updated);
      toast(`Block preset "${newTitle}" updated successfully!`, "success");
    } else {
      const newBlock: BlockPreset = {
        id: "block_" + Date.now(),
        name: newTitle.trim(),
        category: newCategory,
        description: newCatDescription.trim() || "Custom field block preset.",
        fields: blockFields,
      };
      const updated = [...blockPresets, newBlock];
      saveBlockPresetsToStorage(updated);
      toast(`Block preset "${newTitle}" created successfully!`, "success");
    }

    setIsModalOpen(false);
    setEditingBlockId(null);
  };

  const handleDeleteBlockPreset = (id: string, name: string) => {
    showConfirm({
      title: "Delete Block Preset",
      message: `Remove the preset "${name}"? This cannot be undone.`,
      isDanger: true,
      confirmText: "Delete",
      onConfirm: () => {
        const updated = blockPresets.filter((b) => b.id !== id);
        saveBlockPresetsToStorage(updated);
        toast("Block preset removed", "success");
      },
      onCancel: () => {},
    });
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalMode === "block") {
      return handleSaveBlockPreset(e);
    }

    if (modalMode === "category") {
      if (!newTitle.trim()) return;
      const fd = new FormData();
      fd.append("name", newTitle.trim());
      fd.append("description", newCatDescription);

      startTransition(async () => {
        try {
          await createFormCategoryAction(fd);
          toast(`Category "${newTitle}" created!`, "success");
          setIsModalOpen(false);
        } catch (err: unknown) {
          const e = err as Error;
          toast(`Error creating category: ${e?.message || "Unknown error"}`, "error");
        }
      });
      return;
    }

    if (!newTitle.trim()) return;
    const fd = new FormData();
    fd.append("title", newTitle.trim());
    fd.append("category", newCategory);
    if (modalMode === "template") {
      fd.append("is_template", "true");
    }

    startTransition(async () => {
      try {
        await createForm(fd);
      } catch (err: unknown) {
        const e = err as Error;
        toast(`Error creating form: ${e?.message || "Unknown error"}`, "error");
      }
    });
  };

  const openBlockEditorModal = (block?: BlockPreset) => {
    setModalMode("block");
    if (block) {
      setEditingBlockId(block.id);
      setNewTitle(block.name);
      setNewCategory(block.category);
      setNewCatDescription(block.description);
      setBlockFields(block.fields || []);
    } else {
      setEditingBlockId(null);
      setNewTitle("");
      setNewCategory("General");
      setNewCatDescription("");
      setBlockFields([
        { id: "f1", label: "Full Name", field_type: "text", required: true },
        { id: "f2", label: "Email Address", field_type: "text", required: true },
      ]);
    }
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 font-inter pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase text-navy tracking-tight">
            Forms & Presets Manager
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Build custom forms, manage registrations, categories, and reusable preset templates.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => openBlockEditorModal()}
            className="bg-white border border-gray-300 hover:border-navy text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Blocks className="w-3.5 h-3.5 text-navy" /> New Field Block
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode("category");
              setNewTitle("");
              setNewCatDescription("");
              setIsModalOpen(true);
            }}
            className="bg-white border border-gray-300 hover:border-navy text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Tag className="w-3.5 h-3.5 text-navy" /> New Category
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode("template");
              setNewTitle("");
              setIsModalOpen(true);
            }}
            className="bg-white border border-gray-300 hover:border-navy text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2.5 rounded-full transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5 text-navy" /> New Master Preset
          </button>

          <button
            type="button"
            onClick={() => {
              setModalMode("form");
              setNewTitle("");
              setIsModalOpen(true);
            }}
            className="bg-navy hover:bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold px-5 py-2.5 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> New Form
          </button>
        </div>
      </div>

      {/* Primary Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("forms")}
            className={cn(
              "py-3 px-5 text-xs font-oswald uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "forms"
                ? "border-red text-red"
                : "border-transparent text-gray-500 hover:text-navy"
            )}
          >
            <FileText className="w-4 h-4" /> Live Forms
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold",
                activeTab === "forms" ? "bg-red/10 text-red" : "bg-gray-100 text-gray-600"
              )}
            >
              {liveForms.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={cn(
              "py-3 px-5 text-xs font-oswald uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "templates"
                ? "border-red text-red"
                : "border-transparent text-gray-500 hover:text-navy"
            )}
          >
            <LayoutTemplate className="w-4 h-4" /> Presets & Templates
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold",
                activeTab === "templates" ? "bg-red/10 text-red" : "bg-gray-100 text-gray-600"
              )}
            >
              {templateForms.length + blockPresets.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("categories")}
            className={cn(
              "py-3 px-5 text-xs font-oswald uppercase tracking-widest font-bold border-b-2 transition-all flex items-center gap-2 cursor-pointer",
              activeTab === "categories"
                ? "border-red text-red"
                : "border-transparent text-gray-500 hover:text-navy"
            )}
          >
            <FolderTree className="w-4 h-4" /> Categories
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold",
                activeTab === "categories" ? "bg-red/10 text-red" : "bg-gray-100 text-gray-600"
              )}
            >
              {categoryNames.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        {activeTab !== "categories" && (
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search forms & presets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-full pl-9 pr-4 py-1.5 text-xs text-navy focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy/10 transition-all shadow-xs"
            />
          </div>
        )}
      </div>

      {/* Category Filter Bar */}
      {activeTab !== "categories" && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <span className="text-[11px] font-oswald uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1 shrink-0 mr-1">
            <Tag className="w-3 h-3 text-red" /> Category:
          </span>

          <button
            type="button"
            onClick={() => setSelectedCategory("ALL")}
            className={cn(
              "px-3.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer",
              selectedCategory === "ALL"
                ? "bg-navy text-white shadow-xs"
                : "bg-gray-100 hover:bg-gray-200 text-navy/70"
            )}
          >
            All Categories ({activeTab === "forms" ? liveForms.length : templateForms.length + blockPresets.length})
          </button>

          {categoryNames.map((cat) => {
            const count =
              activeTab === "forms"
                ? liveForms.filter((f) => (f.category || "General") === cat).length
                : templateForms.filter((f) => (f.category || "General") === cat).length +
                  blockPresets.filter((b) => b.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5",
                  selectedCategory === cat
                    ? "bg-navy text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-navy/70"
                )}
              >
                {cat}
                <span className="text-[10px] opacity-75 font-mono">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Sub-toggle inside Presets & Templates tab */}
      {activeTab === "templates" && (
        <div className="flex items-center gap-3 bg-gray-100 p-1.5 rounded-xl w-fit border border-gray-200">
          <button
            type="button"
            onClick={() => setPresetSubTab("master")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-oswald uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
              presetSubTab === "master" ? "bg-white text-navy shadow-xs" : "text-gray-500 hover:text-navy"
            )}
          >
            <LayoutTemplate className="w-3.5 h-3.5 text-red" /> Full Form Master Templates ({filteredList.length})
          </button>
          <button
            type="button"
            onClick={() => setPresetSubTab("blocks")}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-oswald uppercase font-bold tracking-wider transition-all flex items-center gap-1.5 cursor-pointer",
              presetSubTab === "blocks" ? "bg-white text-navy shadow-xs" : "text-gray-500 hover:text-navy"
            )}
          >
            <Blocks className="w-3.5 h-3.5 text-navy" /> Field Block Presets ({filteredBlockPresets.length})
          </button>
        </div>
      )}

      {/* Tab 3: Categories View */}
      {activeTab === "categories" ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryNames.map((cat) => {
              const liveCount = liveForms.filter((f) => (f.category || "General") === cat).length;
              const templateCount = templateForms.filter((f) => (f.category || "General") === cat).length;
              const dbCat = initialCategories.find((c) => c.name.toLowerCase() === cat.toLowerCase());

              return (
                <div
                  key={cat}
                  className="bg-white border border-gray-200 hover:border-navy/30 rounded-2xl p-5 shadow-xs transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full text-xs font-oswald uppercase font-bold tracking-wider bg-navy text-white shadow-xs">
                        {cat}
                      </span>
                      {dbCat && (
                        <button
                          type="button"
                          className="p-1.5 text-gray-400 hover:text-red hover:bg-red/10 rounded-lg transition-colors cursor-pointer"
                          onClick={() => {
                            showConfirm({
                              title: "Delete Category",
                              message: `Delete the category "${cat}"? All forms in it will become uncategorised.`,
                              isDanger: true,
                              confirmText: "Delete",
                              onConfirm: () => {
                                deleteFormCategoryAction(dbCat.id);
                              },
                              onCancel: () => {},
                            });
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 line-clamp-2">
                      {dbCat?.description || `Forms and preset templates associated with ${cat}.`}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-mono text-gray-600">
                    <div className="flex items-center gap-3">
                      <span>
                        <strong className="text-navy font-bold">{liveCount}</strong> Live Forms
                      </span>
                      <span>•</span>
                      <span>
                        <strong className="text-amber-700 font-bold">{templateCount}</strong> Presets
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab("forms");
                      }}
                      className="text-navy hover:text-red font-oswald uppercase font-bold text-[11px] tracking-wider flex items-center gap-1 cursor-pointer"
                    >
                      View Forms <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === "templates" && presetSubTab === "blocks" ? (
        /* Field Block Presets Grid */
        <div className="space-y-4">
          {filteredBlockPresets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white space-y-3">
              <Blocks className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-oswald text-lg font-bold uppercase text-navy">
                No Block Presets Found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                No field block presets match &quot;{searchQuery}&quot;. Click &quot;+ New Field Block&quot; to build custom reusable field combinations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBlockPresets.map((block) => (
                <div
                  key={block.id}
                  className="bg-white border border-gray-200 hover:border-navy/30 rounded-2xl p-5 shadow-xs transition-all space-y-3 flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-oswald text-lg font-bold uppercase text-navy group-hover:text-red transition-colors flex items-center gap-2">
                        <Blocks className="w-4 h-4 text-red" /> {block.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider bg-gray-100 text-navy border border-gray-200">
                        {block.category}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500">{block.description}</p>

                    {/* Interactive Field Pills Preview */}
                    <div className="space-y-1.5 pt-2">
                      <span className="text-[10px] font-oswald uppercase font-bold text-gray-400 tracking-wider block">
                        Included Questions ({block.fields?.length || 0}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(block.fields || []).map((f) => (
                          <span
                            key={f.id}
                            className="bg-navy/5 text-navy font-mono text-[11px] px-2.5 py-1 rounded-lg border border-navy/10 flex items-center gap-1.5 font-semibold"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-red" />
                            {f.label}
                            <span className="text-[9px] uppercase font-bold opacity-60 bg-white px-1 rounded">
                              {f.field_type}
                            </span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 font-mono">
                    <span className="text-[11px] text-gray-500">Reusable Block</span>

                    {/* EDIT and DELETE Buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openBlockEditorModal(block)}
                        className="bg-navy hover:bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Block
                      </button>

                      <Tooltip tip="Delete Block Preset">
                        <button
                          type="button"
                          onClick={() => handleDeleteBlockPreset(block.id, block.name)}
                          className="p-1.5 text-gray-400 hover:text-red hover:bg-red/10 rounded-xl transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* List Container for Live Forms and Master Templates */
        <div className="space-y-3">
          {filteredList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center bg-white space-y-3">
              <LayoutTemplate className="w-10 h-10 text-gray-300 mx-auto" />
              <h3 className="font-oswald text-lg font-bold uppercase text-navy">
                No {activeTab === "forms" ? "Live Forms" : "Presets or Templates"} Found
              </h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                {searchQuery || selectedCategory !== "ALL"
                  ? "No items match your active search and category filters."
                  : activeTab === "forms"
                  ? "Create a new form from scratch or start from one of our pre-built preset templates."
                  : "Save any form as a preset template or create custom templates for quick re-use."}
              </p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 hover:border-navy/30 rounded-2xl p-5 shadow-xs transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-oswald text-xl font-bold uppercase text-navy group-hover:text-red transition-colors truncate">
                      {item.title}
                    </h3>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider bg-gray-100 text-navy border border-gray-200">
                      {item.category || "General"}
                    </span>

                    {item.is_template ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                        <BookmarkPlus className="w-3 h-3 text-amber-600" /> Editable Preset
                      </span>
                    ) : (
                      <span
                        className={cn(
                          "px-2.5 py-0.5 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider flex items-center gap-1",
                          item.is_active !== false
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-red/10 text-red border border-red/20"
                        )}
                      >
                        {item.is_active !== false ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-600" /> Active
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3 text-red" /> Inactive
                          </>
                        )}
                      </span>
                    )}
                  </div>

                  {item.description && (
                    <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-500 font-mono">
                    <span className="bg-navy/5 text-navy border border-navy/15 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                      <span>Form Code: <strong className="text-red">{item.slug || item.id}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.slug || item.id);
                          toast(`Copied Form Code '${item.slug || item.id}'`, "success");
                        }}
                        className="p-1 text-gray-400 hover:text-navy transition-colors cursor-pointer"
                        title="Copy Form Code"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-gray-100">
                  {item.is_template ? (
                    <>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleUseTemplate(item.id)}
                        className="bg-navy hover:bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-red" /> Use Template
                      </button>

                      <Link
                        href={`/admin/forms/${item.id}`}
                        className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Edit className="w-3.5 h-3.5 text-navy/70" /> Edit Template
                      </Link>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDuplicate(item.id)}
                        className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Copy className="w-3.5 h-3.5 text-navy/70" /> Duplicate
                      </button>
                    </>
                  ) : (
                    <>
                      {item.slug && (
                        <a
                          href={`/forms/${item.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-navy/70" /> View
                        </a>
                      )}

                      <Link
                        href={`/admin/forms/${item.id}/submissions`}
                        className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3.5 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <Inbox className="w-3.5 h-3.5 text-navy/70" /> Submissions
                      </Link>

                      <Link
                        href={`/admin/forms/${item.id}`}
                        className="bg-navy hover:bg-red text-white font-oswald text-xs uppercase tracking-widest font-bold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit Form
                      </Link>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleSaveAsTemplate(item.id)}
                        title="Save as a reusable preset template"
                        className="bg-gray-100 hover:bg-gray-200 text-navy font-oswald text-xs uppercase tracking-widest font-bold px-3 py-2 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <BookmarkPlus className="w-3.5 h-3.5 text-amber-600" /> Save as Preset
                      </button>

                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDuplicate(item.id)}
                        className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                        title="Duplicate Form"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-red hover:bg-red/10 rounded-xl transition-colors cursor-pointer"
                    onClick={() => {
                      showConfirm({
                        title: "Delete Form",
                        message: `Permanently delete "${item.title}"? All its fields and responses will also be removed.`,
                        isDanger: true,
                        confirmText: "Delete",
                        onConfirm: () => {
                          deleteForm(item.id);
                        },
                        onCancel: () => {},
                      });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Interactive Modal for Creating/Editing Forms, Categories, Master Presets, or FIELD BLOCKS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div
            className={cn(
              "bg-white rounded-3xl p-6 sm:p-8 w-full shadow-2xl border border-gray-200 space-y-6 animate-in fade-in zoom-in-95 duration-200 my-8",
              modalMode === "block" ? "max-w-3xl" : "max-w-md"
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy flex items-center gap-2">
                {modalMode === "block" ? (
                  <>
                    <Blocks className="w-5 h-5 text-red" />{" "}
                    {editingBlockId ? "Edit Field Block Preset" : "Build Field Block Preset"}
                  </>
                ) : modalMode === "form" ? (
                  <>
                    <Plus className="w-5 h-5 text-red" /> Create New Form
                  </>
                ) : modalMode === "template" ? (
                  <>
                    <BookmarkPlus className="w-5 h-5 text-amber-600" /> Create Master Preset
                  </>
                ) : (
                  <>
                    <Tag className="w-5 h-5 text-navy" /> Add Category
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingBlockId(null);
                }}
                className="p-1.5 text-gray-400 hover:text-navy rounded-full hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNew} className="space-y-5">
              {/* BLOCK PRESET VISUAL EDITOR */}
              {modalMode === "block" ? (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                        Block Preset Title *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Contact Information Block"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                        Category
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all font-semibold"
                      >
                        {categoryNames.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                      Description
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Standard contact questions block for student entries."
                      value={newCatDescription}
                      onChange={(e) => setNewCatDescription(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all"
                    />
                  </div>

                  {/* VISUAL FIELD CANVAS & EDITOR */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-oswald uppercase font-bold tracking-wider text-navy flex items-center gap-1.5">
                        <Blocks className="w-4 h-4 text-red" /> Block Questions ({blockFields.length})
                      </label>
                    </div>

                    {/* Field Item Cards List (Generous max-height and no clipping) */}
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1 pb-2">
                      {blockFields.map((field, idx) => {
                        const isChoiceField = ["select", "multiselect", "grid_radio", "grid_checkbox"].includes(
                          field.field_type
                        );

                        return (
                          <div
                            key={field.id}
                            className="bg-gray-50 border border-gray-200 rounded-2xl p-4 space-y-3 transition-all"
                          >
                            {/* Card Main Row */}
                            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="text-xs font-mono font-bold text-gray-400 w-5 text-center shrink-0">
                                  {idx + 1}.
                                </span>

                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => updateBlockField(field.id, { label: e.target.value })}
                                  placeholder="Question Label..."
                                  className="flex-1 bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none focus:border-red min-w-[140px]"
                                />
                              </div>

                              <div className="flex items-center gap-2 flex-wrap shrink-0 justify-between md:justify-end">
                                <select
                                  value={field.field_type}
                                  onChange={(e) => updateBlockField(field.id, { field_type: e.target.value })}
                                  className="bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-navy font-semibold focus:outline-none focus:border-red shrink-0"
                                >
                                  {FIELD_TYPES.map((ft) => (
                                    <option key={ft.value} value={ft.value}>
                                      {ft.label}
                                    </option>
                                  ))}
                                </select>

                                <label className="flex items-center gap-1.5 text-xs font-bold text-navy cursor-pointer select-none bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shrink-0">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => updateBlockField(field.id, { required: e.target.checked })}
                                    className="w-4 h-4 accent-red rounded cursor-pointer"
                                  />
                                  Required
                                </label>

                                <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-xl px-1 py-1 shrink-0">
                                  <button
                                    type="button"
                                    disabled={idx === 0}
                                    onClick={() => moveBlockField(idx, -1)}
                                    className="p-1 text-gray-400 hover:text-navy disabled:opacity-30 cursor-pointer"
                                    title="Move Up"
                                  >
                                    <ChevronUp className="w-4 h-4" />
                                  </button>
                                  <button
                                    type="button"
                                    disabled={idx === blockFields.length - 1}
                                    onClick={() => moveBlockField(idx, 1)}
                                    className="p-1 text-gray-400 hover:text-navy disabled:opacity-30 cursor-pointer"
                                    title="Move Down"
                                  >
                                    <ChevronDown className="w-4 h-4" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => removeBlockField(field.id)}
                                  className="bg-red/10 hover:bg-red text-red hover:text-white px-3 py-2 rounded-xl text-xs font-bold font-oswald uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <Trash2 className="w-3.5 h-3.5" /> Delete
                                </button>
                              </div>
                            </div>

                            {/* INLINE CHOICES / OPTIONS EDITOR (For Dropdown, Checkbox Group, and Grids) */}
                            {isChoiceField && (
                              <div className="pt-2 border-t border-gray-200/60 space-y-2 pl-7">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-oswald uppercase font-bold text-navy/70 tracking-wider">
                                    Options / Choice Items ({(field.options || []).length}):
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const currentOpts = field.options || [];
                                      updateBlockField(field.id, {
                                        options: [...currentOpts, `Option ${currentOpts.length + 1}`],
                                      });
                                    }}
                                    className="text-[11px] font-oswald font-bold uppercase tracking-wider text-red hover:underline cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" /> Add Choice Option
                                  </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                  {(field.options || []).map((opt, optIdx) => (
                                    <div
                                      key={optIdx}
                                      className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-xl px-3 py-1 shadow-xs"
                                    >
                                      <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                          const copy = [...(field.options || [])];
                                          copy[optIdx] = e.target.value;
                                          updateBlockField(field.id, { options: copy });
                                        }}
                                        className="text-xs text-navy font-semibold bg-transparent focus:outline-none w-28"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const copy = (field.options || []).filter((_, i) => i !== optIdx);
                                          updateBlockField(field.id, { options: copy });
                                        }}
                                        className="text-gray-400 hover:text-red p-0.5 cursor-pointer"
                                        title="Remove Option"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={() => addBlockField("text")}
                      className="w-full py-2.5 bg-white border border-dashed border-gray-300 hover:border-red text-navy hover:text-red font-oswald text-xs uppercase font-bold tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Field Question
                    </button>
                  </div>
                </div>
              ) : modalMode === "category" ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                      Category Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Competitions"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                      Description
                    </label>
                    <textarea
                      placeholder="Brief description of forms under this category..."
                      value={newCatDescription}
                      onChange={(e) => setNewCatDescription(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all h-20"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                      Title *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={
                        modalMode === "form"
                          ? "e.g., Annual Workshop RSVP"
                          : "e.g., General Event Registration Preset"
                      }
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-widest text-navy block">
                      Category
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all font-semibold"
                    >
                      {categoryNames.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlockId(null);
                  }}
                  className="px-5 py-2.5 border border-gray-300 rounded-full font-oswald uppercase tracking-widest text-xs font-bold text-navy hover:border-navy transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="px-6 py-2.5 bg-navy hover:bg-red text-white rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : editingBlockId ? (
                    "Update Block Preset"
                  ) : (
                    "Save Preset"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
