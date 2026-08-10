"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, KeyboardSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Plus, Trash2, Edit2, CheckCircle2, FolderPlus, CalendarPlus, Users, Layers, Calendar, Image as ImageIcon, User, Crop, Save, ChevronUp, ChevronDown } from "lucide-react";
import {
  duplicateTerm, publishTerm, reorderExecomMembers, saveExecomMember, deleteExecomMember,
  saveCategory, deleteCategory, saveTerm, deleteTerm, reorderCategories,
} from "@/lib/admin/execom-actions";
import { ConfirmModal, PromptModal, type ConfirmConfig, type PromptConfig } from "@/components/ui/ModalDialog";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import { ImageCropperModal } from "@/components/admin/ImageCropperModal";
import { useUploadThing } from "@/lib/uploadthing";
import { toast } from "@/components/ui/Toast";

type Member = {
  id: string;
  name: string;
  position: string;
  role_type: string;
  team_slug: string;
  term: string;
  bio: string | null;
  photo_url: string | null;
  email: string | null;
  linkedin: string | null;
  display_order: number;
  is_published: boolean;
};

type Category = {
  slug: string;
  name: string;
  label: string;
  tagline?: string | null;
  description?: string | null;
  sort_order: number;
};

type TermItem = {
  id: string;
  name: string;
  is_published: boolean;
  sort_order: number;
};

function SortableMemberRow({ member, onEdit }: { member: Member; onEdit: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: member.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="group flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-0 bg-white hover:bg-gray-50/80 transition-colors"
    >
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-gray-300 group-hover:text-gray-400 hover:!text-navy touch-none transition-colors" aria-label="Drag to reorder">
        <GripVertical className="w-4 h-4" />
      </button>
      
      {member.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={member.photo_url} alt="" className="w-8 h-8 rounded-full object-cover bg-gray-100" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200" />
      )}
      
      <div className="flex-1 min-w-0 flex flex-col">
        <span className="font-medium text-sm truncate">{member.name}</span>
        <span className="text-xs text-gray-500 truncate">{member.position}</span>
      </div>

      {!member.is_published && (
        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md border bg-gray-50 text-gray-500 border-gray-200">
          Draft
        </span>
      )}

      <button onClick={onEdit} className="p-2 text-gray-400 hover:text-navy transition-colors">
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
}

