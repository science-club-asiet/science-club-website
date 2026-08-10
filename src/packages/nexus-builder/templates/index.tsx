import React, { useCallback } from "react";
import { Element, useEditor } from "@craftjs/core";
import { ROOT_NODE } from "@craftjs/utils";
import { LayoutTemplate, Rows3, Megaphone, BarChart3, Quote as QuoteIcon } from "lucide-react";
import { resolver } from "../registry";

/**
 * Pre-designed section templates ("Add → Layouts"). Each is a fresh Craft tree
 * built from registry components with polished, on-brand default styles, so a
 * page starts looking designed instead of a stack of bare primitives.
 */

// Brand colours reference the site's CSS tokens (globals.css) so templates
// match the theme and follow any rebrand.
const NAVY = "var(--brand-navy)";
const RED = "var(--brand-red)";
const INK = "#1f2937";
const MUTE = "#6b7280";

const { Section, Container, Grid, Card, Heading, Text, Button, Badge, Icon } = resolver;
const section = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
  paddingTop: "88px", paddingBottom: "88px", paddingLeft: "24px", paddingRight: "24px",
  backgroundColor: "transparent", position: "relative", ...extra,
});
const container = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex", flexDirection: "column", width: "100%", maxWidth: "1120px",
  marginLeft: "auto", marginRight: "auto",
  paddingTop: "0px", paddingBottom: "0px", paddingLeft: "0px", paddingRight: "0px",
  position: "relative", ...extra,
});
const oswald = "var(--font-oswald), sans-serif";
const inter = "var(--font-inter), sans-serif";

const badge = {
  display: "inline-block", backgroundColor: "#fde8e7", color: RED,
  paddingTop: "5px", paddingBottom: "5px", paddingLeft: "14px", paddingRight: "14px",
  borderRadius: "9999px", fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase",
  fontFamily: oswald,
};
const btn = (bg = RED, color = "#ffffff") => ({
  display: "inline-block", backgroundColor: bg, color,
  paddingTop: "14px", paddingBottom: "14px", paddingLeft: "30px", paddingRight: "30px",
  borderRadius: "8px", textDecoration: "none", fontWeight: "700", fontSize: "14px",
  fontFamily: oswald, textTransform: "uppercase", letterSpacing: "0.04em", cursor: "pointer",
});
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  display: "flex", flexDirection: "column", gap: "12px", width: "100%",
  paddingTop: "28px", paddingBottom: "28px", paddingLeft: "28px", paddingRight: "28px",
  backgroundColor: "#ffffff", borderRadius: "16px",
  borderWidth: "1px", borderStyle: "solid", borderColor: "#eceff3",
  boxShadow: "0 6px 24px rgba(15,35,80,0.06)", position: "relative", ...extra,
});

// ── Templates ────────────────────────────────────────────────────────────────
const heroTemplate = () => (
  <Element is={Section} canvas style={section({ alignItems: "center", paddingTop: "104px", paddingBottom: "104px" })}>
    <Element is={Container} canvas style={container({ alignItems: "center", gap: "22px", maxWidth: "780px" })}>
      <Badge text="Science Club" style={badge} />
      <Heading text="Curiosity in Action" tagName="h1" style={{ fontFamily: oswald, fontSize: "64px", fontWeight: "700", color: NAVY, textAlign: "center", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: "1.05", marginBottom: "0px" }} />
      <Text text="A student-led community exploring science, technology, and applied research through hands-on workshops, keynotes, and collaborative projects." style={{ fontFamily: inter, fontSize: "18px", color: MUTE, textAlign: "center", maxWidth: "620px", lineHeight: "1.6", marginBottom: "8px" }} />
      <Element is={Container} canvas style={{ display: "flex", flexDirection: "row", gap: "14px", justifyContent: "center", marginTop: "8px" }}>
        <Button text="Explore Events" url="/events" style={btn(RED, "#ffffff")} />
        <Button text="Join the Club" url="/info/join" style={{ ...btn("transparent", NAVY), borderWidth: "1px", borderStyle: "solid", borderColor: "#d1d5db" }} />
      </Element>
    </Element>
  </Element>
);

