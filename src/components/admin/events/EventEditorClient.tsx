"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Calendar, MapPin, User, IndianRupee, Layers, Tag, Image as ImageIcon } from "lucide-react";
import { saveEvent } from "@/lib/admin/event-actions";
import { toast } from "@/components/ui/Toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { EventCategoryItem } from "@/lib/admin/event-actions";

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
};

export function EventEditorClient({
  initialData,
  categories = [],
  terms = ["2025-26", "2026-27", "2024-25"],
}: {
  initialData?: EventInitialData;
  categories?: EventCategoryItem[];
  terms?: string[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isEditing = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [autoSlug, setAutoSlug] = useState(!isEditing || !initialData?.slug);

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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

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
            <p className="text-xs text-gray-500">Configure event details, academic term, custom category, and cover image.</p>
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
        {/* Left Column (2 Cols) - Main Information */}
        <div className="lg:col-span-2 space-y-6">
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

        {/* Right Column (1 Col) - Cover Image, Term, Category & Status */}
        <div className="space-y-6">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

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

          {/* Cover Image Uploader with Media Picker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red" /> Cover Image
            </h2>

            <ImageUploader name="cover_image_url" initial={initialData?.cover_image_url || ""} />
          </div>

          {/* Publication Status */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2">
              Visibility & Publishing
            </h2>

            <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
              <input
                type="checkbox"
                name="is_published"
                defaultChecked={initialData?.is_published ?? true}
                className="w-4 h-4 accent-red rounded cursor-pointer"
              />
              <div>
                <div className="text-xs font-bold text-navy">Publish Event</div>
                <div className="text-[10px] text-gray-400">Make event visible on public site</div>
              </div>
            </label>
          </div>
        </div>
      </form>
    </div>
  );
}
