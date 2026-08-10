"use client";

import { Mail, CheckCircle2, ShieldCheck, ShieldAlert } from "lucide-react";

export function SettingsEmail({
  envConfig = { resendConfigured: false, supabaseAuthConfigured: true, uploadThingConfigured: true },
}: {
  envConfig?: { resendConfigured: boolean; supabaseAuthConfigured: boolean; uploadThingConfigured: boolean };
}) {
  return (
    <div className="space-y-6 font-inter max-w-3xl">
      <div>
        <h2 className="font-oswald text-2xl font-bold uppercase text-navy">Email Settings</h2>
        <p className="text-xs text-gray-500 mt-1">Status of transactional email providers and authentication notifications.</p>
      </div>

      <div className="bg-navy text-white rounded-2xl p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Mail className="w-5 h-5 text-red" />
          </div>
          <div>
            <h3 className="font-oswald text-lg font-bold uppercase text-white">Environment Managed Email Provider</h3>
            <p className="text-xs text-white/70">SMTP and transactional email settings are managed securely via server environment variables.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
            <span className="text-white/80">Supabase Auth Confirmation</span>
            {envConfig.supabaseAuthConfigured ? (
              <span className="bg-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" /> Active
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-400" /> Unconfigured
              </span>
            )}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
            <span className="text-white/80">Resend / SMTP Gateway</span>
            {envConfig.resendConfigured ? (
              <span className="bg-green-500/20 text-green-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" /> Configured
              </span>
            ) : (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-amber-400" /> Env Key Missing
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
