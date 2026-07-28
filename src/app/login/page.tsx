"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setBusy(false);
        return;
      }
      if (!data.session) {
        setNotice("Account created. Check your email to confirm, then sign in.");
        setMode("signin");
        setBusy(false);
        return;
      }
      router.push(next);
      router.refresh();
      return;
    }

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
    <div className="min-h-screen bg-navy text-white flex items-center justify-center px-6 font-inter">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-oswald uppercase tracking-[0.3em] text-red text-xs font-bold">
          ← Science Club
        </Link>
        <h1 className="font-oswald text-4xl font-bold uppercase mt-3 mb-8">
          {mode === "signin" ? "Sign In" : "Create Account"}
        </h1>

        <form onSubmit={submit} className="flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Email</span>
            <input
              type="email" required autoComplete="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red transition-colors"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-widest text-white/50">Password</span>
            <input
              type="password" required minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password} onChange={(e) => setPassword(e.target.value)}
              className="bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red transition-colors"
            />
          </label>

          {error && <p className="text-red text-sm">{error}</p>}
          {notice && <p className="text-white/70 text-sm">{notice}</p>}

          <button
            type="submit" disabled={busy}
            className="mt-2 bg-red text-white py-3.5 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-white hover:text-navy transition-colors disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <button
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setNotice(null); }}
          className="mt-6 text-sm text-white/50 hover:text-white transition-colors"
        >
          {mode === "signin" ? "Need an account? Sign up" : "Already have an account? Sign in"}
        </button>

        <p className="mt-8 text-xs text-white/30 leading-relaxed">
          The first account created becomes the owner. Everyone after signs up as a member.
        </p>
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
