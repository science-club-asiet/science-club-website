"use client";

import { useState, useTransition } from "react";
import { saveSiteContent } from "@/lib/admin/settings-actions";
import { toast } from "@/components/ui/Toast";
import { Save, Image as ImageIcon, Globe, Mail, MapPin, Share2 } from "lucide-react";
import { MediaPickerModal } from "@/components/admin/media/MediaPickerModal";

export function SettingsGeneral({ settings }: { settings: Record<string, unknown> }) {
  const [isPending, startTransition] = useTransition();

  const [siteLogo, setSiteLogo] = useState<string>(
    typeof settings["site_logo"] === "string"
      ? settings["site_logo"]
      : (settings["site_logo"] as { value?: string })?.value || ""
  );
  const [siteFavicon, setSiteFavicon] = useState<string>(
    typeof settings["site_favicon"] === "string"
      ? settings["site_favicon"]
      : (settings["site_favicon"] as { value?: string })?.value || ""
  );

  const [activeMediaTarget, setActiveMediaTarget] = useState<"logo" | "favicon" | null>(null);

  const initialTitle = typeof settings["hero_title"] === "string" ? settings["hero_title"] : (settings["hero_title"] as { value?: string })?.value || "";
  const initialSubtitle = typeof settings["hero_subtitle"] === "string" ? settings["hero_subtitle"] : (settings["hero_subtitle"] as { value?: string })?.value || "";
  const initialContact = typeof settings["contact_email"] === "string" ? settings["contact_email"] : (settings["contact_email"] as { value?: string })?.value || "";
  const initialLocation = typeof settings["location_address"] === "string" ? settings["location_address"] : (settings["location_address"] as { value?: string })?.value || "";
  
  const initialInstagram = typeof settings["social_instagram"] === "string" ? settings["social_instagram"] : (settings["social_instagram"] as { value?: string })?.value || "";
  const initialLinkedin = typeof settings["social_linkedin"] === "string" ? settings["social_linkedin"] : (settings["social_linkedin"] as { value?: string })?.value || "";
  const initialGithub = typeof settings["social_github"] === "string" ? settings["social_github"] : (settings["social_github"] as { value?: string })?.value || "";

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        await saveSiteContent({
          hero_title: fd.get("hero_title"),
          hero_subtitle: fd.get("hero_subtitle"),
          contact_email: fd.get("contact_email"),
          location_address: fd.get("location_address"),
          site_logo: siteLogo,
          site_favicon: siteFavicon,
          social_instagram: fd.get("social_instagram"),
          social_linkedin: fd.get("social_linkedin"),
          social_github: fd.get("social_github"),
        });
        toast("General settings saved successfully", "success");
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  }

  return (
    <div className="max-w-3xl space-y-6 font-inter">
      <div>
        <h2 className="font-oswald text-2xl font-bold uppercase text-navy">General Settings</h2>
        <p className="text-xs text-gray-500 mt-1">Manage core branding, site titles, contact information, and social links.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding & Assets */}
        <div className="bg-gray-50/60 border border-gray-200/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
            <Globe className="w-4 h-4 text-red" /> Brand Assets & Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1.5">Site Logo</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {siteLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={siteLogo} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMediaTarget("logo")}
                  className="bg-navy text-white text-xs font-oswald uppercase tracking-widest font-bold px-3.5 py-2 rounded-lg hover:bg-red transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Select Logo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1.5">Favicon / Icon</label>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                  {siteFavicon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={siteFavicon} alt="Favicon" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Globe className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setActiveMediaTarget("favicon")}
                  className="bg-navy text-white text-xs font-oswald uppercase tracking-widest font-bold px-3.5 py-2 rounded-lg hover:bg-red transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Select Favicon
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero & Headlines */}
        <div className="bg-gray-50/60 border border-gray-200/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
            <Globe className="w-4 h-4 text-red" /> Headlines & Copy
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Hero Title</label>
              <input
                name="hero_title"
                defaultValue={initialTitle}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 focus:outline-none focus:border-red"
                placeholder="e.g. ASIET Science Club"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Hero Subtitle / Tagline</label>
              <input
                name="hero_subtitle"
                defaultValue={initialSubtitle}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 focus:outline-none focus:border-red"
                placeholder="e.g. Fostering Innovation & Research"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-gray-50/60 border border-gray-200/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
            <Mail className="w-4 h-4 text-red" /> Contact & Location
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Official Contact Email</label>
              <input
                name="contact_email"
                type="email"
                defaultValue={initialContact}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 focus:outline-none focus:border-red"
                placeholder="scienceclub@asiet.ac.in"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-navy/70 mb-1">Campus Location</label>
              <input
                name="location_address"
                defaultValue={initialLocation}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2.5 px-3 focus:outline-none focus:border-red"
                placeholder="ASIET Campus, Kalady"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-gray-50/60 border border-gray-200/80 rounded-2xl p-5 space-y-4">
          <h3 className="font-oswald text-sm uppercase font-bold text-navy flex items-center gap-2">
            <Share2 className="w-4 h-4 text-red" /> Social Media Links
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy/70 mb-1">Instagram URL</label>
              <input
                name="social_instagram"
                type="url"
                defaultValue={initialInstagram}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2 px-3 focus:outline-none focus:border-red"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy/70 mb-1">LinkedIn URL</label>
              <input
                name="social_linkedin"
                type="url"
                defaultValue={initialLinkedin}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2 px-3 focus:outline-none focus:border-red"
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-navy/70 mb-1">GitHub URL</label>
              <input
                name="social_github"
                type="url"
                defaultValue={initialGithub}
                className="w-full border-gray-200 rounded-xl text-xs bg-white py-2 px-3 focus:outline-none focus:border-red"
                placeholder="https://github.com/..."
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="bg-navy hover:bg-red text-white px-6 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isPending ? "Saving Settings..." : "Save Settings"}
          </button>
        </div>
      </form>

      {/* Media Selector Modal for Brand Assets */}
      <MediaPickerModal
        isOpen={activeMediaTarget !== null}
        onClose={() => setActiveMediaTarget(null)}
        onSelect={(url) => {
          if (activeMediaTarget === "logo") setSiteLogo(url);
          if (activeMediaTarget === "favicon") setSiteFavicon(url);
        }}
      />
    </div>
  );
}
