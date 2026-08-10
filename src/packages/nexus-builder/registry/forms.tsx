import React, { createContext, useContext } from "react";
import { useNode } from "@craftjs/core";
import {
  FormInput, Mail, TextCursorInput, ChevronDownSquare, CheckSquare, CircleDot, MousePointerClick,
} from "lucide-react";
import type { FieldSchema, RegistryEntry } from "./types";

/**
 * Supplies the bound server action to public <form> nodes. The public form page
 * wraps the rendered tree in this provider; inside the editor it's absent, so
 * forms simply prevent subm: no accidental posts while designing.
 */
export const FormActionContext = createContext<null | {
  action: (formData: FormData) => void | Promise<void>;
}>(null);

const inputCls = "w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 bg-white";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";

// ── Form wrapper (canvas) ────────────────────────────────────────────────────
const PublicForm = ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => {
  const ctx = useContext(FormActionContext);
  if (!ctx) return <form style={style} onSubmit={(e) => e.preventDefault()}>{children}</form>;
  return (
    <form style={style} action={ctx.action}>
      {children}
      <input type="text" name="_hp" tabIndex={-1} autoComplete="off" aria-hidden style={{ position: "absolute", left: "-9999px" }} />
    </form>
  );
};

const FormEditor = (props: { style?: React.CSSProperties; children?: React.ReactNode }) => {
  const { connectors: { connect, drag } } = useNode();
  return (
    <form
      ref={(r) => { if (r) connect(drag(r)); }}
      style={props.style}
      onSubmit={(e) => e.preventDefault()}
    >
      {props.children}
    </form>
  );
};
FormEditor.craft = {
  displayName: "Form",
  props: { style: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px", width: "100%" } },
  rules: { canDrag: () => true },
};

// ── Field helpers ────────────────────────────────────────────────────────────
const fieldWrapStyle = { marginBottom: "16px", width: "100%", display: "block" };
const baseFieldSettings: FieldSchema[] = [
  { kind: "text", name: "label", label: "Label" },
  { kind: "text", name: "name", label: "Field name (data key)" },
  { kind: "text", name: "placeholder", label: "Placeholder" },
  { kind: "text", name: "helpText", label: "Help text" },
  { kind: "toggle", name: "required", label: "Required" },
];
const helpEl = (t?: string) => (t ? <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>{t}</p> : null);

type InputFieldProps = {
  label?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  helpText?: string;
  style?: React.CSSProperties;
};

function inputField(
  type: string,
  label: string,
  icon: RegistryEntry["icon"],
  inputType: string,
  defaultLabel: string,
  defaultName: string
): RegistryEntry {
  return {
    type,
    label,
    icon,
    category: "forms",
    editorInert: true,
    render: ({ label: lbl, name, placeholder, required, helpText, style }: InputFieldProps) => (
      <div style={style}>
        <label className={labelCls}>{lbl}{required ? " *" : ""}</label>
        <input type={inputType} name={name} placeholder={placeholder} required={required} className={inputCls} />
        {helpEl(helpText)}
      </div>
    ),
    defaultProps: { label: defaultLabel, name: defaultName, placeholder: "", helpText: "", required: false, style: { ...fieldWrapStyle } },
    settings: baseFieldSettings,
  };
}

export const formEntries: RegistryEntry[] = [
  {
    type: "Form",
    label: "Form",
    icon: FormInput,
    category: "forms",
    isCanvas: true,
    render: ({ style, children }: { style?: React.CSSProperties; children?: React.ReactNode }) => (
      <PublicForm style={style}>{children}</PublicForm>
    ),
    defaultProps: { style: { display: "flex", flexDirection: "column", gap: "16px", padding: "24px", width: "100%" } },
    settings: [],
    editorComponent: FormEditor,
  },
  inputField("Input", "Text Field", TextCursorInput, "text", "Short answer", "short_text"),
  inputField("EmailField", "Email Field", Mail, "email", "Email", "email"),
  {
    type: "TextareaField",
    label: "Text Area",
    icon: TextCursorInput,
    category: "forms",
    editorInert: true,
    render: ({ label: lbl, name, placeholder, required, style }: InputFieldProps) => (
      <div style={style}>
        <label className={labelCls}>{lbl}{required ? " *" : ""}</label>
        <textarea name={name} placeholder={placeholder} required={required} rows={4} className={inputCls} />
      </div>
    ),
    defaultProps: { label: "Long answer", name: "long_text", placeholder: "", required: false, style: { ...fieldWrapStyle } },
    settings: baseFieldSettings,
  },
  {
    type: "SelectField",
    label: "Dropdown",
    icon: ChevronDownSquare,
    category: "forms",
    editorInert: true,
    render: ({ label: lbl, name, required, options, style }: { label?: string; name?: string; required?: boolean; options?: { label: string }[]; style?: React.CSSProperties }) => (
      <div style={style}>
        <label className={labelCls}>{lbl}{required ? " *" : ""}</label>
        <select name={name} required={required} className={inputCls} defaultValue="">
          <option value="" disabled>Select…</option>
          {(options ?? []).map((o, i: number) => (
            <option key={i} value={o.label}>{o.label}</option>
          ))}
        </select>
      </div>
    ),
    defaultProps: {
      label: "Select", name: "select", required: false,
      options: [{ label: "Option 1" }, { label: "Option 2" }],
      style: { ...fieldWrapStyle },
    },
    settings: [
      { kind: "text", name: "label", label: "Label" },
      { kind: "text", name: "name", label: "Field name (data key)" },
      { kind: "toggle", name: "required", label: "Required" },
      { kind: "array", name: "options", label: "Options", itemLabel: "Option", item: [{ kind: "text", name: "label", label: "Label" }] },
    ],
  },
  {
    type: "RadioField",
    label: "Radio Group",
    icon: CircleDot,
    category: "forms",
    editorInert: true,
    render: ({ label: lbl, name, options, style }: { label?: string; name?: string; options?: { label: string }[]; style?: React.CSSProperties }) => (
      <div style={style}>
        <span className={labelCls}>{lbl}</span>
        <div className="space-y-1.5">
          {(options ?? []).map((o, i: number) => (
            <label key={i} className="flex items-center gap-2 text-sm text-gray-700">
              <input type="radio" name={name} value={o.label} /> {o.label}
            </label>
          ))}
        </div>
      </div>
    ),
    defaultProps: {
      label: "Choose one", name: "radio",
      options: [{ label: "Option 1" }, { label: "Option 2" }],
      style: { ...fieldWrapStyle },
    },
    settings: [
      { kind: "text", name: "label", label: "Label" },
      { kind: "text", name: "name", label: "Field name (data key)" },
      { kind: "array", name: "options", label: "Options", itemLabel: "Option", item: [{ kind: "text", name: "label", label: "Label" }] },
    ],
  },
  {
    type: "CheckboxField",
    label: "Checkbox",
    icon: CheckSquare,
    category: "forms",
    editorInert: true,
    render: ({ label: lbl, name, style }: { label?: string; name?: string; style?: React.CSSProperties }) => (
      <label style={style} className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" name={name} value="yes" /> {lbl}
      </label>
    ),
    defaultProps: { label: "I agree", name: "agree", style: { marginBottom: "16px", display: "flex" } },
    settings: [
      { kind: "text", name: "label", label: "Label" },
      { kind: "text", name: "name", label: "Field name (data key)" },
    ],
  },
  {
    type: "SubmitButton",
    label: "Submit",
    icon: MousePointerClick,
    category: "forms",
    editorInert: true,
    render: ({ text, style }: { text?: string; style?: React.CSSProperties }) => (
      <div style={style}>
        <button type="submit" className="inline-block bg-red text-white font-oswald uppercase font-bold px-6 py-3 rounded-lg hover:opacity-90 transition-opacity">
          {text}
        </button>
      </div>
    ),
    defaultProps: { text: "Submit", style: { marginTop: "8px" } },
    settings: [{ kind: "text", name: "text", label: "Button text" }],
  },
];
