"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await createClient().auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="text-sm font-oswald uppercase tracking-widest font-bold text-navy/60 hover:text-red transition-colors"
    >
      Sign out
    </button>
  );
}
