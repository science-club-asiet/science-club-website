import { create } from "zustand";

export interface AdminState {
  email: string;
  role: string;
  term: string;
  activeTerm: string;
  availableTerms: string[];
  setSession: (data: Partial<AdminState>) => void;
  setTerm: (term: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  email: "",
  role: "admin",
  term: "2025-26",
  activeTerm: "2025-26",
  availableTerms: ["2025-26"],
  setSession: (data) => set((state) => ({ ...state, ...data })),
  setTerm: (term) => set({ term }),
}));
