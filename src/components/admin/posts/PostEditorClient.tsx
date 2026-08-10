"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Save, ArrowLeft, Layers, Image as ImageIcon, Newspaper, Sparkles, AlertCircle } from "lucide-react";
import { savePost } from "@/lib/admin/post-actions";
import { toast } from "@/components/ui/Toast";
import { ImageUploader } from "@/components/admin/ImageUploader";
import type { PostCategoryItem } from "@/lib/admin/post-actions";

export type PostInitialData = {
  id?: string;
  title?: string;
  slug?: string;
  term?: string;
  type?: string;
  status?: string;
  excerpt?: string;
  body?: string;
  cover_image_url?: string;
  tag?: string;
  is_featured?: boolean;
  breaking?: boolean;
};

export function PostEditorClient({
  initialData,
  categories = [],
  terms = ["2025-26", "2026-27", "2024-25"],
}: {
  initialData?: PostInitialData;
  categories?: PostCategoryItem[];
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
        await savePost(fd);
        toast(`Post ${isEditing ? "updated" : "created"} successfully`, "success");
        router.push("/admin/posts");
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
            href="/admin/posts"
            className="p-2 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-oswald text-2xl font-bold uppercase text-navy">
              {isEditing ? `Edit Post: ${initialData?.title}` : "Create New Post"}
            </h1>
            <p className="text-xs text-gray-500">Write news, tech articles, research papers, or announcements.</p>
          </div>
        </div>

        <button
          type="submit"
          form="post-form"
          disabled={isPending}
          className="bg-navy hover:bg-red text-white px-6 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save className="w-4 h-4 text-red" />
          {isPending ? "Saving Post..." : isEditing ? "Update Post" : "Create Post"}
        </button>
      </div>

      <form id="post-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols) - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <Newspaper className="w-4 h-4 text-red" /> Article Content
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Post Title *</label>
              <input
                name="title"
                value={title}
                onChange={handleTitleChange}
                required
                className="w-full border-gray-200 rounded-xl text-sm font-bold bg-white py-2.5 px-3 text-navy focus:outline-none focus:border-red"
                placeholder="e.g. Breakthrough in Quantum Computing Research"
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
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Excerpt Summary</label>
              <textarea
                name="excerpt"
                defaultValue={initialData?.excerpt || ""}
                rows={2}
                className="w-full border-gray-200 rounded-xl text-xs bg-white p-3 text-navy focus:outline-none focus:border-red"
                placeholder="Brief sentence summarizing this post for cards and RSS previews..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Body Article Copy (Markdown / HTML)</label>
              <textarea
                name="body"
                defaultValue={initialData?.body || ""}
                rows={10}
                className="w-full border-gray-200 rounded-xl text-xs font-mono bg-white p-3 text-navy focus:outline-none focus:border-red"
                placeholder="Write full article body content..."
              />
            </div>
          </div>
        </div>

        {/* Right Column (1 Col) - Cover Image, Term, Category & Status */}
        <div className="space-y-6">
          {initialData?.id && <input type="hidden" name="id" value={initialData.id} />}

          {/* Classification */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-red" /> Classification & Term
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
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Custom Category / Type *</label>
              <select
                name="type"
                defaultValue={initialData?.type || "news"}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 text-navy font-bold uppercase focus:outline-none focus:border-red"
              >
                {categories.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name} ({c.slug})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Custom Badge Tag</label>
              <input
                name="tag"
                defaultValue={initialData?.tag || ""}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2 px-3 text-navy focus:outline-none focus:border-red"
                placeholder="e.g. AI Research"
              />
            </div>
          </div>

          {/* Cover Image Uploader with Media Picker */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-red" /> Cover Image
            </h2>

            <ImageUploader name="cover_image_url" initial={initialData?.cover_image_url || ""} />
          </div>

          {/* Status & Flags */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm">
            <h2 className="font-oswald text-sm font-bold uppercase text-navy border-b border-gray-100 pb-2">
              Status & Highlights
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Publication Status</label>
              <select
                name="status"
                defaultValue={initialData?.status || "draft"}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2 px-3 text-navy font-bold uppercase focus:outline-none focus:border-red"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="space-y-2 pt-2">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="is_featured"
                  defaultChecked={initialData?.is_featured ?? false}
                  className="w-4 h-4 accent-red rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-navy flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-red" /> Featured Post
                  </div>
                  <div className="text-[10px] text-gray-400">Pin to home hero carousel</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="breaking"
                  defaultChecked={initialData?.breaking ?? false}
                  className="w-4 h-4 accent-red rounded cursor-pointer"
                />
                <div>
                  <div className="text-xs font-bold text-navy flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-navy" /> Breaking Banner
                  </div>
                  <div className="text-[10px] text-gray-400">Show in breaking news ticker</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
