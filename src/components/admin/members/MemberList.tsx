"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Download } from "lucide-react";

export type MemberRow = {
  id: string;
  full_name: string | null;
  email: string;
  department: string | null;
  year_of_study: string | null;
  role: string;
  is_member: boolean;
  tags: string[];
  events_attended: number;
};

export default function MemberList({ members }: { members: MemberRow[] }) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [membershipFilter, setMembershipFilter] = useState("all");

  const filteredMembers = useMemo(() => {
    return members.filter(m => {
      if (roleFilter !== "all" && m.role !== roleFilter) return false;
      if (membershipFilter !== "all") {
        if (membershipFilter === "member" && !m.is_member) return false;
        if (membershipFilter === "not_member" && m.is_member) return false;
      }
      
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchName = m.full_name?.toLowerCase().includes(q);
        const matchEmail = m.email.toLowerCase().includes(q);
        const matchTag = m.tags?.some(t => t.toLowerCase().includes(q));
        if (!matchName && !matchEmail && !matchTag) return false;
      }
      return true;
    });
  }, [members, search, roleFilter, membershipFilter]);

  const downloadCSV = () => {
    const header = ["Name", "Email", "Department", "Year", "Role", "Is Member", "Events Attended", "Tags"];
    const rows = filteredMembers.map(m => [
      `"${m.full_name || ""}"`,
      `"${m.email}"`,
      `"${m.department || ""}"`,
      `"${m.year_of_study || ""}"`,
      m.role,
      m.is_member ? "Yes" : "No",
      m.events_attended,
      `"${(m.tags || []).join(", ")}"`
    ]);
    
    const csv = [header.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `members_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search name, email, or tags..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/10"
            />
          </div>
          <select 
            value={roleFilter} 
            onChange={(e) => setRoleFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">All Roles</option>
            <option value="member">Member</option>
            <option value="execom">Execom</option>
            <option value="admin">Admin</option>
            <option value="owner">Owner</option>
          </select>
          <select 
            value={membershipFilter} 
            onChange={(e) => setMembershipFilter(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value="all">Any Status</option>
            <option value="member">Member Only</option>
            <option value="not_member">Not Member</option>
          </select>
        </div>
        
        <button 
          onClick={downloadCSV}
          className="flex items-center gap-2 text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-gray-500">
              <th className="px-5 py-3 font-medium">Name & Email</th>
              <th className="px-5 py-3 font-medium">Academics</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Events</th>
              <th className="px-5 py-3 font-medium">Tags</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-gray-500">
                  No members found matching the filters.
                </td>
              </tr>
            ) : (
              filteredMembers.map(m => (
                <tr key={m.id} className="hover:bg-gray-50/50 group transition-colors">
                  <td className="px-5 py-4">
                    <Link href={`/admin/members/${m.id}`} className="block">
                      <p className="font-medium text-gray-900 group-hover:text-navy transition-colors">{m.full_name || "—"}</p>
                      <p className="text-gray-500">{m.email}</p>
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {m.department ? `${m.department} ${m.year_of_study ? `(${m.year_of_study})` : ''}` : "—"}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1 items-start">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{m.role}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${m.is_member ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                        {m.is_member ? "Member" : "No"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                      {m.events_attended}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {(m.tags || []).slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[10px] uppercase tracking-wider bg-navy/5 text-navy px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {(m.tags?.length || 0) > 2 && (
                        <span className="text-[10px] uppercase tracking-wider bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                          +{(m.tags?.length || 0) - 2}
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
