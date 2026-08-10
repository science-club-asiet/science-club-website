"use client";

import { useState, useRef, useTransition, useMemo, useEffect } from "react";
import { submitFormAction } from "@/lib/admin/formActions";
import type { PublicForm, PublicFormField } from "@/lib/data/forms";
import { Upload, CheckCircle2, ArrowLeft, ArrowRight, Calendar, ChevronLeft, ChevronRight, Loader2, FileCheck, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadThing } from "@/lib/uploadthing";
import { SelectField } from "@/components/ui/SelectField";
import { Tooltip } from "@/components/ui/Tooltip";

const base =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-navy focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all shadow-xs";

function CustomDatePicker({
  name,
  required,
  placeholder,
  value,
  onChange,
}: {
  name: string;
  required?: boolean;
  placeholder?: string;
  value?: string;
  onChange?: (val: string) => void;
}) {
  const [typedValue, setTypedValue] = useState<string>(value || "");
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Auto-mask formatter: YYYY-MM-DD
  const formatInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setTypedValue(formatted);
    if (onChange) onChange(formatted);

    if (formatted.length === 10) {
      const parsed = new Date(formatted);
      if (!isNaN(parsed.getTime())) {
        setViewDate(parsed);
      }
    }
  };

  const handleSelectDay = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    setTypedValue(dateStr);
    if (onChange) onChange(dateStr);
    setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  return (
    <div className="relative w-full">
      <input type="hidden" name={name} value={typedValue} required={required} />
      <div className="relative flex items-center">
        <input
          type="text"
          value={typedValue}
          onChange={handleInputChange}
          placeholder={placeholder || "YYYY-MM-DD"}
          maxLength={10}
          required={required}
          className={`${base} pr-10 font-mono text-xs`}
        />
        <Tooltip tip="Toggle Calendar" side="right">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="absolute right-3 text-red hover:text-navy p-1 transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </Tooltip>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl p-4 shadow-xl w-72 space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-navy transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-oswald text-sm font-bold uppercase text-navy">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1.5 hover:bg-gray-100 rounded-lg text-navy transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-[10px] font-bold text-gray-400 uppercase">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty_${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const y = viewDate.getFullYear();
              const m = String(viewDate.getMonth() + 1).padStart(2, "0");
              const d = String(day).padStart(2, "0");
              const dateStr = `${y}-${m}-${d}`;
              const isSelected = typedValue === dateStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "p-2 rounded-lg font-semibold transition-all cursor-pointer",
                    isSelected
                      ? "bg-red text-white font-bold shadow-xs"
                      : "hover:bg-gray-100 text-navy"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function FileUploadField({
  f,
  onAnswerChange,
  initialValue,
}: {
  f: PublicFormField;
  onAnswerChange: (key: string, val: any) => void;
  initialValue?: string;
}) {
  // Seed from initialValue so state survives section navigation (component remounts)
  const isUrl = (v?: string) => typeof v === "string" && v.startsWith("http");
  const [selectedFileName, setSelectedFileName] = useState<string>(
    () => (isUrl(initialValue) ? initialValue!.split("/").pop() ?? "" : "")
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    () => (isUrl(initialValue) ? initialValue! : null)
  );
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    () => (isUrl(initialValue) ? initialValue! : null)
  );
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const folder = f.uploadFolder || "forms";

  const { startUpload } = useUploadThing("formFileUploader", {
    onUploadBegin: () => { setIsUploading(true); setUploadError(null); },
    onClientUploadComplete: (res) => {
      setIsUploading(false);
      const url = res?.[0]?.url;
      if (url) {
        setUploadedUrl(url);
        onAnswerChange(f.fieldKey, url);
      }
    },
    onUploadError: (err) => {
      setIsUploading(false);
      setUploadError(err.message || "Upload failed. Please try again.");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setSelectedFileName("");
      setPreviewUrl(null);
      setUploadedUrl(null);
      onAnswerChange(f.fieldKey, "");
      return;
    }

    setSelectedFileName(file.name);
    setUploadedUrl(null);
    setUploadError(null);

    // Show instant local preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (evt) => setPreviewUrl(evt.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // Upload to UploadThing → registers in media_assets with the right folder
    await startUpload([file], { folder });
  };

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-2xl p-6 text-center transition-all relative space-y-2 select-none",
        isUploading ? "border-red/50 bg-red/5 cursor-wait" : "border-gray-200 hover:border-red bg-gray-50/50 hover:bg-gray-50 cursor-pointer"
      )}
    >
      {isUploading ? (
        <Loader2 className="w-8 h-8 text-red mx-auto animate-spin" />
      ) : previewUrl ? (
        <img src={previewUrl} alt="Preview" className="w-20 h-20 object-cover rounded-xl mx-auto border border-gray-200 shadow-sm" />
      ) : selectedFileName ? (
        <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
      ) : (
        <Upload className="w-7 h-7 text-gray-400 mx-auto" />
      )}

      <input
        ref={inputRef}
        type="file"
        required={f.required && !uploadedUrl}
        className="hidden"
        id={`file_${f.fieldKey}`}
        onChange={handleFileChange}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Store the uploaded URL as a hidden field so FormData picks it up */}
      {uploadedUrl && (
        <input type="hidden" name={f.fieldKey} value={uploadedUrl} />
      )}

      <div>
        <p className="text-xs font-bold text-navy">
          {isUploading ? (
            <span className="text-red font-bold block">Uploading to media library...</span>
          ) : uploadedUrl ? (
            <span className="text-emerald-700 font-bold block truncate max-w-md mx-auto">
              ✓ Uploaded: {selectedFileName}
            </span>
          ) : selectedFileName ? (
            <span className="text-amber-600 font-bold block truncate max-w-md mx-auto">
              {selectedFileName} — uploading...
            </span>
          ) : (
            "Click anywhere in this box to choose a file"
          )}
        </p>
        {uploadError && (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-red font-semibold mt-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            {uploadError}
          </div>
        )}
        {!uploadError && (
          <span className="text-[10px] text-gray-400 block mt-1">
            Max {f.maxFiles} file(s), up to {f.maxFileSize}
          </span>
        )}
      </div>
    </div>
  );
}

