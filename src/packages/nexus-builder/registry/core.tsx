import React, { useState } from "react";
import { useNode } from "@craftjs/core";
import ContentEditable from "react-contenteditable";
import {
  LayoutTemplate, Square, Columns as ColumnsIcon, LayoutGrid, MoveVertical, Minus,
  Heading as HeadingIcon, Type, AlignLeft, Link2, MousePointer2, Image as ImageIcon, Video as VideoIcon,
} from "lucide-react";
import { settingsComponentFor } from "./makeCraftComponent";
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

    const tag = opts.fixedTag ?? props.tagName ?? "p";
    const linkAttrs = opts.isLink
      ? { href: props.url || "#", onClickCapture: (e: any) => e.preventDefault() }
      : {};

    return (
      <ContentEditable
        innerRef={(ref: any) => {
          if (ref) connect(drag(ref));
        }}
        html={props[opts.propName] ?? ""}
        disabled={!editable}
        onChange={(e) => setProp((p: any) => (p[opts.propName] = e.target.value))}
        tagName={tag}
        style={props.style}
        className={editable ? "outline-none cursor-text" : opts.isLink ? "cursor-pointer" : "cursor-default"}
        onDoubleClick={() => setEditable(true)}
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
    render: ({ style, children }) => <section style={style}>{children}</section>,
    defaultProps: { style: { ...layoutStyle, paddingTop: "80px", paddingBottom: "80px" } },
    settings: [],
  },
  {
    type: "Container",
    label: "Container",
    icon: Square,
    category: "layout",
    isCanvas: true,
    render: ({ style, children }) => <div style={style}>{children}</div>,
    defaultProps: { style: { ...layoutStyle, maxWidth: "1100px", marginLeft: "auto", marginRight: "auto" } },
    settings: [],
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
    render: ({ style }) => <div style={style} />,
    defaultProps: { style: { width: "100%", height: "50px" } },
    settings: [],
  },
  {
    type: "Divider",
    label: "Divider",
    icon: Minus,
    category: "layout",
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
    settings: [headingTag],
    editorComponent: inlineText({
      displayName: "Heading",
      label: "Heading",
      propName: "text",
      defaultProps: {
        text: "Heading",
        tagName: "h1",
        style: { ...textStyle, fontFamily: "var(--font-oswald), sans-serif", fontSize: "36px", fontWeight: "700", marginBottom: "16px" },
      },
      settings: [headingTag],
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
    settings: [{ kind: "link", name: "url", label: "URL" }, targetField],
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
      settings: [{ kind: "link", name: "url", label: "URL" }, targetField],
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
    settings: [{ kind: "link", name: "url", label: "URL" }, targetField],
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
      settings: [{ kind: "link", name: "url", label: "URL" }, targetField],
    }),
  },

  // ── Media ──────────────────────────────────────────────────────────────────
  {
    type: "Image",
    label: "Image",
    icon: ImageIcon,
    category: "media",
    // eslint-disable-next-line @next/next/no-img-element
    render: ({ src, alt, style }) => <img src={src} alt={alt ?? ""} style={style} />,
    defaultProps: {
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1200&auto=format&fit=crop",
      alt: "Placeholder image",
      style: { width: "100%", height: "auto", display: "block", objectFit: "cover", borderRadius: "0px", marginTop: "0px", marginBottom: "0px" },
    },
    settings: [
      { kind: "image", name: "src", label: "Image" },
      { kind: "text", name: "alt", label: "Alt text" },
    ],
  },
  {
    type: "Video",
    label: "Video",
    icon: VideoIcon,
    category: "media",
    render: ({ src, autoPlay, loop, controls, style }) => (
      <video src={src} autoPlay={autoPlay} loop={loop} controls={controls} muted={autoPlay} style={style} />
    ),
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
];