const featuresTemplate = () => (
  <Element is={Section} canvas style={section({ backgroundColor: "#f8fafc" })}>
    <Element is={Container} canvas style={container({ gap: "40px" })}>
      <Element is={Container} canvas style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", textAlign: "center" }}>
        <Badge text="What We Do" style={badge} />
        <Heading text="Three Pillars of Our Community" tagName="h2" style={{ fontFamily: oswald, fontSize: "40px", fontWeight: "700", color: NAVY, textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: "0px" }} />
        <Text text="Everything we organize falls into three core avenues designed to build skills and community." style={{ fontFamily: inter, fontSize: "16px", color: MUTE, maxWidth: "560px", marginBottom: "0px" }} />
      </Element>
      <Element is={Grid} canvas style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "24px", width: "100%" }}>
        <Element is={Card} canvas style={card()}>
          <Icon name="Compass" size={32} color={RED} style={{ marginBottom: "6px" }} />
          <Heading text="Exploration" tagName="h3" style={{ fontFamily: oswald, fontSize: "22px", fontWeight: "700", color: NAVY, textTransform: "uppercase", marginBottom: "0px" }} />
          <Text text="Keynotes, debates, and reading groups delving into fundamental scientific questions." style={{ fontFamily: inter, fontSize: "14px", color: MUTE, lineHeight: "1.6", marginBottom: "0px" }} />
        </Element>
        <Element is={Card} canvas style={card()}>
          <Icon name="Hammer" size={32} color={RED} style={{ marginBottom: "6px" }} />
          <Heading text="Building" tagName="h3" style={{ fontFamily: oswald, fontSize: "22px", fontWeight: "700", color: NAVY, textTransform: "uppercase", marginBottom: "0px" }} />
          <Text text="Hands-on technical workshops, hackathons, and hardware sprints building real prototypes." style={{ fontFamily: inter, fontSize: "14px", color: MUTE, lineHeight: "1.6", marginBottom: "0px" }} />
        </Element>
        <Element is={Card} canvas style={card()}>
          <Icon name="Users2" size={32} color={RED} style={{ marginBottom: "6px" }} />
          <Heading text="Community" tagName="h3" style={{ fontFamily: oswald, fontSize: "22px", fontWeight: "700", color: NAVY, textTransform: "uppercase", marginBottom: "0px" }} />
          <Text text="Industrial visits, science outreach to schools, and a lifelong network of curious peers." style={{ fontFamily: inter, fontSize: "14px", color: MUTE, lineHeight: "1.6", marginBottom: "0px" }} />
        </Element>
      </Element>
    </Element>
  </Element>
);

const ctaTemplate = () => (
  <Element is={Section} canvas style={section({ backgroundColor: NAVY })}>
    <Element is={Container} canvas style={container({ alignItems: "center", gap: "18px", maxWidth: "720px", textAlign: "center" })}>
      <Badge text="Open Admissions" style={{ ...badge, backgroundColor: "rgba(255,255,255,0.12)", color: "#ffffff" }} />
      <Heading text="Ready to Build Something Extraordinary?" tagName="h2" style={{ fontFamily: oswald, fontSize: "48px", fontWeight: "700", color: "#ffffff", textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: "1.1", marginBottom: "0px" }} />
      <Text text="Join over 200 passionate students across engineering disciplines. No prior experience required — just bring curiosity." style={{ fontFamily: inter, fontSize: "16px", color: "#cbd5e1", lineHeight: "1.6", marginBottom: "10px" }} />
      <Button text="Apply for Membership" url="/info/join" style={btn(RED, "#ffffff")} />
    </Element>
  </Element>
);

