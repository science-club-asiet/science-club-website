"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Sparkles, QrCode, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getMembershipSettings, upgradeToPaidMembershipAction, type MembershipSettings } from "@/app/account/actions";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const initialMode = params.get("mode") === "signup" ? "signup" : "signin";
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [membershipTier, setMembershipTier] = useState<"free" | "paid">("free");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card">("upi");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [utrNumber, setUtrNumber] = useState("");

  const [settings, setSettings] = useState<MembershipSettings>({
    membership_fee: 299,
    upi_id: "scienceclub@okaxis",
    upi_name: "Science Club ASIET",
  });

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    getMembershipSettings().then(setSettings);
  }, []);

  const upiUri = `upi://pay?pa=${encodeURIComponent(settings.upi_id)}&pn=${encodeURIComponent(settings.upi_name)}&am=${settings.membership_fee}&cu=INR&tn=ScienceClub_Membership`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUri)}`;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }

      if (!data.session) {
        setNotice("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
        setBusy(false);
        return;
      }

      // If user chose Paid Membership, trigger upgrade action
      if (membershipTier === "paid") {
        const res = await upgradeToPaidMembershipAction();
        if (!res.success) {
          console.warn("Auto-upgrade warning:", res.error);
        }
      }

      router.push(next);
      router.refresh();
      return;
    }

    // Sign In mode
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setBusy(false);
      return;
    }
    router.push(next);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] text-navy font-inter flex items-center justify-center p-4 sm:p-8 pt-28 pb-16">
      <div className="w-full max-w-md my-auto">
        
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-navy hover:text-red font-oswald text-xs uppercase tracking-widest font-bold mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-red" /> Back to Home
        </Link>

        {/* Clean Login Card Surface */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          
          <div className="mb-6">
            <h1 className="font-oswald text-3xl sm:text-4xl font-bold uppercase text-navy tracking-tight">
              {mode === "signin" ? "Welcome Back" : "Create Account"}
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              {mode === "signin"
                ? "Sign in to access your dashboard, events, and certificates."
                : "Join Science Club ASIET to get your Member ID and event passes."}
            </p>
          </div>

          {/* Mode Switcher Pills */}
          <div className="flex bg-gray-100 p-1 rounded-2xl mb-6 border border-gray-200">
            <button
              type="button"
              onClick={() => { setMode("signin"); setError(null); setNotice(null); }}
              className={`flex-1 py-2.5 rounded-xl font-oswald text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                mode === "signin" ? "bg-red text-white shadow-sm" : "text-gray-500 hover:text-navy"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode("signup"); setError(null); setNotice(null); }}
              className={`flex-1 py-2.5 rounded-xl font-oswald text-xs uppercase font-bold tracking-wider transition-all cursor-pointer ${
                mode === "signup" ? "bg-red text-white shadow-sm" : "text-gray-500 hover:text-navy"
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={submit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arjun Menon"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-gray-400 text-sm focus:outline-none focus:border-red bg-white"
                />
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Email Address</label>
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@asiet.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-gray-400 text-sm focus:outline-none focus:border-red bg-white"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">Password</label>
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border border-gray-200 rounded-xl px-4 py-3 text-navy placeholder:text-gray-400 text-sm focus:outline-none focus:border-red bg-white"
              />
            </div>

            {/* Signup Tier Choice */}
            {mode === "signup" && (
              <div className="mt-2 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 block">Select Membership Tier</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMembershipTier("free")}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      membershipTier === "free"
                        ? "border-red bg-red/5 text-navy"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <span className="font-oswald text-sm font-bold uppercase block text-navy">Standard</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Free Member</span>
                    </div>
                    <span className="font-oswald text-lg font-bold text-navy mt-2">₹0</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMembershipTier("paid")}
                    className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                      membershipTier === "paid"
                        ? "border-red bg-red/5 text-navy"
                        : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                    }`}
                  >
                    <span className="absolute top-2 right-2 bg-red text-[9px] font-oswald font-bold px-1.5 py-0.5 rounded text-white uppercase tracking-widest">
                      PERKS
                    </span>
                    <div>
                      <span className="font-oswald text-sm font-bold uppercase block text-navy flex items-center gap-1">
                        Premium <Sparkles className="w-3 h-3 text-gold inline" />
                      </span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Event Discounts</span>
                    </div>
                    <span className="font-oswald text-lg font-bold text-red mt-2">₹{settings.membership_fee}<span className="text-[10px] text-gray-400 font-normal">/yr</span></span>
                  </button>
                </div>

                {/* Paid Tier Checkout Block */}
                {membershipTier === "paid" && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 mt-3 space-y-4">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                      <div>
                        <span className="font-oswald text-sm font-bold uppercase text-navy block">Annual Membership</span>
                        <span className="text-xs text-gray-500">1 Year Member Access</span>
                      </div>
                      <span className="font-oswald text-xl font-bold text-red">₹{settings.membership_fee}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("upi")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === "upi" ? "bg-navy text-white border-navy" : "border-gray-200 text-gray-500 bg-white"
                        }`}
                      >
                        <QrCode className="w-3.5 h-3.5" /> UPI Scan
                      </button>
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("card")}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-oswald uppercase tracking-wider font-bold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                          paymentMethod === "card" ? "bg-navy text-white border-navy" : "border-gray-200 text-gray-500 bg-white"
                        }`}
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Card
                      </button>
                    </div>

                    {paymentMethod === "upi" ? (
                      <div className="flex flex-col items-center gap-3 py-2">
                        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm">
                          <Image src={qrCodeUrl} alt="UPI Payment QR Code" width={140} height={140} unoptimized className="rounded-lg" />
                        </div>
                        <div className="text-center">
                          <p className="text-[11px] text-gray-500">Scan with any UPI App</p>
                          <p className="font-mono text-xs font-bold text-red mt-0.5">{settings.upi_id}</p>
                        </div>
                        <div className="w-full space-y-1">
                          <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">UPI Transaction Ref (UTR / Ref No)</label>
                          <input
                            type="text"
                            required={membershipTier === "paid"}
                            placeholder="e.g. 4239XXXXXXXX"
                            value={utrNumber}
                            onChange={(e) => setUtrNumber(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-navy text-xs font-mono placeholder:text-gray-400 focus:outline-none focus:border-red bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 text-xs">
                        <input
                          type="text"
                          placeholder="Card Number (4000 0000 0000 0000)"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-navy font-mono placeholder:text-gray-400 focus:outline-none focus:border-red bg-white"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="MM / YY"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-navy font-mono placeholder:text-gray-400 focus:outline-none focus:border-red bg-white"
                          />
                          <input
                            type="text"
                            placeholder="CVV"
                            className="border border-gray-300 rounded-lg px-3 py-2 text-navy font-mono placeholder:text-gray-400 focus:outline-none focus:border-red bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {error && <p className="text-red text-xs bg-red/10 border border-red/20 rounded-xl p-3">{error}</p>}
            {notice && <p className="text-green-800 text-xs bg-green-100 border border-green-200 rounded-xl p-3">{notice}</p>}

            <button
              type="submit"
              disabled={busy}
              className="mt-2 bg-red text-white py-3.5 rounded-full font-oswald uppercase tracking-widest text-xs font-bold hover:bg-navy transition-all shadow-md disabled:opacity-60 cursor-pointer w-full"
            >
              {busy ? "Processing..." : mode === "signin" ? "Sign In to Account" : membershipTier === "paid" ? `Pay ₹${settings.membership_fee} & Join` : "Create Free Account"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