function Field({
  f,
  answers,
  onAnswerChange,
}: {
  f: PublicFormField;
  answers: Record<string, any>;
  onAnswerChange: (key: string, val: any) => void;
}) {
  const common = {
    id: f.fieldKey,
    name: f.fieldKey,
    required: f.required,
    placeholder: f.placeholder,
    value: answers[f.fieldKey] ?? "",
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      onAnswerChange(f.fieldKey, e.target.value),
  };
  const [otherSelected, setOtherSelected] = useState(false);

  switch (f.fieldType) {
    case "textarea":
      return <textarea {...common} rows={4} className={base} />;

    case "select":
      return (
        <SelectField {...common} className={base}>
          <option value="" disabled>
            {f.placeholder || "Choose option..."}
          </option>
          {f.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </SelectField>
      );

    case "multiselect":
      const currentArr: string[] = Array.isArray(answers[f.fieldKey]) ? answers[f.fieldKey] : [];
      const handleCheckboxChange = (optVal: string, checked: boolean) => {
        let updated = [...currentArr];
        if (checked) {
          if (!updated.includes(optVal)) updated.push(optVal);
        } else {
          updated = updated.filter((x) => x !== optVal);
        }
        onAnswerChange(f.fieldKey, updated);
      };

      return (
        <div className="flex flex-col gap-2.5 pt-1">
          {f.options.map((o) => (
            <label key={o} className="flex items-center gap-2.5 text-xs text-navy cursor-pointer hover:text-red transition-colors">
              <input
                type="checkbox"
                name={f.fieldKey}
                value={o}
                checked={currentArr.includes(o)}
                onChange={(e) => handleCheckboxChange(o, e.target.checked)}
                className="accent-red w-4 h-4 rounded cursor-pointer"
              />{" "}
              {o}
            </label>
          ))}
          {f.allowOther && (
            <label className="flex items-center gap-2.5 text-xs text-navy cursor-pointer">
              <input
                type="checkbox"
                className="accent-red w-4 h-4 rounded cursor-pointer"
                onChange={(e) => setOtherSelected(e.target.checked)}
              />
              <span className="font-medium">Other:</span>
              <input
                type="text"
                placeholder="Specify..."
                onChange={(e) => {
                  if (otherSelected) handleCheckboxChange(`Other: ${e.target.value}`, true);
                }}
                className="border-b border-gray-300 text-xs px-2 py-1 focus:outline-none focus:border-red"
              />
            </label>
          )}
        </div>
      );

    case "radio":
      return (
        <div className="flex flex-col gap-2.5 pt-1">
          {f.options.map((o) => (
            <label key={o} className="flex items-center gap-2.5 text-xs text-navy cursor-pointer hover:text-red transition-colors">
              <input
                type="radio"
                name={f.fieldKey}
                value={o}
                checked={answers[f.fieldKey] === o}
                onChange={() => onAnswerChange(f.fieldKey, o)}
                required={f.required && !otherSelected}
                className="accent-red w-4 h-4 cursor-pointer"
              />{" "}
              {o}
            </label>
          ))}
          {f.allowOther && (
            <label className="flex items-center gap-2.5 text-xs text-navy cursor-pointer">
              <input
                type="radio"
                name={f.fieldKey}
                value="other"
                onChange={() => setOtherSelected(true)}
                className="accent-red w-4 h-4 cursor-pointer"
              />
              <span className="font-medium">Other:</span>
              <input
                type="text"
                placeholder="Specify..."
                onChange={(e) => {
                  if (otherSelected) onAnswerChange(f.fieldKey, e.target.value);
                }}
                className="border-b border-gray-300 text-xs px-2 py-1 focus:outline-none focus:border-red"
              />
            </label>
          )}
        </div>
      );

    case "scale":
      return (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-xs text-gray-400 font-semibold uppercase tracking-wider">
            <span>{f.scaleMinLabel}</span>
            <span>{f.scaleMaxLabel}</span>
          </div>
          <div className="flex items-center justify-between gap-1 bg-gray-50 p-4 rounded-xl border border-gray-200">
            {Array.from(
              { length: (f.scaleMax ?? 5) - (f.scaleMin ?? 1) + 1 },
              (_, i) => (f.scaleMin ?? 1) + i
            ).map((val) => (
              <label key={val} className="flex flex-col items-center gap-2 cursor-pointer group">
                <span className="text-xs font-bold text-navy group-hover:text-red transition-colors">{val}</span>
                <input
                  type="radio"
                  name={f.fieldKey}
                  value={val}
                  checked={String(answers[f.fieldKey]) === String(val)}
                  onChange={() => onAnswerChange(f.fieldKey, String(val))}
                  required={f.required}
                  className="accent-red w-4 h-4 cursor-pointer"
                />
              </label>
            ))}
          </div>
        </div>
      );

    case "file":
      return <FileUploadField f={f} onAnswerChange={onAnswerChange} initialValue={answers[f.fieldKey] ? String(answers[f.fieldKey]) : undefined} />;

    case "checkbox":
      return (
        <label className="flex items-center gap-2.5 text-xs text-navy cursor-pointer select-none">
          <input
            type="checkbox"
            name={f.fieldKey}
            checked={Boolean(answers[f.fieldKey])}
            onChange={(e) => onAnswerChange(f.fieldKey, e.target.checked)}
            required={f.required}
            className="accent-red w-4 h-4 rounded cursor-pointer"
          />
          <span className="font-semibold uppercase tracking-wider">{f.label}</span>
        </label>
      );

    case "time":
      return <input {...common} type="time" className={base} />;

    case "date":
      return (
        <CustomDatePicker
          name={f.fieldKey}
          required={f.required}
          placeholder={f.placeholder}
          value={answers[f.fieldKey]}
          onChange={(val) => onAnswerChange(f.fieldKey, val)}
        />
      );

    default:
      return <input {...common} type="text" className={base} />;
  }
}

export function FormRenderer({ form, eventId }: { form: PublicForm; eventId?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isSubmitting, startTransition] = useTransition();
  const [submitResult, setSubmitResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const activeStepRef = useRef(currentStep);
  const isAdvancingRef = useRef(false);

  useEffect(() => {
    activeStepRef.current = currentStep;
  }, [currentStep]);

  const handleAnswerChange = (key: string, val: any) => {
    console.log("[FormRenderer] Answer changed:", key, "=", val);
    setAnswers((prev) => ({ ...prev, [key]: val }));
  };

  // Robust Section Step Grouping Algorithm
  const sections: { title?: string; help?: string; fields: PublicFormField[] }[] = [];
  let currentSec: { title?: string; help?: string; fields: PublicFormField[] } | null = null;

  for (const f of form.fields) {
    if (f.fieldType === "section") {
      if (currentSec && currentSec.fields.length > 0) {
        sections.push(currentSec);
      }
      currentSec = { title: f.label, help: f.helpText, fields: [] };
    } else {
      if (!currentSec) {
        currentSec = { title: "Section 1", fields: [] };
      }
      currentSec.fields.push(f);
    }
  }
  if (currentSec && (currentSec.fields.length > 0 || sections.length === 0)) {
    sections.push(currentSec);
  }

  const totalSteps = sections.length > 0 ? sections.length : 1;
  const activeSection = sections[currentStep] || { fields: form.fields };

  console.log(`[FormRenderer RENDER] Form: "${form.title}" | Step: ${currentStep + 1} of ${totalSteps} | Active Fields Count: ${activeSection.fields?.length || 0}`);
  console.log("[FormRenderer RENDER] All Sections:", sections);

  if (submitResult?.ok) {
    console.log("[FormRenderer RENDER] Submit Result Success!");
    return (
      <div className="rounded-2xl border-2 border-dashed border-red/30 p-8 sm:p-10 text-center space-y-3 bg-white">
        <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto" />
        <h3 className="font-oswald text-2xl font-bold uppercase text-navy">
          Response Submitted
        </h3>
        <p className="text-sm text-gray-600 max-w-md mx-auto">
          {form.confirmationMessage || "Thank you! Your response has been recorded."}
        </p>

        {form.showSubmitAnother !== false && (
          <div className="pt-4">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-xs font-oswald uppercase tracking-widest font-bold text-navy hover:text-red transition-colors underline cursor-pointer"
            >
              Submit another response
            </button>
          </div>
        )}
      </div>
    );
  }

  const handleNextStep = () => {
    console.log(`[FormRenderer handleNextStep] Called at Step ${currentStep + 1} of ${totalSteps}`);
    if (!formRef.current) return;

    // Validate active section inputs specifically
    const activeInputs = Array.from(
      formRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input:not([type=hidden]), textarea, select"
      )
    );

    console.log(`[FormRenderer handleNextStep] Active Inputs Count to Validate: ${activeInputs.length}`);

    for (const input of activeInputs) {
      console.log(`[FormRenderer handleNextStep] Checking input name="${input.name}" required=${input.required} value="${input.value}" valid=${input.checkValidity()}`);
      if (!input.checkValidity()) {
        console.warn(`[FormRenderer handleNextStep] Input name="${input.name}" FAILED validation! Reporting validity.`);
        input.reportValidity();
        return;
      }
    }

    if (currentStep < totalSteps - 1) {
      console.log(`[FormRenderer handleNextStep] SUCCESS -> Advancing from Step ${currentStep + 1} to Step ${currentStep + 2}`);
      isAdvancingRef.current = true;
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      setTimeout(() => {
        isAdvancingRef.current = false;
      }, 400);
    } else {
      console.warn(`[FormRenderer handleNextStep] Already on last step (${currentStep + 1} of ${totalSteps}). Not advancing.`);
    }
  };

  const handleFinalSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    console.log(`[FormRenderer handleFinalSubmit] Triggered at Step ${currentStep + 1} of ${totalSteps} (activeStepRef=${activeStepRef.current + 1}, isAdvancing=${isAdvancingRef.current})`);

    if (!formRef.current) return;

    // Failsafe 1: Refuse submission if a step transition is actively occurring
    if (isAdvancingRef.current) {
      console.warn("[FormRenderer handleFinalSubmit] REJECTED SUBMISSION because isAdvancingRef is true (Step transition in progress!)");
      return;
    }

    // Failsafe 2: Refuse submission unless activeStepRef was strictly on the last step
    if (activeStepRef.current < totalSteps - 1) {
      console.warn(`[FormRenderer handleFinalSubmit] REJECTED SUBMISSION because activeStepRef (${activeStepRef.current + 1}) < totalSteps (${totalSteps}).`);
      return;
    }

    // Validate active section inputs before final submission
    const activeInputs = Array.from(
      formRef.current.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
        "input:not([type=hidden]), textarea, select"
      )
    );

    for (const input of activeInputs) {
      console.log(`[FormRenderer handleFinalSubmit] Checking input name="${input.name}" required=${input.required} value="${input.value}" valid=${input.checkValidity()}`);
      if (!input.checkValidity()) {
        console.warn(`[FormRenderer handleFinalSubmit] Input name="${input.name}" FAILED validation! Stopping submit.`);
        input.reportValidity();
        return;
      }
    }

    console.log("[FormRenderer handleFinalSubmit] All inputs valid. Preparing FormData for server submission...");
    const formData = new FormData(formRef.current);

    // Merge answers from previous sections into FormData
    Object.entries(answers).forEach(([k, v]) => {
      if (!formData.has(k)) {
        if (Array.isArray(v)) {
          v.forEach((item) => formData.append(k, item));
        } else if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      }
    });

    console.log("[FormRenderer handleFinalSubmit] Calling submitFormAction...");
    startTransition(async () => {
      const res = await submitFormAction(form.id, null, formData);
      console.log("[FormRenderer handleFinalSubmit] Server Result:", res);
      setSubmitResult(res);
    });
  };

  return (
    <form
      ref={formRef}
      encType="multipart/form-data"
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log(`[FormRenderer onSubmit] Form submit event caught at Step ${currentStep + 1} of ${totalSteps}`);
        if (currentStep === totalSteps - 1) {
          handleFinalSubmit(e);
        } else {
          console.log(`[FormRenderer onSubmit] Blocked submit on step ${currentStep + 1} (Not last step)`);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" && (e.target as HTMLElement).tagName !== "TEXTAREA") {
          console.log(`[FormRenderer onKeyDown Enter] Caught Enter key at Step ${currentStep + 1} of ${totalSteps}`);
          e.preventDefault();
          e.stopPropagation();
          if (currentStep < totalSteps - 1) {
            handleNextStep();
          }
        }
      }}
      className="flex flex-col gap-6 max-w-2xl mx-auto"
    >
      <input name="_hp" type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {eventId && <input type="hidden" name="_event_id" value={eventId} />}

      {/* Preserve Answers of Previous Steps as Hidden Inputs */}
      {Object.entries(answers).map(([k, v]) => {
        if (Array.isArray(v)) {
          return v.map((item, idx) => (
            <input key={`${k}_${idx}`} type="hidden" name={k} value={item} />
          ));
        }
        return <input key={k} type="hidden" name={k} value={String(v)} />;
      })}

      {/* Progress Bar & Step Header */}
      {totalSteps > 1 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs text-navy font-bold">
            <span className="font-oswald uppercase text-red tracking-wider">
              Section {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-gray-400 font-mono text-[10px]">
              {Math.round(((currentStep + 1) / totalSteps) * 100)}% Completed
            </span>
          </div>

          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-red transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] rounded-full"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>

          {activeSection.title && (
            <div className="pt-2 border-t border-gray-100 mt-2">
              <h3 className="font-oswald text-2xl font-bold uppercase text-navy border-l-4 border-red pl-3">
                {activeSection.title}
              </h3>
              {activeSection.help && <p className="text-xs text-gray-500 pl-4 mt-1">{activeSection.help}</p>}
            </div>
          )}
        </div>
      )}

      {/* Render Questions inside Card Containers */}
      <div className="space-y-4">
        {activeSection.fields.map((f) => {
          if (f.fieldType === "image") {
            return (
              <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-3">
                <h3 className="font-oswald text-xl font-bold uppercase text-navy">
                  {f.label || "Image Block"}
                </h3>
                {f.helpText && <p className="text-xs text-gray-500">{f.helpText}</p>}
                {f.imageUrl && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 max-h-96 bg-black/5 flex items-center justify-center mt-2">
                    <img src={f.imageUrl} alt={f.label} className="max-h-96 object-contain" />
                  </div>
                )}
              </div>
            );
          }

          return (
            <div key={f.id} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-xs hover:border-gray-300 transition-all space-y-3">
              {f.fieldType !== "checkbox" && (
                <label htmlFor={f.fieldKey} className="text-xs font-bold uppercase tracking-widest text-navy block">
                  {f.label}
                  {f.required && <span className="text-red font-bold"> *</span>}
                </label>
              )}

              {f.helpText && <p className="text-xs text-gray-400">{f.helpText}</p>}

              {f.imageUrl && (
                <img src={f.imageUrl} alt="" className="max-h-56 rounded-xl border border-gray-200 object-cover my-2" />
              )}

              <Field f={f} answers={answers} onAnswerChange={handleAnswerChange} />
            </div>
          );
        })}
      </div>

      {submitResult?.error && (
        <div className="p-4 bg-red/10 border border-red/20 rounded-2xl text-red text-xs font-semibold">
          {submitResult.error}
        </div>
      )}

      {/* Navigation & Submission Controls */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {currentStep > 0 ? (
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            className="bg-white border border-gray-300 hover:border-navy text-navy py-3 px-7 rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
        ) : <div />}

        {currentStep < totalSteps - 1 ? (
          <button
            type="button"
            onClick={handleNextStep}
            className="bg-navy hover:bg-red text-white py-3 px-9 rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-2"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-red hover:bg-navy text-white py-3.5 px-10 rounded-full font-oswald uppercase tracking-widest text-xs font-bold transition-all disabled:opacity-60 shadow-md cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting…
              </>
            ) : (
              "Submit Response"
            )}
          </button>
        )}
      </div>
    </form>
  );
}
