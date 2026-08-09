"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Calendar,
  IndianRupee,
  Layers,
  Image as ImageIcon,
  Plus,
  Trash2,
  MoveLeft,
  MoveRight,
  MoveUp,
  MoveDown,
  Grid,
  List,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck
} from "lucide-react";
import { saveEvent } from "@/lib/admin/event-actions";
import { toast } from "@/components/ui/Toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";
import type { EventCategoryItem } from "@/lib/admin/event-actions";

export type FormItem = {
  id: string;
  title: string;
  slug?: string | null;
  is_active?: boolean;
};

export type EventInitialData = {
  id?: string;
  title?: string;
  slug?: string;
  term?: string;
  category?: string;
  description?: string;
  event_date?: string | null;
  location?: string;
  speaker?: string;
  speaker_role?: string;
  member_price?: number;
  non_member_price?: number;
  seats_remaining?: number | null;
  cover_image_url?: string;
  is_published?: boolean;
  status?: string;
  gallery_images?: string[];
  registration_form_id?: string | null;
};

export function EventEditorClient({
  initialData,
  categories = [],
  terms = ["2025-26", "2026-27", "2024-25"],
  forms = [],
}: {
  initialData?: EventInitialData;
  categories?: EventCategoryItem[];
  terms?: string[];
  forms?: FormItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEditing || !initialData?.slug);

  // Status state ('open' | 'closed' | 'finished' | 'draft')
  const [status, setStatus] = useState<string>(
    initialData?.status || (initialData?.is_published === false ? "draft" : "open")
  );

  // Linked Form state
  const [selectedFormId, setSelectedFormId] = useState<string>(
    initialData?.registration_form_id || ""
  );

  // Reorderable Gallery state & view mode
  const [galleryImages, setGalleryImages] = useState<string[]>(
    initialData?.gallery_images || []
  );
  const [galleryViewMode, setGalleryViewMode] = useState<"card" | "list">("card");
  const [isGalleryPickerOpen, setIsGalleryPickerOpen] = useState(false);

  function slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (autoSlug) {
      setSlug(slugify(val));
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= galleryImages.length) return;
    const copy = [...galleryImages];
    const [moved] = copy.splice(index, 1);
    copy.splice(newIdx, 0, moved);
    setGalleryImages(copy);
  };

  const removeImage = (index: number) => {
    setGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("status", status);
    fd.set("registration_form_id", selectedFormId);
    fd.set("gallery_images_json", JSON.stringify(galleryImages));

    startTransition(async () => {
      try {
        await saveEvent(fd);
        toast(`Event ${isEditing ? "updated" : "created"} successfully`, "success");
        router.push("/admin/events");
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  };

  const statusOptions = [
    { key: "open", label: "Open", desc: "Open for registration", color: "bg-green-100 text-green-700 border-green-300", icon: CheckCircle2 },
    { key: "closed", label: "Closed", desc: "Registration is closed", color: "bg-red/10 text-red border-red/30", icon: XCircle },
    { key: "finished", label: "Finished", desc: "Event is completed", color: "bg-navy/10 text-navy border-navy/30", icon: Clock },
    { key: "draft", label: "Draft", desc: "Hidden / Draft mode", color: "bg-amber-100 text-amber-800 border-amber-300", icon: FileText },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 font-inter pb-12">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/events"
            className="p-2 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-oswald text-2xl font-bold uppercase text-navy">
              {isEditing ? `Edit Event: ${initialData?.title}` : "Create New Event"}
            </h1>
            <p className="text-xs text-gray-500">Configure event details, operational status, linked registration form, and reorderable gallery.</p>
          </div>
        </div>

        <button
          type="submit"
          form="event-form"
          disabled={isPending}
          className="bg-navy hover:bg-red text-white px-6 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-red" />
          {isPending ? "Saving Event..." : isEditing ? "Update Event" : "Create Event"}
        </button>
      </div>

      <form id="event-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hidden inputs for status, form, and gallery */}
        <input type="hidden" name="status" value={status} />
        <input type="hidden" name="registration_form_id" value={selectedFormId} />
        <input type="hidden" name="gallery_images_json" value={JSON.stringify(galleryImages)} />
        {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

        {/* Left Column (2 Cols) - Main Information & Gallery */}
        <div className="lg:col-span-2 space-y-6">
          {/* Identity & Overview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2">
              Event Identity & Overview
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Event Title *</label>
              <input
                name="title"
                value={title}
                onChange={handleTitleChange}
                required
                className="w-full border-gray-200 rounded-xl text-sm font-bold bg-white py-2.5 px-3 text-navy focus:outline-none focus:border-red"
                placeholder="e.g. AI & Robotics Summit 2026"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70">Slug Identifier</label>
                <label className="flex items-center gap-1.5 text-xs text-navy/70 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoSlug}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setAutoSlug(checked);
                      if (checked) setSlug(slugify(title));
                    }}
                    className="w-3.5 h-3.5 accent-red rounded cursor-pointer"
                  />
                  Auto-generate slug from title
                </label>
              </div>
              <input
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  if (autoSlug) setAutoSlug(false);
                }}
                className="w-full border-gray-200 rounded-xl text-xs font-mono bg-white py-2 px-3 text-navy focus:outline-none focus:border-red"
                placeholder="auto-generated from title"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Description</label>
              <textarea
                name="description"
                defaultValue={initialData?.description || ""}
                rows={5}
                className="w-full border-gray-200 rounded-xl text-xs bg-white p-3 text-navy focus:outline-none focus:border-red"
                placeholder="Detailed event overview, agenda points, requirements..."
              />
            </div>
          </div>

          {/* Reorderable Event Gallery Section */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h2 className="font-oswald text-sm font-bold uppercase text-navy flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red" /> Event Gallery ({galleryImages.length} Photos)
                </h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Upload photos, reorder thumbnails, and toggle card/list views.</p>
              </div>

              <div className="flex items-center gap-2">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode("card")}
                    className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                      galleryViewMode === "card" ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
                    }`}
                    title="Card / Grid View"
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setGalleryViewMode("list")}
                    className={`p-1.5 rounded-md text-xs font-bold transition-all ${
                      galleryViewMode === "list" ? "bg-white text-navy shadow-sm" : "text-gray-400 hover:text-navy"
                    }`}
                    title="List View"
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setIsGalleryPickerOpen(true)}
                  className="bg-navy hover:bg-red text-white text-xs font-oswald uppercase tracking-widest font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Photos
                </button>
              </div>
            </div>

            {galleryImages.length === 0 ? (
              <div
                onClick={() => setIsGalleryPickerOpen(true)}
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-red hover:bg-gray-50/50 transition-all"
              >
                <ImageIcon className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                <p className="text-xs font-medium text-navy/70">No gallery photos added yet</p>
                <p className="text-[10px] text-gray-400 mt-1">Click to select photos from the Media Library</p>
              </div>
            ) : galleryViewMode === "card" ? (
              /* CARD / GRID VIEW */
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {galleryImages.map((imgUrl, i) => (
                  <div key={i} className="group relative bg-gray-50 border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-navy transition-all">
                    <div className="aspect-video relative overflow-hidden bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={`Gallery photo ${i + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-navy/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                        #{i + 1}
                      </div>
                    </div>

                    {/* Action overlay / Controls */}
                    <div className="p-2 bg-white border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveImage(i, -1)}
                          disabled={i === 0}
                          className="p-1 text-gray-400 hover:text-navy disabled:opacity-30 rounded hover:bg-gray-100"
                          title="Move Left"
                        >
                          <MoveLeft className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(i, 1)}
                          disabled={i === galleryImages.length - 1}
                          className="p-1 text-gray-400 hover:text-navy disabled:opacity-30 rounded hover:bg-gray-100"
                          title="Move Right"
                        >
                          <MoveRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1 text-red/70 hover:text-red hover:bg-red/10 rounded transition-colors"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* LIST VIEW */
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white">
                {galleryImages.map((imgUrl, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <span className="text-xs font-mono font-bold text-gray-400 w-6">#{i + 1}</span>
                    <div className="w-12 h-9 rounded bg-gray-100 overflow-hidden shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imgUrl} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs font-mono text-navy truncate flex-1">{imgUrl}</span>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => moveImage(i, -1)}
                        disabled={i === 0}
                        className="p-1 text-gray-400 hover:text-navy disabled:opacity-30 rounded hover:bg-gray-100"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(i, 1)}
                        disabled={i === galleryImages.length - 1}
                        className="p-1 text-gray-400 hover:text-navy disabled:opacity-30 rounded hover:bg-gray-100"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="p-1 text-red/70 hover:text-red hover:bg-red/10 rounded transition-colors ml-2"
                        title="Remove Photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date, Location & Speaker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-red" /> Logistics & Keynote Speaker
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Date & Time</label>
                <input
                  name="event_date"
                  type="datetime-local"
                  defaultValue={initialData?.event_date ? new Date(initialData.event_date).toISOString().slice(0, 16) : ""}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy focus:outline-none focus:border-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Location / Venue</label>
                <input
                  name="location"
                  defaultValue={initialData?.location || ""}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy focus:outline-none focus:border-red"
                  placeholder="e.g. Main Auditorium / Lab 3"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Speaker Name</label>
                <input
                  name="speaker"
                  defaultValue={initialData?.speaker || ""}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy focus:outline-none focus:border-red"
                  placeholder="e.g. Dr. Jane Doe"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Speaker Designation</label>
                <input
                  name="speaker_role"
                  defaultValue={initialData?.speaker_role || ""}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy focus:outline-none focus:border-red"
                  placeholder="e.g. Principal AI Researcher"
                />
              </div>
            </div>
          </div>

          {/* Pricing & Seats */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-red" /> Registration Pricing & Capacity
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Member Price (₹)</label>
                <input
                  name="member_price"
                  type="number"
                  step="0.01"
                  defaultValue={initialData?.member_price ?? 0}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-mono focus:outline-none focus:border-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Non-Member Price (₹)</label>
                <input
                  name="non_member_price"
                  type="number"
                  step="0.01"
                  defaultValue={initialData?.non_member_price ?? 0}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-mono focus:outline-none focus:border-red"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Seats Capacity</label>
                <input
                  name="seats_remaining"
                  type="number"
                  defaultValue={initialData?.seats_remaining ?? ""}
                  className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-mono focus:outline-none focus:border-red"
                  placeholder="Unlimited if empty"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Status, Linked Form, Cover Image, Term & Category */}
        <div className="space-y-6">
          {/* Operational Status Selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2">
              Event Operational Status
            </h2>

            <div className="grid grid-cols-2 gap-2">
              {statusOptions.map((opt) => {
                const Icon = opt.icon;
                const active = status === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setStatus(opt.key)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      active ? opt.color + " shadow-sm font-bold" : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="text-xs uppercase font-oswald tracking-wide">{opt.label}</span>
                    </div>
                    <p className="text-[10px] opacity-75 mt-0.5 leading-tight">{opt.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Linked Form Selector */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-red" /> Linked Registration Form
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Select Custom Form</label>
              <select
                value={selectedFormId}
                onChange={(e) => setSelectedFormId(e.target.value)}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-medium focus:outline-none focus:border-red"
              >
                <option value="">-- Default Registration (No Custom Form) --</option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title} ({f.is_active !== false ? "Active" : "Inactive"})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400 mt-1.5">
                When linked, clicking &quot;Register&quot; directs applicants to this form. If the form closes, the event status will automatically reflect closed.
              </p>
            </div>
          </div>

          {/* Academic Term & Category */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red" /> Classification
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Academic Term *</label>
              <select
                name="term"
                defaultValue={initialData?.term || "2025-26"}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-mono font-bold focus:outline-none focus:border-red"
              >
                {terms.map((t) => (
                  <option key={t} value={t}>Term {t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Custom Category *</label>
              <select
                name="category"
                defaultValue={initialData?.category || "talk"}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-bold uppercase focus:outline-none focus:border-red"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cover Image Uploader */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red" /> Cover Image
            </h2>

            <ImageUploader name="cover_image_url" initial={initialData?.cover_image_url || ""} />
          </div>
        </div>
      </form>

      {/* Media Picker Modal for Gallery */}
      {isGalleryPickerOpen && (
        <MediaPickerModal
          isOpen={isGalleryPickerOpen}
          onClose={() => setIsGalleryPickerOpen(false)}
          onSelect={(url) => {
            setGalleryImages((prev) => [...prev, url]);
            toast("Photo added to gallery", "success");
          }}
        />
      )}
    </div>
  );
}
