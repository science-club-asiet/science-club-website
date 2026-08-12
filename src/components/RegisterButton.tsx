"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Plus, Trash2, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  id: string;
  memberId: string;
  fullName: string;
  email: string;
  department?: string;
  yearOfStudy?: string;
  isMember: boolean;
  verified: boolean;
  loading: boolean;
};

export function RegisterButton({
  eventId,
  eventTitle = "Science Event",
  memberPrice = 0,
  nonMemberPrice = 0,
  allowedDepartments = [],
  allowedYears = [],
  opStatus = "open",
  formSlug,
  formId,
  upiId,
  upiName,
  className = "",
}: {
  eventId: string;
  eventTitle?: string;
  memberPrice?: number;
  nonMemberPrice?: number;
  allowedDepartments?: string[];
  allowedYears?: string[];
  opStatus?: "open" | "closed" | "finished" | "draft";
  formSlug?: string | null;
  formId?: string | null;
  upiId?: string;
  upiName?: string;
  className?: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [upiSettings, setUpiSettings] = useState({
    upi_id: upiId || "scienceclub@okaxis",
    upi_name: upiName || "Science Club ASIET",
  });

  const [utrNumber, setUtrNumber] = useState("");
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!upiId || !upiName) {
      const supabase = createClient();
      supabase
        .from("site_content")
        .select("value")
        .eq("key", "membership_settings")
        .maybeSingle()
        .then(({ data }) => {
          if (data?.value && typeof data.value === "object") {
            const settings = data.value as { upi_id?: string; upi_name?: string };
            setUpiSettings({
              upi_id: settings.upi_id || "scienceclub@okaxis",
              upi_name: settings.upi_name || "Science Club ASIET",
            });
          }
        });
    }
  }, [upiId, upiName]);

  // Lock background Lenis scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      if (typeof window !== "undefined") window.__lenis?.stop();
    } else {
      if (typeof window !== "undefined") window.__lenis?.start();
    }
  }, [isOpen]);

  // Load current user profile on open
  useEffect(() => {
    if (!isOpen) return;

    const initSlot = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, email, member_id, is_member, department, year_of_study")
          .eq("id", user.id)
          .single();

        setParticipants([
          {
            id: "1",
            memberId: prof?.member_id || "",
            fullName: prof?.full_name || user.email || "",
            email: user.email || "",
            department: prof?.department || "",
            yearOfStudy: prof?.year_of_study || "",
            isMember: Boolean(prof?.is_member),
            verified: true,
            loading: false,
          },
        ]);
      } else {
        setParticipants([
          {
            id: "1",
            memberId: "",
            fullName: "",
            email: "",
            department: "",
            yearOfStudy: "",
            isMember: false,
            verified: false,
            loading: false,
          },
        ]);
      }
    };

    initSlot();
  }, [isOpen]);

  const addParticipant = () => {
    setParticipants((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        memberId: "",
        fullName: "",
        email: "",
        department: "",
        yearOfStudy: "",
        isMember: false,
        verified: false,
        loading: false,
      },
    ]);
  };

  const removeParticipant = (id: string) => {
    if (participants.length <= 1) return;
    setParticipants((prev) => prev.filter((p) => p.id !== id));
  };

  const updateParticipant = (id: string, field: keyof Participant, val: unknown) => {
    setParticipants((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: val, ...(field === "memberId" ? { verified: false } : {}) } : p))
    );
  };

  const verifyMemberId = async (id: string, rawMemberId: string) => {
    if (!rawMemberId.trim()) return;

    setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, loading: true } : p)));

    try {
      const res = await fetch(`/api/members/validate?id=${encodeURIComponent(rawMemberId.trim())}`);
      const data = await res.json();

      if (data.success && data.user) {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  memberId: data.user.memberId,
                  fullName: data.user.fullName || p.fullName,
                  email: data.user.email || p.email,
                  department: data.user.department || p.department,
                  yearOfStudy: data.user.yearOfStudy || p.yearOfStudy,
                  isMember: Boolean(data.user.isMember),
                  verified: true,
                  loading: false,
                }
              : p
          )
        );
      } else {
        setParticipants((prev) =>
          prev.map((p) =>
            p.id === id
              ? {
                  ...p,
                  isMember: false,
                  verified: false,
                  loading: false,
                }
              : p
          )
        );
      }
    } catch {
      setParticipants((prev) => prev.map((p) => (p.id === id ? { ...p, loading: false } : p)));
    }
  };

  // Calculate dynamic total price
  const calculateParticipantPrice = (p: Participant) => {
    return p.isMember ? memberPrice : nonMemberPrice;
  };

  const grandTotal = participants.reduce((sum, p) => sum + calculateParticipantPrice(p), 0);

  const upiUri = `upi://pay?pa=${encodeURIComponent(upiSettings.upi_id)}&pn=${encodeURIComponent(upiSettings.upi_name)}&am=${grandTotal}&cu=INR&tn=${encodeURIComponent(eventTitle.slice(0, 20))}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUri)}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);

    // If total > 0, demand UTR Number
    if (grandTotal > 0 && !utrNumber.trim()) {
      setError("Please enter your UPI Payment Transaction Ref (UTR) Number.");
      setBusy(false);
      return;
    }

    try {
      const res = await fetch(`/api/events/${eventId}/register-group`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          participants: participants.map((p) => ({
            memberId: p.memberId,
            fullName: p.fullName,
            email: p.email,
          })),
          utrNumber,
        }),
      });

      const data = await res.json();
      setBusy(false);

      if (data.status === "ok") {
        setSuccess(true);
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setBusy(false);
      setError("Something went wrong. Please check your connection.");
    }
  };

  const btnCls =
    className ||
    "bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-navy transition-colors disabled:opacity-60 inline-flex items-center justify-center cursor-pointer";

  if (opStatus === "closed") {
    return (
      <button disabled className={`${btnCls} bg-gray-400 cursor-not-allowed`}>
        Registration Closed
      </button>
    );
  }

  if (opStatus === "finished") {
    return (
      <button disabled className={`${btnCls} bg-gray-500 cursor-not-allowed`}>
        Event Finished
      </button>
    );
  }

  if (formSlug || formId) {
    return (
      <Link href={`/forms/${formSlug || formId}`} className={btnCls}>
        Complete Registration Form →
      </Link>
    );
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className={btnCls}>
        Register Now
      </button>

      {/* Registration Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto font-inter text-navy">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-gray-100 flex flex-col my-auto">
            
            {/* Modal Header */}
            <div className="bg-navy text-white p-6 sm:p-8 rounded-t-3xl relative">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-6 right-6 text-white/60 hover:text-white bg-white/10 p-2 rounded-full transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <span className="text-red font-oswald text-xs uppercase tracking-widest font-bold block mb-1">
                Event Registration
              </span>
              <h2 className="font-oswald text-2xl sm:text-3xl font-bold uppercase">{eventTitle}</h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-white/70">
                <span>Member Price: <strong className="text-white">₹{memberPrice}</strong></span>
                <span>•</span>
                <span>Non-Member Price: <strong className="text-white">₹{nonMemberPrice}</strong></span>
                {(allowedDepartments.length > 0 || allowedYears.length > 0) && (
                  <>
                    <span>•</span>
                    <span className="bg-red/20 border border-red/40 text-red px-2.5 py-0.5 rounded-full font-oswald text-[10px] font-bold uppercase tracking-wider">
                      Exclusive Event
                      {allowedYears.length > 0 ? ` • ${allowedYears.join(", ")}` : ""}
                      {allowedDepartments.length > 0 ? ` • ${allowedDepartments.join(", ")}` : ""}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 flex-1">
              {success ? (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h3 className="font-oswald text-3xl font-bold uppercase text-navy">Registration Submitted!</h3>
                  <p className="text-gray-600 text-sm max-w-md mx-auto">
                    Your registration for {participants.length} participant(s) has been recorded. Verified members will find their pass and certificates in their dashboard.
                  </p>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setSuccess(false);
                      router.refresh();
                    }}
                    className="mt-4 bg-navy text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-colors"
                  >
                    Close & View Dashboard
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-oswald text-lg font-bold uppercase text-navy">Participants</h3>
                        <p className="text-xs text-gray-500">Enter Science Club Member ID to autofill details and apply member pricing.</p>
                      </div>
                      <button
                        type="button"
                        onClick={addParticipant}
                        className="bg-navy/5 hover:bg-navy hover:text-white text-navy px-3 py-1.5 rounded-xl font-oswald text-xs uppercase font-bold tracking-wider transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-4 h-4" /> Add Participant
                      </button>
                    </div>

                    <div className="space-y-4">
                      {participants.map((p, idx) => {
                        return (
                          <div key={p.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-3 relative">
                            <div className="flex items-center justify-between">
                              <span className="font-oswald text-xs font-bold uppercase tracking-widest text-navy">
                                Participant #{idx + 1}
                              </span>
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${
                                  p.isMember ? "bg-green-100 text-green-700 border border-green-300" : "bg-gray-200 text-gray-700"
                                }`}>
                                  {p.isMember ? "Member Rate (₹" + memberPrice + ")" : "Non-Member Rate (₹" + nonMemberPrice + ")"}
                                </span>
                                {participants.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeParticipant(p.id)}
                                    className="text-gray-400 hover:text-red p-1 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              {/* Member ID Field */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                                  Member ID (Optional)
                                </label>
                                <div className="flex gap-1">
                                  <input
                                    type="text"
                                    placeholder="SC-2026-XXXXX"
                                    value={p.memberId}
                                    onChange={(e) => updateParticipant(p.id, "memberId", e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-navy uppercase focus:outline-none focus:border-red"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => verifyMemberId(p.id, p.memberId)}
                                    disabled={p.loading || !p.memberId}
                                    className="bg-navy text-white text-[10px] font-oswald uppercase font-bold px-2.5 rounded-xl hover:bg-red transition-colors disabled:opacity-50"
                                  >
                                    {p.loading ? "..." : "Check"}
                                  </button>
                                </div>
                              </div>

                              {/* Full Name */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                                  Full Name
                                </label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Arjun Menon"
                                  value={p.fullName}
                                  onChange={(e) => updateParticipant(p.id, "fullName", e.target.value)}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:border-red"
                                />
                              </div>

                              {/* Email */}
                              <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-1">
                                  Email Address
                                </label>
                                <input
                                  type="email"
                                  required
                                  placeholder="you@asiet.ac.in"
                                  value={p.email}
                                  onChange={(e) => updateParticipant(p.id, "email", e.target.value)}
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs text-navy focus:outline-none focus:border-red"
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Payment Block */}
                  <div className="p-5 rounded-2xl border border-red/20 bg-red/5 space-y-4">
                    <div className="flex items-center justify-between border-b border-red/10 pb-3">
                      <div>
                        <span className="font-oswald text-base font-bold uppercase text-navy block">
                          Total Amount Due
                        </span>
                        <span className="text-xs text-gray-500">
                          {participants.length} Participant(s) • Dynamic Rate Applied
                        </span>
                      </div>
                      <span className="font-oswald text-3xl font-bold text-red">₹{grandTotal}</span>
                    </div>

                    {grandTotal > 0 && (
                      <div className="flex flex-col sm:flex-row items-center gap-6 bg-white p-4 rounded-xl border border-gray-200">
                        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-md">
                          <Image src={qrCodeUrl} alt="UPI QR Code" width={140} height={140} unoptimized className="rounded-lg" />
                        </div>

                        <div className="space-y-3 flex-1 w-full">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block">
                              Pay via Any UPI App
                            </span>
                            <p className="font-mono text-sm font-bold text-navy mt-0.5">{upiSettings.upi_id}</p>
                            <p className="text-xs text-gray-500">Scan QR Code or transfer exact amount to UPI ID above.</p>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-navy block">
                              UPI Transaction Ref / UTR Number
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 4239XXXXXXXX"
                              value={utrNumber}
                              onChange={(e) => setUtrNumber(e.target.value)}
                              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono text-navy placeholder:text-gray-300 focus:outline-none focus:border-red"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red text-xs bg-red/10 border border-red/20 rounded-xl p-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOpen(false)}
                      className="px-6 py-3 rounded-full font-oswald uppercase tracking-widest text-xs font-bold text-gray-500 hover:text-navy transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={busy}
                      className="bg-navy text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-red transition-all shadow-md disabled:opacity-60 flex items-center gap-2"
                    >
                      {busy ? "Submitting..." : `Complete Registration (₹${grandTotal})`} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