function MemberGroup({ 
  title, 
  members, 
  onAdd, 
  onEdit,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown
}: { 
  title: string; 
  members: Member[]; 
  onAdd: () => void; 
  onEdit: (m: Member) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          {onMoveUp && onMoveDown && (
            <div className="flex items-center gap-0.5 bg-gray-100 p-0.5 rounded-lg border border-gray-200">
              <button
                type="button"
                onClick={onMoveUp}
                disabled={!canMoveUp}
                className="p-1 rounded text-navy hover:bg-navy hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Move Category Up"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onMoveDown}
                disabled={!canMoveDown}
                className="p-1 rounded text-navy hover:bg-navy hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors cursor-pointer"
                title="Move Category Down"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <h2 className="font-oswald text-xl uppercase font-bold text-navy flex items-center gap-2">{title}</h2>
        </div>

        <button onClick={onAdd} className="text-xs font-bold uppercase tracking-widest text-navy/70 hover:text-red flex items-center gap-1 bg-gray-100 hover:bg-red/10 px-3 py-1.5 rounded-full transition-colors cursor-pointer border border-gray-200">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
        {members.length === 0 ? (
          <p className="p-4 text-center text-gray-400 text-sm">No members here yet.</p>
        ) : (
          <SortableContext items={members.map((m) => m.id)} strategy={verticalListSortingStrategy}>
            {members.map((m) => (
              <SortableMemberRow key={m.id} member={m} onEdit={() => onEdit(m)} />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}

export function ExecomWorkspaceClient({
  activeTerm,
  viewedTerm,
  initialMembers,
  categories,
  terms,
}: {
  activeTerm: string;
  viewedTerm: string;
  initialMembers: Member[];
  categories: Category[];
  terms: TermItem[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"members" | "categories" | "terms">("members");
  const [members, setMembers] = useState(initialMembers);
  const [categoryList, setCategoryList] = useState(categories);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMembers(initialMembers);
  }, [initialMembers]);

  useEffect(() => {
    setCategoryList(categories);
  }, [categories]);

  const handleMoveCategory = (slug: string, direction: "up" | "down") => {
    const idx = categoryList.findIndex((c) => c.slug === slug);
    if (idx === -1) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= categoryList.length) return;

    const newCategories = [...categoryList];
    const [moved] = newCategories.splice(idx, 1);
    newCategories.splice(targetIdx, 0, moved);

    const updated = newCategories.map((cat, i) => ({
      ...cat,
      sort_order: i,
      label: String(i + 1).padStart(2, "0"),
    }));

    setCategoryList(updated);

    startTransition(async () => {
      try {
        await reorderCategories(updated.map((c) => ({ slug: c.slug, sort_order: c.sort_order })));
        router.refresh();
        toast("Category reordered successfully", "success");
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  };

  // Member Modal State
  const [editingMember, setEditingMember] = useState<Member | Partial<Member> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Category Modal State
  const [editingCategory, setEditingCategory] = useState<Category | Partial<Category> | null>(null);

  // Custom Dialog Modals State
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [promptConfig, setPromptConfig] = useState<PromptConfig | null>(null);
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [cropperSrc, setCropperSrc] = useState<string | File | null>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      const url = res?.[0]?.url || res?.[0]?.ufsUrl;
      if (url) {
        setEditingMember((prev) => (prev ? { ...prev, photo_url: url } : null));
        toast("Cropped photo uploaded!", "success");
      }
    },
    onUploadError: (err) => toast("Photo upload failed: " + err.message, "error"),
  });

  // Term Modal State
  const [newTermName, setNewTermName] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;

    setMembers((items) => {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const activeItem = items[oldIndex];
      const overItem = items[newIndex];
      
      if (activeItem.team_slug !== overItem.team_slug || activeItem.role_type !== overItem.role_type) {
        return items;
      }

      const newItems = arrayMove(items, oldIndex, newIndex);
      const groupItems = newItems.filter(
        i => i.team_slug === activeItem.team_slug && i.role_type === activeItem.role_type
      );
      
      startTransition(async () => {
        await reorderExecomMembers(groupItems.map((item, idx) => ({ id: item.id, order: idx })));
      });

      return newItems;
    });
  };

  const facultyAdvisors = members.filter(m => m.role_type === "faculty_advisor");
  const studentMembers = members.filter(m => m.role_type === "student");

  // Construct all sections with number prefix (01 Faculty Advisors, 02 Core Team, 03 Technical...)
  const facultySection = {
    isFaculty: true,
    key: "faculty_advisors",
    title: "01 FACULTY ADVISORS",
    members: facultyAdvisors,
    onAdd: () => setEditingMember({ role_type: "faculty_advisor", team_slug: categoryList[0]?.slug ?? "core", is_published: true }),
    onMoveUp: undefined as (() => void) | undefined,
    onMoveDown: undefined as (() => void) | undefined,
    canMoveUp: false,
    canMoveDown: false,
  };

  const categorySections = categoryList.map((cat, idx) => ({
    isFaculty: false,
    key: cat.slug,
    slug: cat.slug,
    title: `${String(idx + 2).padStart(2, "0")} ${cat.name || cat.label}`.toUpperCase(),
    members: studentMembers.filter((m) => m.team_slug === cat.slug),
    onAdd: () => setEditingMember({ role_type: "student", team_slug: cat.slug, is_published: true }),
    onMoveUp: () => handleMoveCategory(cat.slug, "up"),
    onMoveDown: () => handleMoveCategory(cat.slug, "down"),
    canMoveUp: idx > 0,
    canMoveDown: idx < categoryList.length - 1,
  }));

  const allSections = [facultySection, ...categorySections];
  const leftColumnSections = allSections.filter((_, i) => i % 2 === 0);
  const rightColumnSections = allSections.filter((_, i) => i % 2 === 1);

  const handleQuickSaveExecom = () => {
    startTransition(async () => {
      try {
        const updates = members.map((m, idx) => ({ id: m.id, order: idx }));
        await reorderExecomMembers(updates);
        toast(`Execom committee data for '${viewedTerm}' saved & updated successfully!`, "success");
        router.refresh();
      } catch (err: unknown) {
        toast("Failed to update Execom: " + (err as Error).message, "error");
      }
    });
  };

  function handleDuplicate() {
    setPromptConfig({
      title: "Duplicate Execom Term",
      label: "Enter new term (e.g. 2026-27):",
      initialValue: viewedTerm,
      placeholder: "e.g. 2026-27",
      submitText: "Duplicate Term",
      onCancel: () => setPromptConfig(null),
      onSubmit: async (newTerm) => {
        setPromptConfig(null);
        if (!newTerm || newTerm === viewedTerm) return;
        setIsDuplicating(true);
        try {
          await duplicateTerm(viewedTerm, newTerm);
          router.push(`/admin/execom?term=${newTerm}`);
        } catch (e: unknown) {
          toast("Failed to duplicate: " + (e as Error).message, "error");
        }
        setIsDuplicating(false);
      },
    });
  }

  function handlePublish() {
    setConfirmConfig({
      title: "Publish Committee",
      message: `Are you sure you want to publish the ${viewedTerm} committee? This will make it live on the website.`,
      confirmText: "Publish Committee",
      isDanger: false,
      onCancel: () => setConfirmConfig(null),
      onConfirm: async () => {
        setConfirmConfig(null);
        setIsPublishing(true);
        try {
          await publishTerm(viewedTerm);
          router.refresh();
        } catch (e: unknown) {
          toast("Failed to publish: " + (e as Error).message, "error");
        }
        setIsPublishing(false);
      },
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingMember) return;
    setSaveError(null);
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      const res = await saveExecomMember(
        editingMember.id ? (editingMember as Member).id : null,
        viewedTerm,
        null,
        fd
      );
      if (res?.error) {
        setSaveError(res.error);
      } else {
        setEditingMember(null);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!editingMember || !editingMember.id) return;
    setConfirmConfig({
      title: "Remove Member",
      message: "Are you sure you want to remove this member?",
      confirmText: "Remove Member",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: async () => {
        setConfirmConfig(null);
        setIsDeleting(true);
        try {
          await deleteExecomMember((editingMember as Member).id);
          setEditingMember(null);
          router.refresh();
        } catch (e: unknown) {
          setSaveError((e as Error).message);
        }
        setIsDeleting(false);
      },
    });
  }

  // Category Actions
  async function handleSaveCategory(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingCategory) return;
    startTransition(async () => {
      const fd = new FormData(e.currentTarget);
      try {
        await saveCategory(editingCategory.slug ? editingCategory.slug : null, fd);
        setEditingCategory(null);
        router.refresh();
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  }

  function handleDeleteCategory(slug: string) {
    setConfirmConfig({
      title: "Delete Category",
      message: `Delete category '${slug}'? Members in this category will need a new category.`,
      confirmText: "Delete Category",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          try {
            await deleteCategory(slug);
            router.refresh();
          } catch (err: unknown) {
            toast((err as Error).message, "error");
          }
        });
      },
    });
  }

  // Term Actions
  async function handleSaveTerm(e: React.FormEvent) {
    e.preventDefault();
    if (!newTermName.trim()) return;
    startTransition(async () => {
      try {
        await saveTerm(null, newTermName);
        setNewTermName("");
        router.refresh();
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  }

  function handleDeleteTerm(id: string, name: string) {
    setConfirmConfig({
      title: "Delete Term",
      message: `Delete term '${name}'?`,
      confirmText: "Delete Term",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          try {
            await deleteTerm(id);
            router.refresh();
          } catch (err: unknown) {
            toast((err as Error).message, "error");
          }
        });
      },
    });
  }

  return (
    <div>
      {/* Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase flex items-center gap-3">
            Execom Management
            {activeTerm === viewedTerm && (
              <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md border bg-green-50 text-green-700 border-green-200">
                LIVE ({viewedTerm})
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage members, categories, and academic sessions.</p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleQuickSaveExecom}
            disabled={isPending}
            className="bg-navy hover:bg-red text-white px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save / Update Execom"}
          </button>

          {activeTerm !== viewedTerm ? (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-amber-600 hover:bg-navy text-white px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" /> Publish Committee ({viewedTerm})
            </button>
          ) : (
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="bg-white border border-gray-200 text-navy px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
            >
              Start New Session
            </button>
          )}

          <button
            type="button"
            onClick={() =>
              setEditingMember({
                name: "",
                position: "",
                role_type: "student",
                team_slug: categories[0]?.slug || "core",
                term: viewedTerm,
                is_published: true,
              })
            }
            className="bg-red hover:bg-navy text-white px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Member
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-5 py-3 font-oswald uppercase tracking-wider text-sm font-bold border-b-2 transition-colors ${
            activeTab === "members"
              ? "border-navy text-navy"
              : "border-transparent text-gray-400 hover:text-navy"
          }`}
        >
          <Users className="w-4 h-4" /> Members ({viewedTerm})
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-5 py-3 font-oswald uppercase tracking-wider text-sm font-bold border-b-2 transition-colors ${
            activeTab === "categories"
              ? "border-navy text-navy"
              : "border-transparent text-gray-400 hover:text-navy"
          }`}
        >
          <Layers className="w-4 h-4" /> Categories / Teams ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab("terms")}
          className={`flex items-center gap-2 px-5 py-3 font-oswald uppercase tracking-wider text-sm font-bold border-b-2 transition-colors ${
            activeTab === "terms"
              ? "border-navy text-navy"
              : "border-transparent text-gray-400 hover:text-navy"
          }`}
        >
          <Calendar className="w-4 h-4" /> Academic Terms ({terms.length})
        </button>
      </div>

      {/* TAB 1: MEMBERS */}
      {activeTab === "members" && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
            <div className="space-y-2">
              {leftColumnSections.map((sec) => (
                <MemberGroup 
                  key={sec.key}
                  title={sec.title} 
                  members={sec.members}
                  onAdd={sec.onAdd}
                  onEdit={setEditingMember}
                  onMoveUp={sec.onMoveUp}
                  onMoveDown={sec.onMoveDown}
                  canMoveUp={sec.canMoveUp}
                  canMoveDown={sec.canMoveDown}
                />
              ))}
            </div>
            <div className="space-y-2">
              {rightColumnSections.map((sec) => (
                <MemberGroup 
                  key={sec.key}
                  title={sec.title}
                  members={sec.members}
                  onAdd={sec.onAdd}
                  onEdit={setEditingMember}
                  onMoveUp={sec.onMoveUp}
                  onMoveDown={sec.onMoveDown}
                  canMoveUp={sec.canMoveUp}
                  canMoveDown={sec.canMoveDown}
                />
              ))}
            </div>
          </div>
        </DndContext>
      )}

      {/* TAB 2: CATEGORIES */}
      {activeTab === "categories" && (
        <div className="max-w-4xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-oswald text-2xl font-bold uppercase text-navy">Categories & Teams</h2>
              <p className="text-sm text-gray-500">Define and reorder the teams that organize members on the website.</p>
            </div>
            <button
              onClick={() => setEditingCategory({ name: "", label: "", sort_order: categoryList.length })}
              className="bg-navy text-white px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4" /> Add Category
            </button>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-xs">
            {categoryList.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No categories defined yet.</p>
            ) : (
              categoryList.map((cat, idx) => (
                <div key={cat.slug} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col gap-0.5 bg-gray-100 p-1 rounded-lg border border-gray-200">
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(cat.slug, "up")}
                        disabled={idx === 0}
                        className="p-1 text-navy hover:bg-navy hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors rounded cursor-pointer"
                        title="Move Category Up"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveCategory(cat.slug, "down")}
                        disabled={idx === categoryList.length - 1}
                        className="p-1 text-navy hover:bg-navy hover:text-white disabled:opacity-20 disabled:pointer-events-none transition-colors rounded cursor-pointer"
                        title="Move Category Down"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-oswald text-xs font-bold text-red bg-red/10 px-2 py-0.5 rounded-md border border-red/20">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span className="font-bold text-navy text-base">{cat.name || cat.label}</span>
                        <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">slug: {cat.slug}</span>
                      </div>
                      {cat.tagline && <p className="text-xs font-semibold text-navy/70 mt-1">Tagline: {cat.tagline}</p>}
                      {cat.description && <p className="text-xs text-gray-500 mt-0.5 max-w-xl">{cat.description}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => setEditingCategory(cat)} className="p-2 text-gray-400 hover:text-navy transition-colors cursor-pointer" title="Edit Category">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory(cat.slug)} className="p-2 text-gray-400 hover:text-red transition-colors cursor-pointer" title="Delete Category">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TERMS */}
      {activeTab === "terms" && (
        <div className="max-w-3xl space-y-6">
          <div>
            <h2 className="font-oswald text-2xl font-bold uppercase text-navy">Academic Terms</h2>
            <p className="text-sm text-gray-500">Create, publish, and manage academic session terms.</p>
          </div>

          <form onSubmit={handleSaveTerm} className="flex items-center gap-3">
            <input
              type="text"
              placeholder="New term name (e.g. 2026-27)"
              value={newTermName}
              onChange={(e) => setNewTermName(e.target.value)}
              className="flex-1 border-gray-200 rounded-xl text-sm px-4 py-2.5"
            />
            <button
              type="submit"
              disabled={isPending || !newTermName.trim()}
              className="bg-navy text-white px-5 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <CalendarPlus className="w-4 h-4" /> Add Term
            </button>
          </form>

          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {terms.length === 0 ? (
              <p className="p-6 text-center text-gray-400 text-sm">No terms defined yet.</p>
            ) : (
              terms.map((t) => (
                <div key={t.id} className="flex items-center justify-between px-6 py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-navy font-mono text-base">{t.name}</span>
                    {t.name === activeTerm && (
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md bg-green-50 text-green-700 border border-green-200">
                        Live Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setPromptConfig({
                          title: "Edit Term Name",
                          label: "Enter updated term name:",
                          initialValue: t.name,
                          submitText: "Save Name",
                          onCancel: () => setPromptConfig(null),
                          onSubmit: (updated) => {
                            setPromptConfig(null);
                            if (updated && updated.trim() && updated !== t.name) {
                              startTransition(async () => {
                                try {
                                  await saveTerm(t.id, updated.trim());
                                  router.refresh();
                                } catch (err: unknown) {
                                  toast((err as Error).message, "error");
                                }
                              });
                            }
                          },
                        });
                      }}
                      className="p-2 text-gray-400 hover:text-navy transition-colors cursor-pointer"
                      title="Edit term name"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTerm(t.id, t.name)}
                      className="p-2 text-gray-400 hover:text-red transition-colors"
                      title="Delete term"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Member Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/20 backdrop-blur-sm" onClick={() => setEditingMember(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-100">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <h2 className="font-oswald text-xl uppercase font-bold text-navy">
                {editingMember.id ? "Edit Member" : "Add Member"}
              </h2>
              {editingMember.id && (
                <button type="button" onClick={handleDelete} disabled={isDeleting} className="text-red hover:text-red/80 transition-colors p-2">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {saveError && (
                <div className="bg-red-50 text-red text-sm p-3 rounded-lg border border-red-100">
                  {saveError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Name</label>
                  <input name="name" defaultValue={editingMember.name} required className="w-full border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Position</label>
                  <input name="position" defaultValue={editingMember.position} required className="w-full border-gray-200 rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Role Type</label>
                  <select name="role_type" defaultValue={editingMember.role_type} className="w-full border-gray-200 rounded-lg text-sm">
                    <option value="student">Student</option>
                    <option value="faculty_advisor">Faculty Advisor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Category / Team</label>
                  <select name="team_slug" defaultValue={editingMember.team_slug} className="w-full border-gray-200 rounded-lg text-sm">
                    {categories.map(c => (
                      <option key={c.slug} value={c.slug}>{c.name ? `${c.name} (${c.label})` : c.label || c.slug}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Member Photo</label>
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 rounded-xl p-3">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 border border-gray-300 shrink-0 flex items-center justify-center relative">
                    {editingMember.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editingMember.photo_url} alt={editingMember.name || "Member preview"} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <input
                      name="photo_url"
                      value={editingMember.photo_url || ""}
                      onChange={(e) => setEditingMember(prev => prev ? ({ ...prev, photo_url: e.target.value }) : null)}
                      placeholder="https://... or choose from media"
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-navy font-mono placeholder:text-gray-400 focus:outline-none focus:border-red"
                    />
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsMediaPickerOpen(true)}
                        className="bg-navy text-white text-[11px] font-oswald uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg hover:bg-red transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" /> Media Library
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          setCropperSrc(editingMember.photo_url || "");
                          setIsCropperOpen(true);
                        }}
                        className="bg-white border border-gray-200 text-navy hover:bg-gray-100 text-[11px] font-oswald uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        title="Crop photo into a 500x500 circle with transparent edges"
                      >
                        <Crop className="w-3.5 h-3.5 text-red" /> Crop Round Circle (500×500)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Bio</label>
                <textarea name="bio" defaultValue={editingMember.bio || ""} rows={3} className="w-full border-gray-200 rounded-lg text-sm" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Email</label>
                  <input name="email" type="email" defaultValue={editingMember.email || ""} className="w-full border-gray-200 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">LinkedIn URL</label>
                  <input name="linkedin" type="url" defaultValue={editingMember.linkedin || ""} className="w-full border-gray-200 rounded-lg text-sm" />
                </div>
              </div>
              
              <label className="flex items-center gap-2 pt-2 cursor-pointer">
                <input type="checkbox" name="is_published" defaultChecked={editingMember.is_published} className="rounded border-gray-300 text-navy focus:ring-navy" />
                <span className="text-sm font-medium">Published / Visible</span>
              </label>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setEditingMember(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-navy transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="bg-navy text-white px-5 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors disabled:opacity-50">
                  {isPending ? "Saving..." : "Save Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy/20 backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-y-auto border border-gray-100 p-6">
            <h2 className="font-oswald text-xl uppercase font-bold text-navy mb-4">
              {editingCategory.slug ? "Edit Category" : "Add Category"}
            </h2>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Category Name</label>
                <input name="name" defaultValue={editingCategory.name} required placeholder="e.g. Robotics & Hardware" className="w-full border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Display Label</label>
                <input name="label" defaultValue={editingCategory.label} required placeholder="e.g. HARDWARE LAB" className="w-full border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Slug</label>
                <input name="slug" defaultValue={editingCategory.slug} placeholder="e.g. hardware (auto-generated if empty)" className="w-full border-gray-200 rounded-lg text-sm font-mono text-xs" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Tagline</label>
                <input name="tagline" defaultValue={editingCategory.tagline || ""} placeholder="e.g. Embedded systems & IoT" className="w-full border-gray-200 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Description (Text Below Tagline)</label>
                <textarea
                  name="description"
                  defaultValue={editingCategory.description || ""}
                  rows={3}
                  placeholder="Detailed description text shown on the website under the tagline..."
                  className="w-full border-gray-200 rounded-lg text-sm"
                />
              </div>
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-navy transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={isPending} className="bg-navy text-white px-5 py-2.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors disabled:opacity-50">
                  {isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Theme Modals for Prompts & Confirmations */}
      <ConfirmModal isOpen={Boolean(confirmConfig)} config={confirmConfig} />
      <PromptModal isOpen={Boolean(promptConfig)} config={promptConfig} />

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setIsMediaPickerOpen(false)}
        onSelect={(url) => setEditingMember((prev) => (prev ? { ...prev, photo_url: url } : null))}
      />

      <ImageCropperModal
        isOpen={isCropperOpen}
        imageSrc={cropperSrc}
        initialShape="circle"
        initialResolution="500x500"
        onClose={() => {
          setIsCropperOpen(false);
          setCropperSrc(null);
        }}
        onCropComplete={async (croppedFile, croppedUrl) => {
          toast("Uploading circular member photo...");
          await startUpload([croppedFile]);
          setEditingMember((prev) => (prev ? { ...prev, photo_url: croppedUrl } : null));
        }}
      />

      {/* Floating Save Action Bar */}
      {activeTab === "members" && (
        <div className="fixed bottom-6 right-6 z-40 bg-navy text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4 backdrop-blur-md">
          <div className="text-xs">
            <span className="font-oswald uppercase font-bold text-white block leading-none">Execom ({viewedTerm})</span>
            <span className="text-[10px] text-gray-300 font-mono mt-0.5 block">{members.length} members loaded</span>
          </div>

          <button
            type="button"
            onClick={handleQuickSaveExecom}
            disabled={isPending}
            className="bg-red hover:bg-white hover:text-navy text-white px-4 py-2 rounded-xl font-oswald uppercase tracking-widest text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save / Update Execom"}
          </button>
        </div>
      )}
    </div>
  );
}
