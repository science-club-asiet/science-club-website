"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "loading" | "ok" | "already" | "error";

export function RegisterButton({ eventId, className = "" }: { eventId: string; className?: string }) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");

  const register = async () => {
    setState("loading");
    const res = await fetch(`/api/events/${eventId}/register`, { method: "POST" });
    if (res.status === 401) {
      router.push(`/login?next=/events`);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (data.status === "ok") setState("ok");
    else if (data.status === "already") setState("already");
    else setState("error");
  };

  const label =
    state === "ok" ? "Registered ✓"
    : state === "already" ? "Already registered"
    : state === "loading" ? "Registering…"
    : state === "error" ? "Try again"
    : "Register";

  return (
    <button
      onClick={register}
      disabled={state === "loading" || state === "ok" || state === "already"}
      className={
        className ||
        "bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-navy transition-colors disabled:opacity-70"
      }
    >
      {label}
    </button>
  );
}
