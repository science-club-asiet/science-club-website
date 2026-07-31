import React, { useEffect, useRef, useState } from "react";
import { useNode } from "@craftjs/core";
import ContentEditable from "react-contenteditable";
import {
  LayoutTemplate, Square, Columns as ColumnsIcon, LayoutGrid, MoveVertical, Minus,
  Heading as HeadingIcon, Type, AlignLeft, Link2, MousePointer2, Image as ImageIcon, Video as VideoIcon,
  SquareStack, Sparkles, BadgeCheck as BadgeIcon, Quote as QuoteIcon,
} from "lucide-react";
import { settingsComponentFor } from "./makeCraftComponent";
import { mergeStyle, useBreakpoint } from "../lib/responsive";
import { useItem, resolveBindings } from "../lib/binding";
import { ICONS } from "./icons";
import type { FieldSchema, RegistryEntry } from "./types";

// ── Shared default styles ────────────────────────────────────────────────────
const layoutStyle = {
  display: "flex",
  flexDirection: "column",
  paddingTop: "20px",
  paddingBottom: "20px",
  paddingLeft: "20px",
  paddingRight: "20px",
  marginTop: "0px",
  marginBottom: "0px",
  marginLeft: "0px",
  marginRight: "0px",
  width: "100%",
  backgroundColor: "transparent",
  position: "relative",
};

// Neutral placeholder for media with no source yet — avoids passing src="" to
// <img>/<video> (which triggers a full-page re-request warning) and gives a
// clear "set me" affordance instead of a broken-image icon.
const mediaPlaceholder = (style: any = {}) => ({
  ...style,
  minHeight: style?.height && style.height !== "auto" ? undefined : 160,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#f1f5f9",
  color: "#94a3b8",
  fontSize: "12px",
  border: "1px dashed #cbd5e1",
  borderRadius: style?.borderRadius ?? "6px",
});

const textStyle = {
  fontFamily: "var(--font-inter), sans-serif",
  fontSize: "16px",
  fontWeight: "400",
  color: "#111827",
  textAlign: "left",
  marginTop: "0px",
  marginBottom: "0px",
  marginLeft: "0px",
  marginRight: "0px",
  display: "block",
};

