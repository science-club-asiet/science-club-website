"use client";

import React, { useState, useRef, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  name?: string;
  value?: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  showTime?: boolean;
  className?: string;
}

export function DatePicker({
  name,
  value = "",
  onChange,
  placeholder,
  required = false,
  disabled = false,
  showTime = false,
  className,
}: DatePickerProps) {
  // Parse initial value (ISO or YYYY-MM-DD or YYYY-MM-DDTHH:mm)
  const parseVal = (raw: string) => {
    if (!raw) return { dateStr: "", timeStr: "10:00" };
    if (raw.includes("T")) {
      const [d, t] = raw.split("T");
      return { dateStr: d, timeStr: t ? t.slice(0, 5) : "10:00" };
    }
    if (raw.includes(" ")) {
      const [d, t] = raw.split(" ");
      return { dateStr: d, timeStr: t ? t.slice(0, 5) : "10:00" };
    }
    return { dateStr: raw, timeStr: "10:00" };
  };

  const parsed = parseVal(value);
  const [typedDate, setTypedDate] = useState<string>(parsed.dateStr);
  const [typedTime, setTypedTime] = useState<string>(parsed.timeStr);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (parsed.dateStr && !isNaN(new Date(parsed.dateStr).getTime())) {
      return new Date(parsed.dateStr);
    }
    return new Date();
  });

  const popoverRef = useRef<HTMLDivElement>(null);

  // Sync internal state when value prop changes externally
  useEffect(() => {
    const p = parseVal(value);
    setTypedDate(p.dateStr);
    setTypedTime(p.timeStr);
  }, [value]);

  // Handle click outside to close popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const notifyChange = (newDate: string, newTime: string) => {
    if (!onChange) return;
    if (!newDate) {
      onChange("");
      return;
    }
    if (showTime) {
      const combined = `${newDate}T${newTime || "10:00"}`;
      onChange(combined);
    } else {
      onChange(newDate);
    }
  };

  // Format YYYY-MM-DD input mask
  const formatInput = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 8);
    if (digits.length <= 4) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setTypedDate(formatted);
    notifyChange(formatted, typedTime);

    if (formatted.length === 10) {
      const p = new Date(formatted);
      if (!isNaN(p.getTime())) {
        setViewDate(p);
      }
    }
  };

  const handleTimeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTypedTime(val);
    notifyChange(typedDate, val);
  };

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handleSelectDay = (day: number) => {
    const y = viewDate.getFullYear();
    const m = String(viewDate.getMonth() + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;
    setTypedDate(dateStr);
    notifyChange(dateStr, typedTime);
    if (!showTime) setIsOpen(false);
  };

  const changeMonth = (delta: number) => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + delta, 1));
  };

  const combinedOutputValue = showTime && typedDate ? `${typedDate}T${typedTime || "10:00"}` : typedDate;

  return (
    <div ref={popoverRef} className="relative w-full">
      {name && <input type="hidden" name={name} value={combinedOutputValue} required={required} />}

      <div className="relative flex items-center">
        <input
          type="text"
          value={typedDate}
          onChange={handleDateInputChange}
          placeholder={placeholder || (showTime ? "YYYY-MM-DD" : "YYYY-MM-DD")}
          maxLength={10}
          required={required}
          disabled={disabled}
          className={cn(
            "w-full bg-white border border-gray-200 rounded-xl pl-3 pr-16 py-2.5 text-xs text-navy font-mono focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10 transition-all shadow-xs disabled:opacity-50",
            className
          )}
        />

        <div className="absolute right-2.5 flex items-center gap-1">
          {typedDate && (
            <button
              type="button"
              onClick={() => {
                setTypedDate("");
                notifyChange("", typedTime);
              }}
              className="text-gray-400 hover:text-navy p-1 transition-colors rounded"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <Tooltip tip="Open Calendar Picker" side="top">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              disabled={disabled}
              className="text-red hover:text-navy p-1 transition-colors cursor-pointer rounded"
            >
              <Calendar className="w-4 h-4" />
            </button>
          </Tooltip>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-white border border-gray-200 rounded-2xl p-4 shadow-2xl w-72 space-y-3 animate-in fade-in zoom-in-95 duration-150 font-inter">
          {/* Month Header Navigation */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <button
              type="button"
              onClick={() => changeMonth(-1)}
              className="p-1 text-navy hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-oswald text-xs uppercase font-bold text-navy tracking-wider">
              {monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => changeMonth(1)}
              className="p-1 text-navy hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center font-mono text-[10px] text-gray-400 font-bold uppercase">
            <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const y = viewDate.getFullYear();
              const m = String(viewDate.getMonth() + 1).padStart(2, "0");
              const d = String(day).padStart(2, "0");
              const currentStr = `${y}-${m}-${d}`;
              const isSelected = typedDate === currentStr;
              const isToday = new Date().toISOString().slice(0, 10) === currentStr;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    "h-8 rounded-lg text-xs font-mono transition-all flex items-center justify-center font-medium",
                    isSelected
                      ? "bg-red text-white font-bold shadow-xs"
                      : isToday
                      ? "bg-navy/10 text-navy font-bold hover:bg-navy/20"
                      : "text-navy hover:bg-gray-100"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Optional Time Picker Row */}
          {showTime && (
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold text-navy/70 uppercase tracking-wider flex items-center gap-1 font-oswald">
                <Clock className="w-3.5 h-3.5 text-red" /> Time
              </span>
              <input
                type="time"
                value={typedTime}
                onChange={handleTimeInputChange}
                className="border border-gray-200 rounded-lg text-xs px-2 py-1 font-mono text-navy focus:outline-none focus:border-red bg-gray-50"
              />
            </div>
          )}

          <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => {
                const today = new Date().toISOString().slice(0, 10);
                setTypedDate(today);
                setViewDate(new Date());
                notifyChange(today, typedTime);
                if (!showTime) setIsOpen(false);
              }}
              className="text-red hover:underline font-bold"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="bg-navy text-white font-oswald uppercase text-[10px] px-3 py-1 rounded-md font-bold hover:bg-navy/90"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
