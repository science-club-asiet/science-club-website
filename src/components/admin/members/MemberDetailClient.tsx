"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, User, Calendar, Award, Shield, Check, X, Download } from "lucide-react";
import { updateProfile, updateTags, setRole, setMembership } from "@/lib/admin/actions";
import { cn } from "@/lib/utils";

export type DetailProfile = { id: string; full_name: string | null; email: string; department: string | null; year_of_study: string | null; role: string; is_member: boolean; tags: string[] | null };
export type Registration = {
  id: string;
  attended: boolean;
  price_paid: number;
  certificate_id: string | null;
  registered_at: string;
  events: {
    id: string;
    title: string;
    event_date: string | null;
  } | null;
};

export default function MemberDetailClient({ profile, registrations, isOwner }: { profile: DetailProfile, registrations: Registration[], isOwner: boolean }) {
  const [tab, setTab] = useState<"profile" | "participation" | "certificates" | "controls">("profile");
  
  // Tag editor state
  const [tags, setTags] = useState<string[]>(profile.tags || []);
  const [newTag, setNewTag] = useState("");
  const [isSavingTags, setIsSavingTags] = useState(false);

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim() || tags.includes(newTag.trim())) return;
    const updated = [...tags, newTag.trim()];
    setTags(updated);
    setNewTag("");
    setIsSavingTags(true);
    await updateTags(profile.id, updated);
    setIsSavingTags(false);
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    setIsSavingTags(true);
    await updateTags(profile.id, updated);
    setIsSavingTags(false);
  };

  const downloadCertificates = () => {
    const attended = registrations.filter(r => r.attended && r.certificate_id);
    const header = ["Event Title", "Date", "Certificate ID"];
    const rows = attended.map(r => [
      `"${r.events?.title || "Unknown Event"}"`,
      `"${r.events?.event_date ? new Date(r.events.event_date).toLocaleDateString() : "—"}"`,
      `"${r.certificate_id}"`
    ]);
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `certificates_${profile.full_name || profile.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/members" className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-oswald text-3xl font-bold uppercase">{profile.full_name || "Unknown Member"}</h1>
          <p className="text-gray-500 text-sm">{profile.email}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6 overflow-x-auto">
        <button onClick={() => setTab("profile")} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === "profile" ? "border-navy text-navy" : "border-transparent text-gray-500 hover:text-gray-900")}>
          <span className="flex items-center gap-2"><User className="w-4 h-4" /> Profile & Tags</span>
        </button>
        <button onClick={() => setTab("participation")} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === "participation" ? "border-navy text-navy" : "border-transparent text-gray-500 hover:text-gray-900")}>
          <span className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Participation</span>
        </button>
        <button onClick={() => setTab("certificates")} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === "certificates" ? "border-navy text-navy" : "border-transparent text-gray-500 hover:text-gray-900")}>
          <span className="flex items-center gap-2"><Award className="w-4 h-4" /> Certificates</span>
        </button>
        <button onClick={() => setTab("controls")} className={cn("pb-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap", tab === "controls" ? "border-navy text-navy" : "border-transparent text-gray-500 hover:text-gray-900")}>
          <span className="flex items-center gap-2"><Shield className="w-4 h-4" /> Controls</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        
        {tab === "profile" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Form */}
            <form action={async (fd) => { await updateProfile(profile.id, fd); }} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Full Name</label>
                <input name="full_name" defaultValue={profile.full_name || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Department</label>
                <input name="department" defaultValue={profile.department || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Year of Study</label>
                <input name="year_of_study" defaultValue={profile.year_of_study || ""} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy" />
              </div>
              <button className="bg-navy text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy/90 transition-colors">Save Profile</button>
            </form>

            {/* Tags */}
            <div className="border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Tags</label>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {tags.length === 0 && <span className="text-sm text-gray-400">No tags yet.</span>}
                {tags.map(tag => (
                  <span key={tag} className="inline-flex items-center gap-1 text-xs uppercase tracking-wider bg-navy/5 text-navy px-2 py-1 rounded">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-red transition-colors" disabled={isSavingTags}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>

              <form onSubmit={handleAddTag} className="flex gap-2">
                <input 
                  type="text" 
                  value={newTag} 
                  onChange={e => setNewTag(e.target.value)}
                  placeholder="Add a tag..." 
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-navy"
                  disabled={isSavingTags}
                />
                <button type="submit" disabled={!newTag.trim() || isSavingTags} className="bg-gray-100 text-gray-600 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50">Add</button>
              </form>
            </div>
          </div>
        )}

        {tab === "participation" && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg mb-4">Event Registrations ({registrations.length})</h3>
            {registrations.length === 0 ? (
              <p className="text-gray-500 text-sm">This member has not registered for any events.</p>
            ) : (
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 font-medium">Event</th>
                      <th className="px-4 py-3 font-medium">Date Registered</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Price Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {registrations.map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-3">
                          <p className="font-medium">{r.events?.title || "Unknown Event"}</p>
                          <p className="text-xs text-gray-500">
                            {r.events?.event_date ? new Date(r.events.event_date).toLocaleDateString() : "—"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {r.registered_at ? new Date(r.registered_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          {r.attended ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                              <Check className="w-3 h-3" /> Attended
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                              Registered
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">₹{r.price_paid}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "certificates" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-lg">Certificates Earned</h3>
              <button onClick={downloadCertificates} className="flex items-center gap-2 text-sm bg-navy text-white px-4 py-2 rounded-lg font-medium hover:bg-navy/90 transition-colors">
                <Download className="w-4 h-4" /> Download CSV
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {registrations.filter(r => r.attended && r.certificate_id).length === 0 ? (
                <p className="text-gray-500 text-sm col-span-2">No certificates earned yet.</p>
              ) : (
                registrations.filter(r => r.attended && r.certificate_id).map(r => (
                  <div key={r.id} className="border border-gray-200 rounded-xl p-4 flex flex-col gap-2 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 text-gray-100 group-hover:text-gold/20 transition-colors -z-10">
                      <Award className="w-16 h-16" />
                    </div>
                    <p className="font-medium pr-12">{r.events?.title}</p>
                    <p className="text-xs text-gray-500">ID: {r.certificate_id}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {tab === "controls" && (
          <div className="space-y-8 max-w-md">
            <div>
              <h3 className="font-medium mb-4">Membership Status</h3>
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                <div>
                  <p className="font-medium">{profile.is_member ? "Active Member" : "Not a Member"}</p>
                  <p className="text-xs text-gray-500">Grants access to member-only resources.</p>
                </div>
                <form action={setMembership.bind(null, profile.id, !profile.is_member)}>
                  <button className={cn("text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg transition-colors border", profile.is_member ? "border-red text-red hover:bg-red hover:text-white" : "border-navy text-navy hover:bg-navy hover:text-white")}>
                    {profile.is_member ? "Revoke" : "Grant"}
                  </button>
                </form>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">System Role</h3>
              {!isOwner ? (
                <div className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl text-sm text-yellow-800">
                  Only the owner can modify system roles. Current role is <span className="font-bold uppercase tracking-widest text-[10px] bg-yellow-200 px-1 py-0.5 rounded ml-1">{profile.role}</span>.
                </div>
              ) : (
                <form action={setRole.bind(null, profile.id)} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50/50">
                  <div>
                    <p className="font-medium">Assign Role</p>
                    <p className="text-xs text-gray-500">Careful, admins can modify data.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select name="role" defaultValue={profile.role} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm bg-white">
                      {["member", "execom", "admin", "owner"].map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                    <button className="text-xs font-bold uppercase tracking-widest bg-navy text-white px-3 py-1.5 rounded-lg hover:bg-navy/90 transition-colors">Set</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
