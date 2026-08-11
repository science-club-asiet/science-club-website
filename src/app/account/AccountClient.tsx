"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  User, 
  Award, 
  Calendar, 
  Settings, 
  Shield, 
  Copy, 
  Check, 
  Sparkles, 
  Printer, 
  ExternalLink, 
  X, 
  ArrowLeft,
  CheckCircle2,
  Zap
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { upgradeToPaidMembershipAction, type MembershipSettings } from "@/app/account/actions";
import { SignOutButton } from "@/components/admin/SignOutButton";
import { DEPARTMENTS, YEARS, getSemesterFromYear } from "@/lib/constants";

export type ProfileData = {
  id: string;
  full_name: string | null;
  email: string | null;
  department: string | null;
  year_of_study: string | null;
  role: string;
  is_member: boolean;
  member_id: string | null;
  membership_expires_at: string | null;
};

export type RegistrationData = {
  id: string;
  price_paid: number;
  attended: boolean;
  certificate_id: string | null;
  registered_at: string;
  events: {
    title: string;
    event_date: string | null;
    category: string;
  } | null;
};

const IST = "Asia/Kolkata";
function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(iso));
}

export function AccountClient({
  profile,
  registrations,
  settings,
}: {
  profile: ProfileData | null;
  registrations: RegistrationData[];
  settings: MembershipSettings;
}) {
  const [tab, setTab] = useState<"overview" | "events" | "certificates" | "profile" | "security">("overview");

  // Profile Edit State
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [department, setDepartment] = useState(profile?.department || "");
  const [yearOfStudy, setYearOfStudy] = useState(profile?.year_of_study || "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Security State
  const [newPassword, setNewPassword] = useState("");
  const [savingPass, setSavingPass] = useState(false);
  const [passMsg, setPassMsg] = useState<string | null>(null);

  // Upgrade Modal State
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [utrNumber, setUtrNumber] = useState("");
  const [upgrading, setUpgrading] = useState(false);
  const [upgradeError, setUpgradeError] = useState<string | null>(null);

  // Certificate Modal State
  const [selectedCert, setSelectedCert] = useState<RegistrationData | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const copiedMemberId = profile?.member_id || "SC-2026-00000";

  const copyMemberIdToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(copiedMemberId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const supabase = createClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        department,
        year_of_study: yearOfStudy,
      })
      .eq("id", profile?.id || "");

    setSavingProfile(false);
    if (error) {
      setProfileMsg("Failed to update profile: " + error.message);
    } else {
      setProfileMsg("Profile updated successfully!");
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingPass(true);
    setPassMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    setSavingPass(false);
    if (error) {
      setPassMsg("Error updating password: " + error.message);
    } else {
      setPassMsg("Password changed successfully!");
      setNewPassword("");
    }
  };

  const handleUpgrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpgrading(true);
    setUpgradeError(null);

    if (!utrNumber.trim()) {
      setUpgradeError("Please enter your payment UTR / Ref number.");
      setUpgrading(false);
      return;
    }

    const res = await upgradeToPaidMembershipAction();
    setUpgrading(false);

    if (res.success) {
      setShowUpgradeModal(false);
      window.location.reload();
    } else {
      setUpgradeError(res.error || "Upgrade failed.");
    }
  };

  const attendedCount = registrations.filter((r) => r.attended).length;
  const certificateList = registrations.filter((r) => r.attended && r.certificate_id);
  const isStaff = profile && ["admin", "owner"].includes(profile.role);

  const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=${encodeURIComponent(settings.upi_name)}&am=${settings.membership_fee}&cu=INR&tn=Membership_Upgrade`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const currentSemester = getSemesterFromYear(yearOfStudy);

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-navy font-inter pt-32 pb-24 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Top Header Navigation */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-navy hover:text-red font-oswald uppercase tracking-widest text-xs font-bold transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-red" /> Back to Home
          </Link>

          <div className="flex items-center gap-3">
            {isStaff && (
              <Link
                href="/admin"
                className="bg-navy text-white hover:bg-red px-4 py-1.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold transition-colors"
              >
                Admin Panel →
              </Link>
            )}
          </div>
        </div>

        {/* Hero Member Profile Card (Light Surface) */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <span className="flex items-center gap-2 text-red font-oswald uppercase tracking-[0.25em] text-xs font-bold">
                <span className="w-6 h-[2px] bg-red" /> Science Club ASIET • Member Portal
              </span>

              <h1 className="font-oswald text-4xl sm:text-6xl font-bold uppercase text-navy tracking-tight">
                {profile?.full_name || profile?.email || "Science Club Member"}
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span>{profile?.email}</span>
                {profile?.department && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-navy">{profile.department}</span>
                  </>
                )}
                {profile?.year_of_study && (
                  <>
                    <span>•</span>
                    <span className="font-semibold text-red">
                      {getSemesterFromYear(profile.year_of_study) || profile.year_of_study}
                    </span>
                  </>
                )}
              </div>

              <div className="pt-1">
                <span className={`inline-block text-[10px] font-oswald uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${
                  profile?.is_member ? "bg-red text-white border-red" : "bg-gray-100 text-gray-600 border-gray-200"
                }`}>
                  {profile?.is_member ? "Paid Member" : "Standard Account"}
                </span>
              </div>
            </div>

            {/* Member ID Badge */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 w-full md:w-auto min-w-[240px] space-y-2">
              <span className="text-[10px] font-oswald uppercase tracking-widest text-gray-400 block">Member ID</span>
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-xl font-bold text-navy tracking-wider">{copiedMemberId}</span>
                <button
                  onClick={copyMemberIdToClipboard}
                  className="p-2 bg-white hover:bg-red hover:text-white border border-gray-200 text-navy rounded-lg transition-colors cursor-pointer"
                  title="Copy Member ID"
                >
                  {copiedId ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[10px] text-gray-400 block">Use this ID for event discounts & autofill</span>
            </div>

          </div>
        </div>

        {/* Minimalist Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
          {[
            { id: "overview", label: "Overview", icon: Zap },
            { id: "events", label: `My Events (${registrations.length})`, icon: Calendar },
            { id: "certificates", label: `Certificates (${certificateList.length})`, icon: Award },
            { id: "profile", label: "Edit Profile", icon: User },
            { id: "security", label: "Security", icon: Shield },
          ].map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id as typeof tab)}
                className={`px-5 py-3 font-oswald text-xs uppercase tracking-wider font-bold transition-all border-b-2 whitespace-nowrap cursor-pointer ${
                  active
                    ? "border-red text-red bg-white/50"
                    : "border-transparent text-gray-400 hover:text-navy"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Tab 1: Overview */}
        {tab === "overview" && (
          <div className="space-y-6">
            
            {/* Upgrade CTA Banner (For Free Members) */}
            {!profile?.is_member && (
              <div className="bg-navy text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-navy">
                <div className="space-y-1">
                  <span className="text-gold font-oswald text-xs uppercase font-bold tracking-widest">
                    ★ Member Membership Perks
                  </span>
                  <h3 className="font-oswald text-2xl font-bold uppercase">Upgrade to Premium Membership</h3>
                  <p className="text-white/70 text-xs max-w-xl">
                    Get member registration discounts (e.g. ₹50 vs ₹100), priority lab access, and official certificates.
                  </p>
                </div>

                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-white hover:text-navy transition-colors flex-shrink-0 cursor-pointer"
                >
                  Upgrade for ₹{settings.membership_fee}/yr →
                </button>
              </div>
            )}

            {/* Quick Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs font-oswald uppercase tracking-widest text-gray-400">Total Registered</span>
                <p className="font-oswald text-4xl font-bold text-navy">{registrations.length}</p>
                <p className="text-xs text-gray-500">Events in Science Club</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs font-oswald uppercase tracking-widest text-gray-400">Events Attended</span>
                <p className="font-oswald text-4xl font-bold text-navy">{attendedCount}</p>
                <p className="text-xs text-gray-500">Confirmed Attendance</p>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-1">
                <span className="text-xs font-oswald uppercase tracking-widest text-gray-400">Certificates Issued</span>
                <p className="font-oswald text-4xl font-bold text-red">{certificateList.length}</p>
                <p className="text-xs text-gray-500">Verified Certificates</p>
              </div>
            </div>

            {/* Recent Registrations List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-4">
              <h3 className="font-oswald text-xl font-bold uppercase text-navy">Recent Registrations</h3>

              {registrations.length === 0 ? (
                <div className="py-8 text-center space-y-2">
                  <p className="text-gray-400 text-xs">No event registrations found yet.</p>
                  <Link href="/events" className="inline-block text-xs font-oswald uppercase font-bold text-red hover:underline">
                    Browse Upcoming Events →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {registrations.slice(0, 5).map((r) => (
                    <div key={r.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-oswald text-base font-bold text-navy uppercase">{r.events?.title || "Event"}</p>
                        <p className="text-xs text-gray-400">{fmt(r.events?.event_date || r.registered_at)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-navy">₹{Number(r.price_paid).toFixed(0)}</span>
                        <span className={`text-[10px] font-oswald uppercase font-bold px-2.5 py-0.5 rounded-full ${
                          r.attended ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        }`}>
                          {r.attended ? "Attended" : "Registered"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: My Events */}
        {tab === "events" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy">My Event Registrations</h3>
              <p className="text-xs text-gray-500 mt-1">All events registered under your account.</p>
            </div>

            {registrations.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <p className="text-gray-400 text-xs">No event registrations found.</p>
                <Link href="/events" className="inline-block bg-red text-white px-6 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold hover:bg-navy transition-colors">
                  Explore Events →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {registrations.map((r) => (
                  <div key={r.id} className="bg-gray-50/60 border border-gray-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-oswald uppercase tracking-widest text-red font-bold">
                          {r.events?.category || "EVENT"}
                        </span>
                        <h4 className="font-oswald text-xl font-bold uppercase text-navy mt-0.5">{r.events?.title || "Event"}</h4>
                      </div>
                      <span className={`text-[10px] font-oswald uppercase font-bold px-2.5 py-0.5 rounded-full ${
                        r.attended ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-700"
                      }`}>
                        {r.attended ? "Attended" : "Registered"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
                      <span>Date: <strong className="text-navy">{fmt(r.events?.event_date || r.registered_at)}</strong></span>
                      <span>Paid: <strong className="font-mono text-navy">₹{Number(r.price_paid).toFixed(0)}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Certificates */}
        {tab === "certificates" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy">Certificates Gallery</h3>
              <p className="text-xs text-gray-500 mt-1">Digital certificates earned for attending Science Club events.</p>
            </div>

            {certificateList.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Award className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="text-gray-400 text-xs">No certificates issued yet. Attend events to earn verified certificates.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificateList.map((r) => (
                  <div key={r.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <span className="text-[10px] font-oswald uppercase tracking-widest text-red font-bold">OFFICIAL CERTIFICATE</span>
                      <h4 className="font-oswald text-lg font-bold uppercase text-navy">{r.events?.title || "Event Certificate"}</h4>
                      <p className="text-xs text-gray-500">Issued on {fmt(r.events?.event_date || r.registered_at)}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => setSelectedCert(r)}
                        className="flex-1 bg-navy text-white py-2 rounded-xl font-oswald text-xs uppercase font-bold tracking-wider hover:bg-red transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-3.5 h-3.5" /> View Certificate
                      </button>
                      <Link
                        href={`/certificates/${r.certificate_id}`}
                        target="_blank"
                        className="p-2 bg-gray-200 hover:bg-gray-300 text-navy rounded-xl transition-colors"
                        title="Public Verification Link"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Edit Profile */}
        {tab === "profile" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy">Edit Profile Details</h3>
              <p className="text-xs text-gray-500 mt-1">Keep your information updated for certificates and event registrations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Form Column */}
              <form onSubmit={saveProfile} className="space-y-4 lg:col-span-7">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-red"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-red bg-white cursor-pointer"
                  >
                    <option value="">Select Department...</option>
                    {DEPARTMENTS.map((d) => (
                      <option key={d.code} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Year of Study</label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-red bg-white cursor-pointer"
                  >
                    <option value="">Select Year...</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>

                  {yearOfStudy && currentSemester && (
                    <p className="text-xs font-semibold text-red mt-1">
                      Current Academic Semester: {currentSemester}
                    </p>
                  )}
                </div>

                {profileMsg && (
                  <p className={`text-xs p-3 rounded-xl ${profileMsg.includes("Failed") ? "bg-red/10 text-red" : "bg-green-100 text-green-800"}`}>
                    {profileMsg}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-navy transition-colors cursor-pointer"
                >
                  {savingProfile ? "Saving..." : "Save Profile Changes"}
                </button>
              </form>

              {/* Live Member Card Preview Column */}
              <div className="lg:col-span-5 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 block">
                  Live Member Card Preview
                </span>

                <div className="bg-navy text-white rounded-3xl p-6 relative overflow-hidden shadow-md space-y-4">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <span className="font-oswald text-xs font-bold uppercase tracking-widest text-white/90">
                      Science Club ASIET
                    </span>
                    <span className="text-[10px] font-mono font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                      {profile?.is_member ? "MEMBER" : "STANDARD"}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[9px] font-oswald uppercase tracking-widest text-white/40 block">Member Name</span>
                    <h4 className="font-oswald text-xl font-bold uppercase text-white truncate">
                      {fullName || "Your Name"}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-white/10 py-3">
                    <div>
                      <span className="text-[9px] font-oswald uppercase tracking-widest text-white/40 block">Department</span>
                      <p className="font-medium text-white truncate">{department || "Not Selected"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-oswald uppercase tracking-widest text-white/40 block">Semester</span>
                      <p className="font-medium text-gold truncate">
                        {yearOfStudy ? (currentSemester || yearOfStudy) : "Not Selected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-[9px] font-oswald uppercase tracking-widest text-white/40 block">Member ID</span>
                      <span className="font-mono text-xs font-bold text-white tracking-wider">{copiedMemberId}</span>
                    </div>
                    <span className="text-[9px] text-green-400 font-semibold">✓ VERIFIED</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Tab 5: Security */}
        {tab === "security" && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-sm space-y-6">
            <div>
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy">Account & Security</h3>
              <p className="text-xs text-gray-500 mt-1">Update your password or sign out of your account.</p>
            </div>

            <form onSubmit={changePassword} className="space-y-4 max-w-lg border-b border-gray-100 pb-6">
              <h4 className="font-oswald text-lg font-bold uppercase text-navy">Change Password</h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-navy text-sm focus:outline-none focus:border-red"
                />
              </div>

              {passMsg && (
                <p className={`text-xs p-3 rounded-xl ${passMsg.includes("Error") ? "bg-red/10 text-red" : "bg-green-100 text-green-800"}`}>
                  {passMsg}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPass}
                className="bg-navy text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors cursor-pointer"
              >
                {savingPass ? "Updating..." : "Update Password"}
              </button>
            </form>

            <div className="pt-2 flex items-center justify-between">
              <div>
                <h4 className="font-oswald text-lg font-bold uppercase text-navy">Sign Out</h4>
                <p className="text-xs text-gray-500">Log out of your current session.</p>
              </div>
              <SignOutButton />
            </div>
          </div>
        )}

      </div>

      {/* Upgrade Membership Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative text-navy">
            <button
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-navy p-1 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-red font-oswald text-xs uppercase tracking-widest font-bold">Upgrade Account</span>
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy mt-1">Paid Membership</h3>
              <p className="text-xs text-gray-500 mt-1">Unlock discounted pricing on events and workshops.</p>
            </div>

            <form onSubmit={handleUpgrade} className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3 text-center">
                <span className="font-oswald text-3xl font-bold text-navy">₹{settings.membership_fee}<span className="text-xs text-gray-500 font-normal"> / year</span></span>

                <div className="bg-white p-2 rounded-xl border border-gray-200 inline-block shadow-sm">
                  <Image src={qrCodeUrl} alt="UPI QR Code" width={140} height={140} unoptimized className="rounded-lg" />
                </div>

                <p className="font-mono text-xs font-bold text-red">{settings.upi_id}</p>
                <p className="text-[10px] text-gray-400">Scan QR Code or transfer ₹{settings.membership_fee} via any UPI App</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-600">UPI Transaction Ref (UTR / Ref ID)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4239XXXXXXXX"
                  value={utrNumber}
                  onChange={(e) => setUtrNumber(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-mono text-navy focus:outline-none focus:border-red"
                />
              </div>

              {upgradeError && <p className="text-xs text-red bg-red/10 p-3 rounded-xl">{upgradeError}</p>}

              <button
                type="submit"
                disabled={upgrading}
                className="w-full bg-red text-white py-3.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-navy transition-colors shadow-md disabled:opacity-60 cursor-pointer"
              >
                {upgrading ? "Activating..." : "Complete Payment & Activate"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white text-navy rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl relative space-y-6 my-auto border-4 border-navy">
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-6 right-6 text-gray-400 hover:text-navy p-2 bg-gray-100 rounded-full transition-colors print:hidden cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Print-Ready Certificate Body */}
            <div className="border-4 border-double border-navy p-8 sm:p-12 text-center space-y-6 relative bg-[radial-gradient(ellipse_at_center,rgba(250,249,248,1),rgba(240,238,235,1))]">
              <div className="space-y-1">
                <span className="font-oswald text-xs uppercase tracking-[0.4em] text-red font-bold">
                  ASIET Kalady • Science Club
                </span>
                <h2 className="font-oswald text-3xl sm:text-4xl font-bold uppercase tracking-tight text-navy">
                  Certificate of Participation
                </h2>
              </div>

              <div className="w-16 h-0.5 bg-red mx-auto" />

              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold">THIS IS PROUDLY PRESENTED TO</p>

              <h3 className="font-oswald text-3xl sm:text-5xl font-bold uppercase text-navy tracking-tight underline decoration-red/30 underline-offset-8">
                {profile?.full_name || profile?.email || "Science Club Member"}
              </h3>

              <p className="text-sm text-gray-600 max-w-lg mx-auto leading-relaxed">
                for active participation and successful completion of the scientific event{" "}
                <strong className="text-navy uppercase font-oswald">{selectedCert.events?.title || "Science Session"}</strong> held on{" "}
                <strong>{fmt(selectedCert.events?.event_date || selectedCert.registered_at)}</strong>.
              </p>

              <div className="pt-8 grid grid-cols-2 gap-8 items-end max-w-md mx-auto text-xs">
                <div className="border-t border-navy/30 pt-2 text-center">
                  <p className="font-oswald font-bold uppercase text-navy">Faculty Advisor</p>
                  <p className="text-[10px] text-gray-400">ASIET Kalady</p>
                </div>
                <div className="border-t border-navy/30 pt-2 text-center">
                  <p className="font-oswald font-bold uppercase text-navy">Club President</p>
                  <p className="text-[10px] text-gray-400">Science Club ASIET</p>
                </div>
              </div>

              <div className="pt-4 text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                VERIFICATION ID: {selectedCert.certificate_id}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 print:hidden">
              <Link
                href={`/certificates/${selectedCert.certificate_id}`}
                target="_blank"
                className="text-xs font-oswald uppercase font-bold text-navy hover:text-red transition-colors flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Open Verification Link
              </Link>

              <button
                onClick={() => window.print()}
                className="bg-navy text-white px-6 py-2.5 rounded-full font-oswald text-xs uppercase tracking-widest font-bold hover:bg-red transition-colors flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
