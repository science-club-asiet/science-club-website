"use client";

import { useState, useTransition } from "react";
import { Search, CheckCircle2, XCircle } from "lucide-react";
import { updateUserRole, toggleUserMembership } from "@/lib/admin/settings-actions";
import { toast } from "@/components/ui/Toast";
import { ConfirmModal, type ConfirmConfig } from "@/components/ui/ModalDialog";

export type UserProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  department: string | null;
  year_of_study: string | null;
  role: "member" | "execom" | "admin" | "owner";
  is_member: boolean;
  created_at: string;
};

export function SettingsUsers({ profiles }: { profiles: UserProfile[] }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const [confirmConfig, setConfirmConfig] = useState<ConfirmConfig | null>(null);

  const filtered = profiles.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (p.full_name && p.full_name.toLowerCase().includes(q)) ||
      (p.email && p.email.toLowerCase().includes(q)) ||
      p.role.toLowerCase().includes(q)
    );
  });

  const handleRoleChange = (user: UserProfile, newRole: UserProfile["role"]) => {
    if (user.role === newRole) return;

    setConfirmConfig({
      title: "Change User Role",
      message: `Are you sure you want to change ${user.full_name || user.email}'s role from '${user.role.toUpperCase()}' to '${newRole.toUpperCase()}'?`,
      confirmText: "Change Role",
      isDanger: newRole === "member",
      onCancel: () => setConfirmConfig(null),
      onConfirm: () => {
        setConfirmConfig(null);
        startTransition(async () => {
          try {
            await updateUserRole(user.id, newRole);
            toast(`Role updated to ${newRole.toUpperCase()}`, "success");
          } catch (err: unknown) {
            toast((err as Error).message, "error");
          }
        });
      },
    });
  };

  const handleToggleMembership = (user: UserProfile) => {
    const nextStatus = !user.is_member;
    startTransition(async () => {
      try {
        await toggleUserMembership(user.id, nextStatus);
        toast(`Membership updated to ${nextStatus ? "Active" : "Inactive"}`, "success");
      } catch (err: unknown) {
        toast((err as Error).message, "error");
      }
    });
  };

  return (
    <div className="space-y-6 font-inter">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-oswald text-2xl font-bold uppercase text-navy">Users & Roles Management</h2>
          <p className="text-xs text-gray-500 mt-1">Manage user administrative access, Execom privileges, and paid memberships.</p>
        </div>

        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-navy focus:outline-none focus:border-red"
          />
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-navy">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase tracking-widest text-[10px] font-bold text-navy/60">
              <tr>
                <th className="px-5 py-3.5">User</th>
                <th className="px-5 py-3.5">Department</th>
                <th className="px-5 py-3.5">Role</th>
                <th className="px-5 py-3.5">Membership</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400 text-xs">
                    No users found matching query.
                  </td>
                </tr>
              ) : (
                filtered.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-bold text-navy">{user.full_name || "Unnamed User"}</div>
                      <div className="text-[11px] font-mono text-gray-400">{user.email}</div>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {user.department ? `${user.department} ${user.year_of_study ? `(${user.year_of_study})` : ""}` : "N/A"}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user, e.target.value as UserProfile["role"])}
                        disabled={isPending}
                        className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-semibold uppercase text-navy focus:outline-none focus:border-red"
                      >
                        <option value="owner">Owner</option>
                        <option value="admin">Admin</option>
                        <option value="execom">Execom</option>
                        <option value="member">Member</option>
                      </select>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => handleToggleMembership(user)}
                        disabled={isPending}
                        className={`px-3 py-1 rounded-full text-[10px] font-oswald uppercase tracking-wider font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          user.is_member
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                        }`}
                      >
                        {user.is_member ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <XCircle className="w-3 h-3 text-gray-400" />}
                        {user.is_member ? "Paid Member" : "Free User"}
                      </button>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-[10px] font-mono text-gray-400">
                        {new Date(user.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal isOpen={Boolean(confirmConfig)} config={confirmConfig} />
    </div>
  );
}
