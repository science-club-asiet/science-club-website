"use client";

import { useState, useTransition } from "react";
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
import { GripVertical, Plus, Trash2, Edit2, CheckCircle2 } from "lucide-react";
import { duplicateTerm, publishTerm, reorderExecomMembers, saveExecomMember, deleteExecomMember } from "@/lib/admin/execom-actions";

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

const TEAMS = [
  { id: "core", label: "Core Leadership" },
  { id: "tech", label: "Technical Labs" },
  { id: "media", label: "Media & Creative" },
  { id: "events", label: "Operations & Events" },
];

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
  onEdit 
}: { 
  title: string; 
  members: Member[]; 
  onAdd: () => void; 
  onEdit: (m: Member) => void 
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-oswald text-xl uppercase font-bold text-navy">{title}</h2>
        <button onClick={onAdd} className="text-xs font-bold uppercase tracking-widest text-navy/60 hover:text-red flex items-center gap-1">
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
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
}: {
  activeTerm: string;
  viewedTerm: string;
  initialMembers: Member[];
}) {
  const router = useRouter();
  const [members, setMembers] = useState(initialMembers);
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [editingMember, setEditingMember] = useState<Member | Partial<Member> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

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
      
      // We only allow dragging within the same group for now because the items are
      // rendered strictly inside their respective SortableContexts, but let's make sure
      const activeItem = items[oldIndex];
      const overItem = items[newIndex];
      
      if (activeItem.team_slug !== overItem.team_slug || activeItem.role_type !== overItem.role_type) {
        return items; // Cross-group drag not supported via this simple UI yet
      }

      const newItems = arrayMove(items, oldIndex, newIndex);
      
      // Calculate order updates for this specific group
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

  async function handleDuplicate() {
    const newTerm = window.prompt(`Enter new term (e.g. 2026-27):`, viewedTerm);
    if (!newTerm || newTerm === viewedTerm) return;
    
    setIsDuplicating(true);
    try {
      await duplicateTerm(viewedTerm, newTerm);
      router.push(`/admin/execom?term=${newTerm}`);
    } catch (e: unknown) {
      alert("Failed to duplicate: " + (e as Error).message);
    }
    setIsDuplicating(false);
  }

  async function handlePublish() {
    if (!confirm(`Are you sure you want to publish the ${viewedTerm} committee?\nThis will make it live on the website.`)) return;
    setIsPublishing(true);
    try {
      await publishTerm(viewedTerm);
      // reload to get updated activeTerm
      router.refresh();
    } catch (e: unknown) {
      alert("Failed to publish: " + (e as Error).message);
    }
    setIsPublishing(false);
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
        // refresh data
        router.refresh();
      }
    });
  }

  async function handleDelete() {
    if (!editingMember || !editingMember.id) return;
    if (!confirm("Are you sure you want to remove this member?")) return;
    setIsDeleting(true);
    try {
      await deleteExecomMember((editingMember as Member).id);
      setEditingMember(null);
      router.refresh();
    } catch (e: unknown) {
      alert((e as Error).message);
    }
    setIsDeleting(false);
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase flex items-center gap-3">
            Committee Workspace
            {activeTerm === viewedTerm && (
              <span className="text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-md border bg-green-50 text-green-700 border-green-200">
                LIVE
              </span>
            )}
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage members and terms.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {activeTerm !== viewedTerm ? (
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="bg-navy text-white px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" /> Publish Committee
            </button>
          ) : (
            <button
              onClick={handleDuplicate}
              disabled={isDuplicating}
              className="bg-white border border-gray-200 text-navy px-4 py-2 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Start New Committee
            </button>
          )}
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8">
          <div className="space-y-2">
            <MemberGroup 
              title="Faculty Advisors" 
              members={facultyAdvisors}
              onAdd={() => setEditingMember({ role_type: "faculty_advisor", team_slug: "core", is_published: true })}
              onEdit={setEditingMember}
            />
            <MemberGroup 
              title="Core Leadership" 
              members={studentMembers.filter(m => m.team_slug === "core")}
              onAdd={() => setEditingMember({ role_type: "student", team_slug: "core", is_published: true })}
              onEdit={setEditingMember}
            />
          </div>
          <div className="space-y-2">
            {TEAMS.filter(t => t.id !== "core").map(team => (
              <MemberGroup 
                key={team.id}
                title={team.label}
                members={studentMembers.filter(m => m.team_slug === team.id)}
                onAdd={() => setEditingMember({ role_type: "student", team_slug: team.id, is_published: true })}
                onEdit={setEditingMember}
              />
            ))}
          </div>
        </div>
      </DndContext>

      {/* Edit Modal */}
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
                  <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Team</label>
                  <select name="team_slug" defaultValue={editingMember.team_slug} className="w-full border-gray-200 rounded-lg text-sm">
                    {TEAMS.map(t => (
                      <option key={t.id} value={t.id}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-navy/60 mb-1">Photo URL</label>
                <input name="photo_url" defaultValue={editingMember.photo_url || ""} className="w-full border-gray-200 rounded-lg text-sm font-mono text-xs" />
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
    </div>
  );
}
