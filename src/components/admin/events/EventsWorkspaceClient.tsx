"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Calendar, Plus, Search, Edit2, Trash2, Tag, Layers, CheckCircle2,
  XCircle, ArrowUpRight, FolderPlus, Sparkles, Filter, LayoutGrid, List
} from "lucide-react";
import { deleteEvent, saveEventCategory, deleteEventCategory, type EventCategoryItem } from "@/lib/admin/event-actions";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal, PromptModal, type ConfirmConfig, type PromptConfig } from "@/components/ui/ModalDialog";
import { cn } from "@/lib/utils";

export type AdminEvent = {
  id: string;
  title: string;
  slug: string;
  term: string;
  category: string;
  event_date: string | null;
  location: string | null;
  speaker: string | null;
  cover_image_url: string | null;
  is_published: boolean;
  member_price: number;
  non_member_price: number;
  created_at: string;
};

export function EventsWorkspaceClient({
  events,
  categories,
  terms = ["2025-26", "2026-27", "2024-25"],
}: {
  events: AdminEvent[];
  categories: EventCategoryItem[];
  terms?: string[];
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"events" | "categories">("events");
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [selectedTerm, setSelectedTerm] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState("");

  const [isPending, startTransition] = useTransition();

  // Modals
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);
  const [catPromptOpen, setCatPromptOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<EventCategoryItem | null>(null);

  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catAutoSlug, setCatAutoSlug] = useState(true);

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  // Filtered Events
  const filteredEvents = events.filter((e) => {
    if (selectedTerm !== "all" && (e.term || "2025-26") !== selectedTerm) return false;
    if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return e.title.toLowerCase().includes(q) || (e.speaker && e.speaker.toLowerCase().includes(q));
    }
    return true;
  });

  const handleDeleteEvent = (id: string, title: string) => {
    setConfirmConfig({
      title: "Delete Event",
      message: `Are you sure you want to delete '${title}'? All event registrations will be removed.`,
      confirmText: "Delete Event",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          try {
            await deleteEvent(id);
            toast(`Event '${title}' deleted`, "success");
            router.refresh();
          } catch (err: unknown) {
            toast((err as Error).message, "error");
          }
        });
      },
    });
  };

  const handleSaveCategorySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const name = (fd.get("name") as string).trim();
    const slug = (fd.get("slug") as string).trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const tagline = (fd.get("tagline") as string).trim();

    if (!name) return;

    startTransition(async () => {
      try {
        await saveEventCategory({
          id: editingCategory?.id,
          name,
          slug,
          tagline,
        });
        toast(`Category '${name}' saved`, "success");
        setCatPromptOpen(false);
        setEditingCategory(null);
        router.refresh();
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  };

  const handleDeleteCat = (cat: EventCategoryItem) => {
    if (!cat.id) return;
    setConfirmConfig({
      title: `Delete Category '${cat.name}'`,
      message: `Are you sure you want to delete category '${cat.name}'? Existing events will retain their slug.`,
      confirmText: "Delete Category",
      isDanger: true,
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          try {
            await deleteEventCategory(cat.id!);
            toast(`Category '${cat.name}' deleted`, "success");
            router.refresh();
          } catch (err: unknown) {
            toast((err as Error).message, "error");
          }
        });
      },
    });
  };

  return (
    <div className="space-y-6 font-inter max-w-7xl mx-auto">
      {/* Top Header & Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase text-navy">Events Workspace</h1>
          <p className="text-xs text-gray-500 mt-1">Manage term-wise science club events, registration rules, and custom event categories.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
            <button
              onClick={() => setActiveTab("events")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer",
                activeTab === "events" ? "bg-navy text-white shadow-sm" : "text-navy/70 hover:bg-gray-200"
              )}
            >
              <Calendar className="w-3.5 h-3.5 inline-block mr-1.5" /> Events List ({events.length})
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer",
                activeTab === "categories" ? "bg-navy text-white shadow-sm" : "text-navy/70 hover:bg-gray-200"
              )}
            >
              <Tag className="w-3.5 h-3.5 inline-block mr-1.5" /> Categories ({categories.length})
            </button>
          </div>

          {activeTab === "events" ? (
            <Link
              href="/admin/events/new"
              className="bg-navy hover:bg-red text-white px-5 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 text-red" /> + New Event
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                setEditingCategory(null);
                setCatName("");
                setCatSlug("");
                setCatAutoSlug(true);
                setCatPromptOpen(true);
              }}
              className="bg-navy hover:bg-red text-white px-5 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <FolderPlus className="w-4 h-4 text-red" /> + New Category
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Body */}
      {activeTab === "events" ? (
        <div className="space-y-4">
          {/* Term Switcher & Category Filter Bar */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-3 shadow-sm">
            {/* Term Tabs */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-navy/50 mr-2 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Term:
              </span>
              <button
                onClick={() => setSelectedTerm("all")}
                className={cn(
                  "px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
                  selectedTerm === "all" ? "bg-navy text-white" : "bg-gray-100 text-navy/70 hover:bg-gray-200"
                )}
              >
                All Terms
              </button>
              {terms.map((t) => (
                <button
                  key={t}
                  onClick={() => setSelectedTerm(t)}
                  className={cn(
                    "px-3 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer",
                    selectedTerm === t ? "bg-navy text-white shadow-sm" : "bg-gray-100 text-navy/70 hover:bg-gray-200"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Category Filter Pills & Search */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy/40 mr-1">Category:</span>
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={cn(
                    "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                    selectedCategory === "all" ? "bg-red text-white font-bold" : "bg-gray-100 text-navy/70 hover:bg-gray-200"
                  )}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c.slug}
                    onClick={() => setSelectedCategory(c.slug)}
                    className={cn(
                      "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                      selectedCategory === c.slug ? "bg-red text-white font-bold" : "bg-gray-100 text-navy/70 hover:bg-gray-200"
                    )}
                  >
                    {c.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => setViewMode("list")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                      viewMode === "list" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
                    )}
                    title="List Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("card")}
                    className={cn(
                      "p-1.5 rounded-lg text-xs transition-colors cursor-pointer",
                      viewMode === "card" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
                    )}
                    title="Card Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>

                <div className="relative w-60 sm:w-64">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search events..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs text-navy focus:outline-none focus:border-red"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Conditional Rendering: List Table vs Card Grid */}
          {viewMode === "card" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredEvents.length === 0 ? (
                <div className="col-span-full bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400 text-xs">
                  No events found matching your criteria.
                </div>
              ) : (
                filteredEvents.map((evt) => (
                  <div key={evt.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                    <div className="aspect-[16/9] relative overflow-hidden bg-gray-100">
                      {evt.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={evt.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-navy/40 font-oswald font-bold uppercase tracking-widest text-lg">
                          Science Event
                        </div>
                      )}

                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="bg-navy/90 backdrop-blur-sm text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-md uppercase shadow-sm">
                          {evt.category}
                        </span>
                        <span className="bg-white/90 backdrop-blur-sm text-navy font-mono text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
                          {evt.term || "2025-26"}
                        </span>
                      </div>

                      <div className="absolute top-3 right-3">
                        <span className={cn(
                          "px-2.5 py-1 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider flex items-center gap-1 shadow-sm",
                          evt.is_published ? "bg-green-500 text-white" : "bg-yellow-400 text-navy font-bold"
                        )}>
                          {evt.is_published ? "Published" : "Draft"}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <Link href={`/admin/events/${evt.id}/edit`} className="font-oswald text-lg font-bold text-navy uppercase hover:text-red transition-colors line-clamp-1">
                          {evt.title}
                        </Link>
                        {evt.speaker && <p className="text-xs text-gray-500 mt-0.5 font-medium truncate">Speaker: {evt.speaker}</p>}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
                        <div>
                          <div className="text-[10px] font-bold text-navy/50 uppercase tracking-wider">Date & Venue</div>
                          <div className="font-semibold text-navy truncate mt-0.5">
                            {evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) : "TBA"}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">{evt.location || "Online"}</div>
                        </div>

                        <div>
                          <div className="text-[10px] font-bold text-navy/50 uppercase tracking-wider">Pricing</div>
                          <div className="font-mono font-bold text-navy mt-0.5">Member: ₹{evt.member_price}</div>
                          <div className="font-mono text-[11px] text-gray-400">Non-Member: ₹{evt.non_member_price}</div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <Link
                          href={`/admin/registrations/${evt.id}`}
                          className="text-xs font-oswald uppercase tracking-wider font-bold text-navy hover:text-red flex items-center gap-1 transition-colors"
                        >
                          Registrations <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>

                        <div className="flex items-center gap-1">
                          <Link
                            href={`/admin/events/${evt.id}/edit`}
                            className="p-1.5 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteEvent(evt.id, evt.title)}
                            className="p-1.5 text-red/60 hover:text-red hover:bg-red/5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            /* Events List Table */
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-navy">
                  <thead className="bg-gray-50 border-b border-gray-100 uppercase tracking-widest text-[10px] font-bold text-navy/60">
                    <tr>
                      <th className="px-5 py-3.5">Event</th>
                      <th className="px-5 py-3.5">Term</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Date & Location</th>
                      <th className="px-5 py-3.5">Pricing</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredEvents.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                          No events found matching your criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredEvents.map((evt) => (
                        <tr key={evt.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                                {evt.cover_image_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={evt.cover_image_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs">EV</div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <Link href={`/admin/events/${evt.id}/edit`} className="font-bold text-navy hover:text-red transition-colors truncate block">
                                  {evt.title}
                                </Link>
                                {evt.speaker && <div className="text-[11px] text-gray-400 truncate">Speaker: {evt.speaker}</div>}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-xs font-bold bg-navy/10 text-navy px-2 py-0.5 rounded-md">
                              {evt.term || "2025-26"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-mono text-[11px] text-gray-600 uppercase font-semibold bg-gray-100 px-2 py-0.5 rounded">
                              {evt.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-navy">
                              {evt.event_date ? new Date(evt.event_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "TBA"}
                            </div>
                            <div className="text-[11px] text-gray-400 truncate">{evt.location || "Online"}</div>
                          </td>
                          <td className="px-5 py-4 font-mono text-[11px]">
                            <div>Member: <span className="font-bold">₹{evt.member_price}</span></div>
                            <div className="text-gray-400">Non-Member: ₹{evt.non_member_price}</div>
                          </td>
                          <td className="px-5 py-4">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-oswald uppercase font-bold tracking-wider flex items-center gap-1 w-fit",
                              evt.is_published ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                            )}>
                              {evt.is_published ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-yellow-600" />}
                              {evt.is_published ? "Published" : "Draft"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/admin/registrations/${evt.id}`}
                                className="p-1.5 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                                title="View Registrations"
                              >
                                <ArrowUpRight className="w-4 h-4" />
                              </Link>
                              <Link
                                href={`/admin/events/${evt.id}/edit`}
                                className="p-1.5 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors"
                                title="Edit Event"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Link>
                              <button
                                type="button"
                                onClick={() => handleDeleteEvent(evt.id, evt.title)}
                                className="p-1.5 text-red/60 hover:text-red hover:bg-red/5 rounded-lg transition-colors cursor-pointer"
                                title="Delete Event"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Categories Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const count = events.filter((e) => e.category === cat.slug).length;
              return (
                <div key={cat.slug} className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 relative group">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold uppercase bg-navy/10 text-navy px-2.5 py-1 rounded-lg">
                      {cat.slug}
                    </span>
                    <span className="text-xs font-mono font-bold bg-red/10 text-red px-2 py-0.5 rounded-full">
                      {count} event(s)
                    </span>
                  </div>

                  <div>
                    <h3 className="font-oswald text-lg font-bold text-navy uppercase">{cat.name}</h3>
                    {cat.tagline && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.tagline}</p>}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCategory(cat);
                        setCatName(cat.name);
                        setCatSlug(cat.slug);
                        setCatAutoSlug(false);
                        setCatPromptOpen(true);
                      }}
                      className="p-1.5 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCat(cat)}
                      className="p-1.5 text-red/60 hover:text-red hover:bg-red/5 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Creation / Editing Modal */}
      {catPromptOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl max-w-md w-full p-6 space-y-4 font-inter">
            <h3 className="font-oswald text-xl font-bold uppercase text-navy">
              {editingCategory ? `Edit Category '${editingCategory.name}'` : "Create Event Category"}
            </h3>

            <form onSubmit={handleSaveCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Category Name</label>
                <input
                  name="name"
                  value={catName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCatName(val);
                    if (catAutoSlug) setCatSlug(slugify(val));
                  }}
                  required
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 text-navy focus:outline-none focus:border-red"
                  placeholder="e.g. Hackathon & Build"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy/70">Slug Identifier</label>
                  <label className="flex items-center gap-1.5 text-[11px] text-navy/70 font-medium cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={catAutoSlug}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setCatAutoSlug(checked);
                        if (checked) setCatSlug(slugify(catName));
                      }}
                      className="w-3 h-3 accent-red rounded cursor-pointer"
                    />
                    Auto-generate
                  </label>
                </div>
                <input
                  name="slug"
                  value={catSlug}
                  onChange={(e) => {
                    setCatSlug(e.target.value);
                    if (catAutoSlug) setCatAutoSlug(false);
                  }}
                  className="w-full text-xs border border-gray-200 rounded-xl px-3 py-2 text-navy font-mono focus:outline-none focus:border-red"
                  placeholder="e.g. hackathon"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Tagline / Description</label>
                <textarea
                  name="tagline"
                  defaultValue={editingCategory?.tagline || ""}
                  rows={2}
                  className="w-full text-xs border border-gray-200 rounded-xl p-2.5 text-navy focus:outline-none focus:border-red"
                  placeholder="Short summary of events in this category..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCatPromptOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-navy/70 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-navy hover:bg-red text-white px-5 py-2 rounded-xl font-oswald text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50"
                >
                  {isPending ? "Saving..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal isOpen={Boolean(confirmConfig)} config={confirmConfig} />
    </div>
  );
}