const statsTemplate = () => (
  <Element is={Section} canvas style={section({ backgroundColor: "#ffffff", borderTop: "1px solid #f1f5f9", borderBottom: "1px solid #f1f5f9" })}>
    <Element is={Container} canvas style={container()}>
      <Element is={Grid} canvas style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "32px", width: "100%", textAlign: "center" }}>
        <Element is={Container} canvas style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Heading text="250+" tagName="h3" style={{ fontFamily: oswald, fontSize: "44px", fontWeight: "700", color: RED, lineHeight: "1", marginBottom: "0px" }} />
          <Text text="Active Members" style={{ fontFamily: oswald, fontSize: "13px", color: MUTE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0px" }} />
        </Element>
        <Element is={Container} canvas style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Heading text="34" tagName="h3" style={{ fontFamily: oswald, fontSize: "44px", fontWeight: "700", color: NAVY, lineHeight: "1", marginBottom: "0px" }} />
          <Text text="Events Organized" style={{ fontFamily: oswald, fontSize: "13px", color: MUTE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0px" }} />
        </Element>
        <Element is={Container} canvas style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Heading text="12" tagName="h3" style={{ fontFamily: oswald, fontSize: "44px", fontWeight: "700", color: NAVY, lineHeight: "1", marginBottom: "0px" }} />
          <Text text="Research Projects" style={{ fontFamily: oswald, fontSize: "13px", color: MUTE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0px" }} />
        </Element>
        <Element is={Container} canvas style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <Heading text="5" tagName="h3" style={{ fontFamily: oswald, fontSize: "44px", fontWeight: "700", color: NAVY, lineHeight: "1", marginBottom: "0px" }} />
          <Text text="National Awards" style={{ fontFamily: oswald, fontSize: "13px", color: MUTE, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0px" }} />
        </Element>
      </Element>
    </Element>
  </Element>
);

const testimonialTemplate = () => (
  <Element is={Section} canvas style={section()}>
    <Element is={Container} canvas style={container({ maxWidth: "820px", alignItems: "center" })}>
      <Element is={Card} canvas style={card({ alignItems: "center", gap: "18px", paddingTop: "48px", paddingBottom: "48px", paddingLeft: "48px", paddingRight: "48px" })}>
        <Text text="“Joining the Science Club changed how I learn — I went from reading about ideas to actually building them with people who care.”" style={{ fontFamily: "var(--font-playfair), serif", fontSize: "24px", fontStyle: "italic", color: INK, textAlign: "center", lineHeight: "1.5", marginBottom: "0px" }} />
        <Text text="— Ava R., Member since 2023" style={{ fontFamily: oswald, fontSize: "13px", color: MUTE, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0px" }} />
      </Element>
    </Element>
  </Element>
);

export type TemplateDef = { id: string; label: string; icon: React.ComponentType<{ className?: string; size?: number }>; build: () => React.ReactElement };

export const TEMPLATES: TemplateDef[] = [
  { id: "hero", label: "Hero", icon: LayoutTemplate, build: heroTemplate },
  { id: "features", label: "Feature Grid", icon: Rows3, build: featuresTemplate },
  { id: "cta", label: "Call to Action", icon: Megaphone, build: ctaTemplate },
  { id: "stats", label: "Stats", icon: BarChart3, build: statsTemplate },
  { id: "testimonial", label: "Testimonial", icon: QuoteIcon, build: testimonialTemplate },
];

/** Insert a template tree into the selected canvas (or the page root). */
export function useInsertTemplate() {
  const { query, actions } = useEditor();
  return useCallback(
    (build: () => React.ReactElement) => {
      const selectedId = query.getEvent("selected").first();
      let parentId: string = ROOT_NODE;
      if (selectedId && query.node(selectedId).get()) {
        parentId = query.node(selectedId).isCanvas()
          ? selectedId
          : query.node(selectedId).get().data.parent || ROOT_NODE;
      }
      const tree = query.parseReactElement(build()).toNodeTree();
      const index = query.node(parentId).get().data.nodes.length;
      actions.addNodeTree(tree, parentId, index);
      actions.selectNode(tree.rootNodeId);
    },
    [query, actions]
  );
}
