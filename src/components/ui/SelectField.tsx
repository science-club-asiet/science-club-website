"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Optional placeholder shown as first disabled option */
  placeholder?: string;
}

/**
 * Styled <select> wrapper.
 * Replaces all bare native <select> elements with a consistently-branded field.
 * Matches the inputCls token from primitives.tsx (navy border, red focus ring).
 *
 * Usage:
 *   <SelectField value={v} onChange={e => setV(e.target.value)}>
 *     <option value="a">Option A</option>
 *   </SelectField>
 *
 *   // With placeholder:
 *   <SelectField placeholder="Choose a role" defaultValue="">
 *     <option value="member">Member</option>
 *   </SelectField>
 */
export function SelectField({
  className,
  children,
  placeholder,
  ...props
}: SelectFieldProps) {
  return (
    <span className="relative inline-flex w-full">
      <select
        {...props}
        className={cn(
          // base — matches inputCls from primitives but with appearance-none to kill the OS arrow
          "w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-navy",
          "placeholder:text-gray-400 focus:outline-none focus:border-red focus:ring-2 focus:ring-red/10",
          "transition-all duration-200 hover:border-gray-300 shadow-sm cursor-pointer",
          // disabled state
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children}
      </select>
      {/* Custom chevron — replaces the OS-native arrow */}
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400">
        <ChevronDown className="w-3.5 h-3.5" />
      </span>
    </span>
  );
}
