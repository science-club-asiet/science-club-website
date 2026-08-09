"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type State = "idle" | "loading" | "ok" | "already" | "error";

export function RegisterButton({
  eventId,
  opStatus = "open",
  formSlug,
  formId,
  className = "",
}: {
  eventId: string;
  opStatus?: "open" | "closed" | "finished" | "draft";
  formSlug?: string | null;
  formId?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");

  const btnCls =
    className ||
    "bg-red text-white px-8 py-3 rounded-full font-oswald uppercase tracking-widest text-sm font-bold hover:bg-navy transition-colors disabled:opacity-60 inline-flex items-center justify-center";

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
      className={btnCls}
    >
      {label}
    </button>
  );
}
