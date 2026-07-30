"use client";

import { useTransition } from "react";
import { saveSiteContent } from "@/lib/admin/settings-actions";
import { toast } from "@/components/ui/Toast";
import { Save } from "lucide-react";

export function SettingsGeneral({ settings }: { settings: Record<string, unknown> }) {
  const [isPending, startTransition] = useTransition();

  // Extract initial values. The DB stores them in a JSON `{ value: "..." }` or `{ term: "..." }` format 
  // depending on the key. We'll simplify this.
  const initialTitle = (settings["hero_title"] as { value?: string })?.value || "";
  const initialSubtitle = (settings["hero_subtitle"] as { value?: string })?.value || "";
  const initialContact = (settings["contact_email"] as { value?: string })?.value || "";

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await saveSiteContent({
          "hero_title": fd.get("hero_title"),
          "hero_subtitle": fd.get("hero_subtitle"),
          "contact_email": fd.get("contact_email"),
        });
        toast("General settings saved", "success");
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h2 className="font-oswald text-2xl font-bold uppercase text-navy">General Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Manage global site content and branding.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-navy/50 border-b border-gray-100 pb-2">Hero Section</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Hero Title</label>
            <input 
              name="hero_title" 
              defaultValue={initialTitle}
              className="w-full border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white" 
              placeholder="e.g. Science Club"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Hero Subtitle</label>
            <input 
              name="hero_subtitle" 
              defaultValue={initialSubtitle}
              className="w-full border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white" 
              placeholder="e.g. Innovate. Discover. Build."
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-widest text-navy/50 border-b border-gray-100 pb-2 pt-4">Contact</h3>
          <div>
            <label className="block text-sm font-medium mb-1">Contact Email</label>
            <input 
              type="email"
              name="contact_email" 
              defaultValue={initialContact}
              className="w-full border-gray-200 rounded-lg text-sm bg-gray-50/50 focus:bg-white" 
              placeholder="e.g. hello@scienceclub.edu"
            />
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <button 
            type="submit" 
            disabled={isPending}
            className="bg-navy text-white px-6 py-2.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-red transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
