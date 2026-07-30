"use client";

import { useEffect, useRef } from "react";
import { X, Building2, Mail, GraduationCap } from "lucide-react";

export type Application = {
  id: string;
  name: string;
  email: string;
  department: string | null;
  year_of_study: string | null;
  motivation: string | null;
  status: string;
  stage: string;
  created_at: string;
  reviewed_by: string | null;
};

export function ApplicationDrawer({
  app,
  onClose,
  onStageChange
}: {
  app: Application | null;
  onClose: () => void;
  onStageChange: (id: string, stage: string) => void;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!app) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    
    // Focus the close button for accessibility
    const timer = setTimeout(() => {
      document.getElementById("drawer-close-btn")?.focus();
    }, 50);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [app, onClose]);

  if (!app) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" ref={overlayRef}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-navy/20 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Drawer */}
      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform animate-in slide-in-from-right duration-300 rounded-l-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="font-oswald text-xl font-bold uppercase text-navy">Application Details</h2>
          <button 
            id="drawer-close-btn"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-navy hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-navy/20"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="font-bold text-xl text-navy">{app.name}</h3>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-gray-400"/> {app.email}</span>
                {app.department && <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4 text-gray-400"/> {app.department}</span>}
                {app.year_of_study && <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-gray-400"/> {app.year_of_study}</span>}
              </div>
            </div>
            
            <div className="h-px w-full bg-gray-100" />
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Motivation</h4>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {app.motivation || "No motivation provided."}
              </p>
            </div>
            
            <div className="h-px w-full bg-gray-100" />
            
            <div>
              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Quick Actions</h4>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => onStageChange(app.id, "under_review")} className="text-xs font-bold uppercase tracking-widest py-2.5 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg hover:bg-navy hover:text-white transition-colors">Review</button>
                <button onClick={() => onStageChange(app.id, "interview")} className="text-xs font-bold uppercase tracking-widest py-2.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">Interview</button>
                <button onClick={() => onStageChange(app.id, "accepted")} className="text-xs font-bold uppercase tracking-widest py-2.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">Accept</button>
                <button onClick={() => onStageChange(app.id, "rejected")} className="text-xs font-bold uppercase tracking-widest py-2.5 bg-red/10 text-red border border-red/20 rounded-lg hover:bg-red/20 transition-colors">Reject</button>
              </div>
            </div>
            
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mt-2">
              <p className="text-xs text-blue-800 leading-relaxed">
                <span className="font-bold">Note:</span> Accepting an application moves it to the Accepted stage. To officially grant member pricing and benefits, you must also set the <strong>Member</strong> flag on their profile in the Members directory once they create an account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
