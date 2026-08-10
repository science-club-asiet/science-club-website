"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  BarChart3,
  User,
  Table as TableIcon,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Clock,
  FileText,
  HelpCircle,
  HelpCircle as QuestionIcon,
  Trash2,
  FileSpreadsheet,
  ExternalLink,
  Copy,
  Check,
  X,
} from "lucide-react";
import { deleteSubmissionAction } from "@/lib/admin/formActions";
import { toast } from "@/components/ui/Toast";
import { showConfirm } from "@/components/ui/ModalDialog";
import { cn } from "@/lib/utils";
import { Tooltip } from "@/components/ui/Tooltip";

export type FormSubmissionItem = {
  id: string;
  data: Record<string, unknown>;
  created_at: string;
};

export type FieldMeta = {
  field_key: string;
  label: string;
  field_type: string;
  options?: string[];
};

const IST = "Asia/Kolkata";
function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: IST,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function FormResponsesView({
  formId,
  formTitle,
  submissions: initialSubmissions,
  fields,
}: {
  formId: string;
  formTitle: string;
  submissions: FormSubmissionItem[];
  fields: FieldMeta[];
}) {
  const [submissions, setSubmissions] = useState<FormSubmissionItem[]>(initialSubmissions);
  const [activeTab, setActiveTab] = useState<"summary" | "question" | "individual" | "table">("summary");
  const [individualIndex, setIndividualIndex] = useState(0);
  const [selectedQuestionKey, setSelectedQuestionKey] = useState<string>(fields[0]?.field_key || "");
  const [sheetsModalOpen, setSheetsModalOpen] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);
  const [, start] = useTransition();

  // Map field_key to label
  const labelMap: Record<string, string> = {};
  fields.forEach((f) => {
    labelMap[f.field_key] = f.label || f.field_key;
  });

  const formatKey = (key: string) => {
    if (labelMap[key]) return labelMap[key];
    return key.replace(/^field_/, "").replace(/_/g, " ").toUpperCase();
  };

  const formatVal = (val: unknown): string => {
    if (val === null || val === undefined || val === "") return "—";
    if (typeof val === "boolean") return val ? "Yes" : "No";
    if (Array.isArray(val)) return val.join(", ");
    return String(val);
  };

  const renderFieldValue = (val: unknown) => {
    if (val === null || val === undefined || val === "") return <span className="text-gray-400">—</span>;
    if (typeof val === "boolean") return <span>{val ? "Yes" : "No"}</span>;
    if (Array.isArray(val)) return <span>{val.join(", ")}</span>;

    const str = String(val);
    const isImage =
      str.startsWith("data:image/") ||
      str.startsWith("http://") ||
      str.startsWith("https://") ||
      str.startsWith("/uploads/") ||
      /\.(png|jpg|jpeg|webp|gif|svg)(\?.*)?$/i.test(str);

    if (isImage) {
      return (
        <div className="flex items-center gap-3 py-1">
          <a
            href={str}
            target="_blank"
            rel="noreferrer"
            className="group relative rounded-xl overflow-hidden border border-gray-200 shadow-xs block shrink-0"
          >
            <img
              src={str}
              alt="Uploaded media"
              className="w-16 h-16 object-cover group-hover:scale-105 transition-transform duration-200"
            />
            <div className="absolute inset-0 bg-navy/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
          </a>
          <div className="text-xs space-y-1">
            <a
              href={str}
              target="_blank"
              rel="noreferrer"
              className="text-navy font-semibold hover:text-red hover:underline flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3 text-red" /> View Full Image
            </a>
            <span className="text-[10px] text-gray-400 font-mono block truncate max-w-xs">{str}</span>
          </div>
        </div>
      );
    }

    return <span>{str}</span>;
  };

  const handleDeleteSubmission = (subId: string) => {
    showConfirm({
      title: "Delete Submission",
      message: "Are you sure you want to delete this submission? This action cannot be undone.",
      isDanger: true,
      confirmText: "Delete",
      onConfirm: () => {
        // 0ms Optimistic Delete
        setSubmissions((prev) => prev.filter((s) => s.id !== subId));
        if (individualIndex >= submissions.length - 1) {
          setIndividualIndex((i) => Math.max(i - 1, 0));
        }

        start(async () => {
          await deleteSubmissionAction(formId, subId);
          toast("Submission deleted", "success");
        });
      },
      onCancel: () => {},
    });
  };

  // CSV Export
  const downloadCSV = () => {
    if (submissions.length === 0) return;
    const keys = Array.from(
      new Set(submissions.flatMap((s) => Object.keys(s.data || {})))
    );
    const headers = ["Submission ID", "Submitted At", ...keys.map(formatKey)];

    const rows = submissions.map((s) => {
      const rowVals = keys.map((k) => {
        const raw = s.data?.[k];
        const formatted = formatVal(raw).replace(/"/g, '""');
        return `"${formatted}"`;
      });
      return [`"${s.id}"`, `"${fmtDate(s.created_at)}"`, ...rowVals].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${formTitle.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_responses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const questionKeys = Array.from(
    new Set([
      ...fields.map((f) => f.field_key),
      ...submissions.flatMap((s) => Object.keys(s.data || {})),
    ])
  );

  const sampleAppsScript = `function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var data = JSON.parse(e.postData.contents);
  var row = [new Date()];
  for (var key in data) {
    row.push(data[key]);
  }
  sheet.appendRow(row);
  return ContentService.createTextOutput("OK");
}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-inter pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/forms/${formId}`}
            className="p-2 text-navy/60 hover:text-navy hover:bg-gray-100 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-oswald text-2xl sm:text-3xl font-bold uppercase text-navy">
                {formTitle}
              </h1>
              <span className="bg-red/10 text-red text-xs font-oswald uppercase font-bold tracking-wider px-3 py-1 rounded-full">
                {submissions.length} {submissions.length === 1 ? "Response" : "Responses"}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">Google Forms style response analytics, individual questions & Google Sheets sync</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSheetsModalOpen(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-oswald uppercase tracking-widest text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-white" /> Link to Google Sheets
          </button>

          <button
            type="button"
            onClick={downloadCSV}
            disabled={submissions.length === 0}
            className="bg-navy hover:bg-red text-white font-oswald uppercase tracking-widest text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-white" /> Export CSV
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center bg-white border border-gray-200 p-1.5 rounded-2xl shadow-xs w-fit flex-wrap gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === "summary" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
          )}
        >
          <BarChart3 className="w-4 h-4 text-amber-400" /> Summary
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("question")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === "question" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
          )}
        >
          <QuestionIcon className="w-4 h-4 text-cyan-400" /> Question View
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("individual")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === "individual" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
          )}
        >
          <User className="w-4 h-4 text-red" /> Individual ({submissions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("table")}
          className={cn(
            "px-4 py-2 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all cursor-pointer flex items-center gap-1.5",
            activeTab === "table" ? "bg-navy text-white shadow-sm" : "text-navy/60 hover:text-navy"
          )}
        >
          <TableIcon className="w-4 h-4 text-emerald-400" /> Data Grid
        </button>
      </div>

      {/* 1. SUMMARY ANALYTICS VIEW */}
      {activeTab === "summary" && (
        <div className="space-y-6">
          {submissions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-sm font-bold uppercase text-navy">No responses submitted yet</p>
              <p className="text-xs">Responses will automatically appear here with chart analytics as users submit.</p>
            </div>
          ) : (
            questionKeys.map((key) => {
              const label = formatKey(key);
              const answers = submissions.map((s) => s.data?.[key]).filter((v) => v !== undefined && v !== null && v !== "");

              const counts: Record<string, number> = {};
              answers.forEach((ans) => {
                const str = formatVal(ans);
                counts[str] = (counts[str] || 0) + 1;
              });

              return (
                <div key={key} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <h3 className="font-oswald text-lg font-bold uppercase text-navy">
                      {label}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono">
                      {answers.length} {answers.length === 1 ? "response" : "responses"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(counts).map(([option, count]) => {
                      const pct = Math.round((count / submissions.length) * 100);
                      return (
                        <div key={option} className="space-y-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-navy">
                            <span>{option}</span>
                            <span className="text-gray-500 font-mono">
                              {count} ({pct}%)
                            </span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-navy rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* 2. QUESTION VIEW (INSPECT ONLY 1 SPECIFIC QUESTION) */}
      {activeTab === "question" && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {questionKeys.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <QuestionIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold uppercase text-navy">No questions available</p>
            </div>
          ) : (
            <>
              {/* Question Selector Bar */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-2">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-navy/70">
                  Select Question to Inspect
                </label>
                <select
                  value={selectedQuestionKey || questionKeys[0]}
                  onChange={(e) => setSelectedQuestionKey(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs font-bold text-navy focus:outline-none focus:border-red"
                >
                  {questionKeys.map((k) => (
                    <option key={k} value={k}>
                      {formatKey(k)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Individual Answers List for Selected Question */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h3 className="font-oswald text-xl font-bold uppercase text-navy">
                    {formatKey(selectedQuestionKey || questionKeys[0])}
                  </h3>
                  <span className="text-xs font-mono text-red font-bold">
                    {submissions.filter((s) => s.data?.[selectedQuestionKey || questionKeys[0]] !== undefined).length} Responses
                  </span>
                </div>

                <div className="space-y-2.5">
                  {submissions.map((sub, idx) => {
                    const ansVal = sub.data?.[selectedQuestionKey || questionKeys[0]];
                    return (
                      <div key={sub.id} className="p-3.5 bg-gray-50/80 rounded-xl border border-gray-200/80 flex items-start justify-between gap-4">
                        <div>
                          <div className="text-xs font-semibold text-navy">
                            {renderFieldValue(ansVal)}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                            Submitted: {fmtDate(sub.created_at)}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-white px-2 py-0.5 rounded border border-gray-200 shrink-0">
                          #{idx + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. INDIVIDUAL RESPONSE VIEW (WITH DELETE OPTION) */}
      {activeTab === "individual" && (
        <div className="space-y-6 max-w-3xl mx-auto">
          {submissions.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
              <User className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold uppercase text-navy">No responses submitted yet</p>
            </div>
          ) : (
            <>
              {/* Stepper, Selectable Dropdown & Delete Control Bar */}
              <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={individualIndex === 0}
                  onClick={() => setIndividualIndex((i) => Math.max(i - 1, 0))}
                  className="bg-gray-100 hover:bg-gray-200 text-navy px-4 py-2.5 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 shrink-0 w-full sm:w-auto justify-center"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                {/* Dropdown Selectable Jump Control with Response Snippets */}
                <div className="flex flex-col items-center gap-1 w-full sm:w-auto min-w-[240px] max-w-md">
                  <div className="relative w-full">
                    <select
                      value={individualIndex}
                      onChange={(e) => setIndividualIndex(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-300 hover:border-navy text-navy font-oswald text-xs sm:text-sm font-bold uppercase rounded-xl px-3 py-2 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 cursor-pointer text-center appearance-none pr-8 shadow-xs"
                    >
                      {submissions.map((sub, idx) => {
                        const valuesList = Object.values(sub.data || {})
                          .filter((v) => typeof v === "string" && v.trim() && !v.startsWith("data:image/") && !v.startsWith("http"))
                          .map(String);
                        const labelSnippet = valuesList.length > 0 ? ` • ${valuesList.slice(0, 2).join(" | ").slice(0, 26)}` : "";
                        return (
                          <option key={sub.id} value={idx}>
                            Response {idx + 1} of {submissions.length}{labelSnippet}
                          </option>
                        );
                      })}
                    </select>
                    <ChevronDown className="w-4 h-4 text-navy pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono text-center">
                    Submitted: {fmtDate(submissions[individualIndex]?.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-center">
                  <Tooltip tip="Delete Submission" side="bottom">
                    <button
                      type="button"
                      onClick={() => handleDeleteSubmission(submissions[individualIndex].id)}
                      className="p-2 text-red/70 hover:text-red hover:bg-red/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red/20"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </Tooltip>

                  <button
                    type="button"
                    disabled={individualIndex === submissions.length - 1}
                    onClick={() => setIndividualIndex((i) => Math.min(i + 1, submissions.length - 1))}
                    className="bg-navy hover:bg-red text-white px-4 py-2.5 rounded-xl text-xs font-oswald uppercase tracking-wider font-bold transition-all disabled:opacity-40 cursor-pointer flex items-center gap-1 w-full sm:w-auto justify-center"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Response Card */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
                {questionKeys.map((key) => {
                  const label = formatKey(key);
                  const val = submissions[individualIndex]?.data?.[key];
                  return (
                    <div key={key} className="border-b border-gray-100 pb-4 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-widest text-gray-500 block">
                        {label}
                      </span>
                      <div className="text-sm font-semibold text-navy break-words">
                        {renderFieldValue(val)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* 4. FULL DATA GRID TABLE VIEW (WITH DELETE OPTION) */}
      {activeTab === "table" && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <TableIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
              <p className="text-sm font-bold uppercase text-navy">No responses submitted yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-navy font-oswald uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">#</th>
                    <th className="p-3.5">Actions</th>
                    <th className="p-3.5">Submitted At</th>
                    {questionKeys.map((k) => (
                      <th key={k} className="p-3.5 whitespace-nowrap">
                        {formatKey(k)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {submissions.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-gray-400">{idx + 1}</td>
                      <td className="p-3.5 whitespace-nowrap">
                        <Tooltip tip="Delete Row" side="right">
                          <button
                            type="button"
                            onClick={() => handleDeleteSubmission(sub.id)}
                            className="p-1 text-red/70 hover:text-red hover:bg-red/10 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip>
                      </td>
                      <td className="p-3.5 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                        {fmtDate(sub.created_at)}
                      </td>
                      {questionKeys.map((k) => (
                        <td key={k} className="p-3.5 text-navy max-w-xs truncate">
                          {renderFieldValue(sub.data?.[k])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Google Sheets Link Guide Modal */}
      {sheetsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-xl w-full shadow-2xl space-y-4 border border-gray-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-oswald text-lg font-bold uppercase text-navy flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> Link to Google Sheets Live
              </h3>
              <button
                type="button"
                onClick={() => setSheetsModalOpen(false)}
                className="text-gray-400 hover:text-navy p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              You can automatically sync every form response directly into a live Google Sheet in real-time using Google Apps Script or CSV Export:
            </p>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                <span className="font-bold text-emerald-900 block">Method 1: 1-Click CSV Export (Instant)</span>
                <p className="text-emerald-800 text-[11px]">
                  Click the <strong>&quot;Export CSV&quot;</strong> button at the top right to download all current responses as a `.csv` file. Open Google Sheets, go to <em>File → Import</em>, and select the CSV file.
                </p>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-navy">Method 2: Automatic Real-Time Google Apps Script Webhook</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sampleAppsScript);
                      setCopiedScript(true);
                      setTimeout(() => setCopiedScript(false), 2000);
                    }}
                    className="text-[10px] bg-navy text-white px-2.5 py-1 rounded-md font-bold hover:bg-red transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedScript ? "Copied Script" : "Copy Script"}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500">
                  Open your Google Sheet → <em>Extensions → Apps Script</em> → paste this snippet → click <em>Deploy as Web App</em>.
                </p>
                <pre className="bg-navy text-white font-mono text-[10px] p-2.5 rounded-lg overflow-x-auto max-h-32">
                  {sampleAppsScript}
                </pre>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <button
                type="button"
                onClick={() => setSheetsModalOpen(false)}
                className="bg-navy text-white text-xs font-oswald uppercase tracking-widest font-bold px-6 py-2.5 rounded-xl transition-colors cursor-pointer"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
