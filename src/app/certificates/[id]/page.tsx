import Link from "next/link";
import { CheckCircle2, AlertTriangle, Award, ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";

export const revalidate = 60;

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return { title: `Certificate ${id} Verification · Science Club ASIET` };
}

export default async function CertificateVerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = createAdminClient();

  const { data: registration } = await admin
    .from("event_registrations")
    .select("id, certificate_id, registered_at, attended, price_paid, profiles(full_name, email, department, year_of_study, member_id), events(title, event_date, category, location)")
    .eq("certificate_id", id)
    .maybeSingle();

  const isValid = Boolean(registration && registration.attended);

  const profile = registration?.profiles as unknown as {
    full_name: string | null;
    email: string | null;
    department: string | null;
    year_of_study: string | null;
    member_id: string | null;
  } | null;

  const event = registration?.events as unknown as {
    title: string;
    event_date: string | null;
    category: string;
    location: string | null;
  } | null;

  return (
    <div className="min-h-screen bg-navy text-white font-inter flex flex-col justify-between p-4 sm:p-8 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy/80 border border-white/5 rounded-full blur-2xl pointer-events-none" />

      <div className="max-w-2xl mx-auto w-full my-auto relative z-10 space-y-6">
        <Link href="/" className="inline-flex items-center gap-2 text-red font-oswald text-xs uppercase tracking-widest font-bold hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Science Club ASIET
        </Link>

        {isValid ? (
          <div className="bg-white/5 border border-white/15 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-green-500/20 border border-green-500/40 text-green-400 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <span className="font-oswald text-xs font-bold uppercase tracking-widest text-green-400 block">
                    Verified Certificate
                  </span>
                  <h1 className="font-oswald text-2xl font-bold uppercase text-white">Official Registry Record</h1>
                </div>
              </div>
              <Award className="w-8 h-8 text-gold hidden sm:block" />
            </div>

            <div className="space-y-4">
              <div className="bg-black/30 p-4 rounded-2xl border border-white/10 space-y-2">
                <span className="text-[10px] font-oswald uppercase tracking-widest text-white/50 block">Recipient Name</span>
                <p className="font-oswald text-2xl font-bold uppercase text-white">
                  {profile?.full_name || profile?.email || "Science Club Member"}
                </p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 font-mono">
                  <span>ID: {profile?.member_id || "N/A"}</span>
                  {profile?.department && <span>• {profile.department}</span>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-oswald uppercase tracking-widest text-white/50 block">Event Title</span>
                  <p className="font-oswald text-lg font-bold uppercase text-white">{event?.title || "Science Session"}</p>
                  <p className="text-xs text-white/60">{fmt(event?.event_date || registration?.registered_at)}</p>
                </div>

                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 space-y-1">
                  <span className="text-[10px] font-oswald uppercase tracking-widest text-white/50 block">Verification Details</span>
                  <p className="font-mono text-sm font-bold text-red">{id}</p>
                  <p className="text-xs text-white/60">Issuer: ASIET Science Club Kalady</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/40">
              <span>Verified against Supabase Database Registry</span>
              <Link href="/login" className="text-red font-oswald font-bold uppercase tracking-wider hover:underline">
                Member Login →
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-red/30 rounded-3xl p-8 sm:p-10 backdrop-blur-xl shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-red/10 border border-red/30 text-red rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h1 className="font-oswald text-3xl font-bold uppercase text-white">Certificate Not Found</h1>
            <p className="text-white/60 text-sm max-w-md mx-auto">
              The certificate ID <strong className="font-mono text-red">{id}</strong> could not be verified in the Science Club registry or attendance has not been confirmed yet.
            </p>
            <div className="pt-4">
              <Link href="/" className="bg-white text-navy px-8 py-3 rounded-full font-oswald text-xs uppercase tracking-widest font-bold hover:bg-red hover:text-white transition-colors inline-block">
                Return to Home Page
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