// ── Inline-editable text factory (editor side) ───────────────────────────────
function inlineText(opts: {
  displayName: string;
  label: string;
  propName: string;
  fixedTag?: string;
  isLink?: boolean;
  defaultProps: Record<string, any>;
  settings: FieldSchema[];
}) {
  const Comp = (props: any) => {
    const {
      connectors: { connect, drag },
      actions: { setProp },
    } = useNode();
    const [editable, setEditable] = useState(false);
    const elRef = useRef<HTMLElement | null>(null);
    const bp = useBreakpoint();
    const item = useItem();
    // When bound to a CMS field inside a Collection List, show the item value
    // and disable inline editing (content comes from the CMS).
    const bound = resolveBindings(opts.displayName, props, item);
    const isBound = !!props.bindField && !!item;

    // On entering edit mode, focus the element and drop the caret at the end so
    // the very first double-click lets you type immediately (no second click).
    useEffect(() => {
      if (!editable || !elRef.current) return;
      const el = elRef.current;
      el.focus();
      const sel = window.getSelection();
      if (sel) {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }, [editable]);

    const tag = opts.fixedTag ?? props.tagName ?? "p";
    const linkAttrs = opts.isLink
      ? { href: props.url || "#", onClickCapture: (e: any) => e.preventDefault() }
      : {};

    return (
      <ContentEditable
        innerRef={(ref: any) => {
          elRef.current = ref;
          if (!ref) return;
          connect(ref);
          // Only make it draggable when NOT editing, otherwise selecting text
          // with the mouse fights Craft's drag handler.
          if (!editable) drag(ref);
        }}
        html={bound[opts.propName] ?? ""}
        disabled={!editable || isBound}
        onChange={(e) => setProp((p: any) => (p[opts.propName] = e.target.value))}
        tagName={tag}
        style={mergeStyle(props.style, props.responsive, bp)}
        className={editable ? "outline-none cursor-text" : opts.isLink ? "cursor-pointer" : "cursor-default"}
        onDoubleClick={() => { if (!isBound) setEditable(true); }}
        onBlur={() => setEditable(false)}
        {...linkAttrs}
      />
    );
  };
  Comp.displayName = opts.displayName;
  Comp.craft = {
    displayName: opts.label,
    props: opts.defaultProps,
    rules: { canDrag: () => true },
    related: opts.settings.length ? { settings: settingsComponentFor(opts.settings) } : {},
  };
  return Comp;
}

const headingTag: FieldSchema = {
  kind: "select",
  name: "tagName",
  label: "Tag",
  options: [
    { label: "H1", value: "h1" },
    { label: "H2", value: "h2" },
    { label: "H3", value: "h3" },
    { label: "H4", value: "h4" },
    { label: "H5", value: "h5" },
  ],
};
const targetField: FieldSchema = {
  kind: "select",
  name: "target",
  label: "Open in",
  options: [
    { label: "Same tab", value: "_self" },
    { label: "New tab", value: "_blank" },
  ],
};

export const coreEntries: RegistryEntry[] = [
  // ── Layout ─────────────────────────────────────────────────────────────────
  {
    type: "Section",
    label: "Section",
    icon: LayoutTemplate,
    category: "layout",
    isCanvas: true,
    render: ({ tag = "section", style, children }) => React.createElement(tag, { style }, children),
    defaultProps: { tag: "section", style: { ...layoutStyle, paddingTop: "80px", paddingBottom: "80px" } },
    settings: [
      { kind: "select", name: "tag", label: "HTML tag", options: [
        { label: "section", value: "section" }, { label: "header", value: "header" },
        { label: "footer", value: "footer" }, { label: "nav", value: "nav" },
        { label: "main", value: "main" }, { label: "article", value: "article" }, { label: "aside", value: "aside" },
      ] },
      { kind: "visibility", name: "hideOn", label: "Visibility" },
    ],
  },
  {
    type: "Container",
    label: "Container",
    icon: Square,
    category: "layout",
    isCanvas: true,
    render: ({ tag = "div", style, children }) => React.createElement(tag, { style }, children),
    defaultProps: { tag: "div", style: { ...layoutStyle, maxWidth: "1100px", marginLeft: "auto", marginRight: "auto" } },
    settings: [
      { kind: "select", name: "tag", label: "HTML tag", options: [
        { label: "div", value: "div" }, { label: "header", value: "header" }, { label: "footer", value: "footer" },
        { label: "nav", value: "nav" }, { label: "main", value: "main" }, { label: "article", value: "article" },
      ] },
      { kind: "visibility", name: "hideOn", label: "Visibility" },
    ],
  },
  {
    type: "Columns",
    label: "Columns",
    icon: ColumnsIcon,
    category: "layout",
    isCanvas: true,
    render: ({ style, children }) => <div style={style}>{children}</div>,
    defaultProps: { style: { ...layoutStyle, flexDirection: "row", gap: "20px" } },
    settings: [],
  },
  {
    type: "Grid",
    label: "Grid",
    icon: LayoutGrid,
    category: "layout",
    isCanvas: true,
    render: ({ columns = 2, style, children }) => (
      <div style={{ ...style, display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
        {children}
      </div>
    ),
    defaultProps: {
      columns: 2,
      style: { ...layoutStyle, display: "grid", gap: "20px" },
    },
    settings: [{ kind: "number", name: "columns", label: "Columns", min: 1, max: 6 }],
  },
  {
    type: "DivBlock",
    label: "Div Block",
    icon: Square,
    category: "layout",
    isCanvas: true,
    render: ({ style, children }) => <div style={style}>{children}</div>,
    defaultProps: {
      style: { ...layoutStyle, paddingTop: "0px", paddingBottom: "0px", paddingLeft: "0px", paddingRight: "0px", width: "auto" },
    },
    settings: [],
  },
  {
    type: "Spacer",
    label: "Spacer",
    icon: MoveVertical,
    category: "layout",
    styleGroups: ["spacing", "size"],
    render: ({ style }) => <div style={style} />,
    defaultProps: { style: { width: "100%", height: "50px" } },
    settings: [],
  },
  {
    type: "Divider",
    label: "Divider",
    icon: Minus,
    category: "layout",
    styleGroups: ["spacing", "size", "border"],
    render: ({ style }) => <hr style={style} />,
    defaultProps: {
      style: { width: "100%", border: "none", borderTop: "1px solid #E5E7EB", marginTop: "20px", marginBottom: "20px" },
    },
    settings: [],
  },

  // ── Basic (typography + button/link) ────────────────────────────────────────
  {
    type: "Heading",
    label: "Heading",
    icon: HeadingIcon,
    category: "typography",
    render: ({ tagName = "h1", text, style }) =>
      React.createElement(tagName, { style, dangerouslySetInnerHTML: { __html: text ?? "" } }),
    defaultProps: {
      text: "Heading",
      tagName: "h1",
      style: { ...textStyle, fontFamily: "var(--font-oswald), sans-serif", fontSize: "36px", fontWeight: "700", marginBottom: "16px" },
    },
    settings: [headingTag, { kind: "visibility", name: "hideOn", label: "Visibility" }],
    editorComponent: inlineText({
      displayName: "Heading",
      label: "Heading",
      propName: "text",
      defaultProps: {
        text: "Heading",
        tagName: "h1",
        style: { ...textStyle, fontFamily: "var(--font-oswald), sans-serif", fontSize: "36px", fontWeight: "700", marginBottom: "16px" },
      },
      settings: [headingTag, { kind: "visibility", name: "hideOn", label: "Visibility" }],
    }),
  },
  {
    type: "Text",
    label: "Text",
    icon: Type,
    category: "typography",
    render: ({ text, style }) => <p style={style} dangerouslySetInnerHTML={{ __html: text ?? "" }} />,
    defaultProps: {
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
      style: { ...textStyle, marginBottom: "16px", color: "#4B5563" },
    },
    settings: [],
    editorComponent: inlineText({
      displayName: "Text",
      label: "Text",
      propName: "text",
      fixedTag: "p",
      defaultProps: {
        text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        style: { ...textStyle, marginBottom: "16px", color: "#4B5563" },
      },
      settings: [],
    }),
  },
  {
    type: "RichText",
    label: "Rich Text",
    icon: AlignLeft,
    category: "typography",
    render: ({ html, style }) => (
      <div className="prose max-w-none" style={style} dangerouslySetInnerHTML={{ __html: html ?? "" }} />
    ),
    defaultProps: {
      html: "<p>Rich text block. Add <strong>bold</strong> and <em>italic</em> text.</p>",
      style: { ...textStyle, marginBottom: "16px" },
    },
    settings: [],
    editorComponent: inlineText({
      displayName: "RichText",
      label: "Rich Text",
      propName: "html",
      fixedTag: "div",
      defaultProps: {
        html: "<p>Rich text block. Add <strong>bold</strong> and <em>italic</em> text.</p>",
        style: { ...textStyle, marginBottom: "16px" },
      },
      settings: [],
    }),
  },
  {
    type: "Link",
    label: "Link",
    icon: Link2,
    category: "typography",
    render: ({ text, url, target, style }) => (
      <a href={url || "#"} target={target} style={style} dangerouslySetInnerHTML={{ __html: text ?? "" }} />
    ),
    defaultProps: {
      text: "Link Text",
      url: "#",
      target: "_self",
      style: { ...textStyle, color: "#2563EB", textDecoration: "none", display: "inline-block" },
    },
    settings: [{ kind: "linkTarget", name: "url", label: "Link" }, { kind: "visibility", name: "hideOn", label: "Visibility" }],
    editorComponent: inlineText({
      displayName: "Link",
      label: "Link",
      propName: "text",
      fixedTag: "a",
      isLink: true,
      defaultProps: {
        text: "Link Text",
        url: "#",
        target: "_self",
        style: { ...textStyle, color: "#2563EB", textDecoration: "none", display: "inline-block" },
      },
      settings: [{ kind: "linkTarget", name: "url", label: "Link" }, { kind: "visibility", name: "hideOn", label: "Visibility" }],
    }),
  },
  {
    type: "Button",
    label: "Button",
    icon: MousePointer2,
    category: "typography",
    render: ({ text, url, target, style }) => (
      <a href={url || "#"} target={target} style={style} dangerouslySetInnerHTML={{ __html: text ?? "" }} />
    ),
    defaultProps: {
      text: "Button",
      url: "#",
      target: "_self",
      style: {
        display: "inline-block", backgroundColor: "#2563EB", color: "#ffffff",
        paddingTop: "12px", paddingBottom: "12px", paddingLeft: "24px", paddingRight: "24px",
        borderRadius: "6px", textDecoration: "none", fontWeight: "500", fontSize: "14px", textAlign: "center", cursor: "pointer",
      },
    },
    settings: [{ kind: "linkTarget", name: "url", label: "Link" }, { kind: "visibility", name: "hideOn", label: "Visibility" }],
    editorComponent: inlineText({
      displayName: "Button",
      label: "Button",
      propName: "text",
      fixedTag: "a",
      isLink: true,
      defaultProps: {
        text: "Button",
        url: "#",
        target: "_self",
        style: {
          display: "inline-block", backgroundColor: "#2563EB", color: "#ffffff",
          paddingTop: "12px", paddingBottom: "12px", paddingLeft: "24px", paddingRight: "24px",
          borderRadius: "6px", textDecoration: "none", fontWeight: "500", fontSize: "14px", textAlign: "center", cursor: "pointer",
        },
      },
      settings: [{ kind: "linkTarget", name: "url", label: "Link" }, { kind: "visibility", name: "hideOn", label: "Visibility" }],
    }),
  },

  // ── Media ──────────────────────────────────────────────────────────────────
  {
    type: "Image",
    label: "Image",
    icon: ImageIcon,
    category: "media",
    styleGroups: ["spacing", "size", "position", "border", "effects"],
    render: ({ src, alt, style, lazy, decorative }) =>
      src
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={src} alt={decorative ? "" : (alt ?? "")} loading={lazy ? "lazy" : undefined} style={style} />
        : <div style={mediaPlaceholder(style)}>No image selected</div>,
    defaultProps: {
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      alt: "Placeholder image",
      style: { width: "100%", height: "auto", display: "block", objectFit: "cover", borderRadius: "0px", marginTop: "0px", marginBottom: "0px" },
    },
    settings: [
      { kind: "image", name: "src", label: "Image" },
      { kind: "text", name: "alt", label: "Alt text" },
      { kind: "toggle", name: "decorative", label: "Decorative (no alt)" },
      { kind: "toggle", name: "lazy", label: "Lazy load" },
      { kind: "visibility", name: "hideOn", label: "Visibility" },
    ],
  },
  {
    type: "Video",
    label: "Video",
    icon: VideoIcon,
    category: "media",
    styleGroups: ["spacing", "size", "position", "border", "effects"],
    render: ({ src, autoPlay, loop, controls, style }) =>
      src
        ? <video src={src} autoPlay={autoPlay} loop={loop} controls={controls} muted={autoPlay} style={style} />
        : <div style={mediaPlaceholder(style)}>No video selected</div>,
    defaultProps: {
      src: "https://www.w3schools.com/html/mov_bbb.mp4",
      autoPlay: false,
      loop: false,
      controls: true,
      style: { width: "100%", height: "auto", display: "block", borderRadius: "0px" },
    },
    settings: [
      { kind: "text", name: "src", label: "Video URL (MP4/WebM)" },
      { kind: "toggle", name: "autoPlay", label: "Autoplay" },
      { kind: "toggle", name: "loop", label: "Loop" },
      { kind: "toggle", name: "controls", label: "Show controls" },
    ],
  },

  // ── Components (nicer, less-bland defaults) ─────────────────────────────────
  {
    type: "Card",
    label: "Card",
    icon: SquareStack,
    category: "layout",
    isCanvas: true,
    render: ({ style, children }) => <div style={style}>{children}</div>,
    defaultProps: {
      style: {
        display: "flex", flexDirection: "column", gap: "12px", width: "100%",
        paddingTop: "24px", paddingBottom: "24px", paddingLeft: "24px", paddingRight: "24px",
        backgroundColor: "#ffffff", borderRadius: "14px",
        borderWidth: "1px", borderStyle: "solid", borderColor: "#e5e7eb",
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)", position: "relative",
      },
    },
    settings: [],
  },
  {
    type: "Icon",
    label: "Icon",
    icon: Sparkles,
    category: "media",
    styleGroups: ["spacing", "size", "position", "typography", "effects"],
    render: ({ icon, size, style }) => (
      <span style={style}>{React.createElement(ICONS[icon] ?? ICONS.Star, { size: Number(size) || 32 })}</span>
    ),
    defaultProps: {
      icon: "Sparkles",
      size: 32,
      style: { display: "inline-flex", color: "#2563EB", alignItems: "center", justifyContent: "center" },
    },
    settings: [
      { kind: "icon", name: "icon", label: "Icon" },
      { kind: "number", name: "size", label: "Size", min: 12, max: 160 },
    ],
  },
  {
    type: "Badge",
    label: "Badge",
    icon: BadgeIcon,
    category: "typography",
    render: ({ text, style }) => <span style={style} dangerouslySetInnerHTML={{ __html: text ?? "" }} />,
    defaultProps: {
      text: "New",
      style: {
        display: "inline-block", backgroundColor: "#eff6ff", color: "#2563eb",
        paddingTop: "4px", paddingBottom: "4px", paddingLeft: "12px", paddingRight: "12px",
        borderRadius: "9999px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase",
      },
    },
    settings: [],
    editorComponent: inlineText({
      displayName: "Badge",
      label: "Badge",
      propName: "text",
      fixedTag: "span",
      defaultProps: {
        text: "New",
        style: {
          display: "inline-block", backgroundColor: "#eff6ff", color: "#2563eb",
          paddingTop: "4px", paddingBottom: "4px", paddingLeft: "12px", paddingRight: "12px",
          borderRadius: "9999px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.05em", textTransform: "uppercase",
        },
      },
      settings: [],
    }),
  },
  {
    type: "Quote",
    label: "Quote",
    icon: QuoteIcon,
    category: "typography",
    render: ({ text, style }) => <blockquote style={style} dangerouslySetInnerHTML={{ __html: text ?? "" }} />,
    defaultProps: {
      text: "“Design is not just what it looks like and feels like. Design is how it works.”",
      style: {
        ...textStyle, fontFamily: "var(--font-playfair), serif", fontSize: "22px", fontStyle: "italic",
        color: "#1f2937", borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#2563eb",
        paddingLeft: "20px", marginTop: "8px", marginBottom: "8px", lineHeight: "1.5",
      },
    },
    settings: [],
    editorComponent: inlineText({
      displayName: "Quote",
      label: "Quote",
      propName: "text",
      fixedTag: "blockquote",
      defaultProps: {
        text: "“Design is not just what it looks like and feels like. Design is how it works.”",
        style: {
          ...textStyle, fontFamily: "var(--font-playfair), serif", fontSize: "22px", fontStyle: "italic",
          color: "#1f2937", borderLeftWidth: "3px", borderLeftStyle: "solid", borderLeftColor: "#2563eb",
          paddingLeft: "20px", marginTop: "8px", marginBottom: "8px", lineHeight: "1.5",
        },
      },
      settings: [],
    }),
  },
];
