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

const section = (extra: any = {}) => ({
  display: "flex", flexDirection: "column", alignItems: "center", width: "100%",
  paddingTop: "88px", paddingBottom: "88px", paddingLeft: "24px", paddingRight: "24px",
  backgroundColor: "transparent", position: "relative", ...extra,
});
const container = (extra: any = {}) => ({
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
const card = (extra: any = {}) => ({
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
      <Heading text="Where curiosity becomes discovery" tagName="h1" style={{ fontFamily: oswald, fontSize: "58px", fontWeight: "700", color: NAVY, textAlign: "center", lineHeight: "1.05", marginBottom: "0px", textTransform: "uppercase" }} />
      <Text text="Hands-on experiments, talks, and projects that turn big questions into real work. Join a community of builders and thinkers." style={{ fontFamily: inter, fontSize: "18px", color: MUTE, textAlign: "center", lineHeight: "1.6", marginBottom: "6px", maxWidth: "620px" }} />
      <Button text="Join the club" url="/info/join" style={btn()} />
    </Element>
  </Element>
);

const featuresTemplate = () => {
  const feature = (icon: string, title: string, body: string) => (
    <Element is={Card} canvas style={card({ alignItems: "flex-start" })}>
      <Icon icon={icon} size={30} style={{ display: "inline-flex", color: RED }} />
      <Heading text={title} tagName="h3" style={{ fontFamily: oswald, fontSize: "20px", fontWeight: "700", color: NAVY, marginBottom: "0px", textTransform: "uppercase" }} />
      <Text text={body} style={{ fontFamily: inter, fontSize: "15px", color: MUTE, lineHeight: "1.6", marginBottom: "0px" }} />
    </Element>
  );
  return (
    <Element is={Section} canvas style={section()}>
      <Element is={Container} canvas style={container({ gap: "40px", alignItems: "center" })}>
        <Heading text="What we do" tagName="h2" style={{ fontFamily: oswald, fontSize: "40px", fontWeight: "700", color: NAVY, textAlign: "center", marginBottom: "0px", textTransform: "uppercase" }} />
        <Element is={Grid} canvas columns={3} style={{ display: "grid", gap: "24px", width: "100%", position: "relative" }}>
          {feature("FlaskConical", "Experiments", "Weekly hands-on labs where members design and run their own experiments.")}
          {feature("Rocket", "Projects", "Ship real builds — from rockets to robotics — with mentors and teammates.")}
          {feature("Users", "Community", "A network of curious people who help each other learn faster.")}
        </Element>
      </Element>
    </Element>
  );
};

const ctaTemplate = () => (
  <Element is={Section} canvas style={section({ paddingTop: "72px", paddingBottom: "72px" })}>
    <Element is={Container} canvas style={container({ alignItems: "center", gap: "18px", maxWidth: "900px", paddingTop: "56px", paddingBottom: "56px", paddingLeft: "40px", paddingRight: "40px", backgroundColor: NAVY, borderRadius: "24px" })}>
      <Heading text="Ready to build something?" tagName="h2" style={{ fontFamily: oswald, fontSize: "38px", fontWeight: "700", color: "#ffffff", textAlign: "center", marginBottom: "0px", textTransform: "uppercase" }} />
      <Text text="Membership is open. Come to the next session — no experience required." style={{ fontFamily: inter, fontSize: "16px", color: "rgba(255,255,255,0.75)", textAlign: "center", marginBottom: "6px" }} />
      <Button text="Get started" url="/info/join" style={btn()} />
    </Element>
  </Element>
);

const statsTemplate = () => {
  const stat = (num: string, label: string) => (
    <Element is={Card} canvas style={card({ alignItems: "center", gap: "6px" })}>
      <Heading text={num} tagName="h3" style={{ fontFamily: oswald, fontSize: "46px", fontWeight: "700", color: RED, textAlign: "center", marginBottom: "0px" }} />
      <Text text={label} style={{ fontFamily: inter, fontSize: "13px", color: MUTE, textAlign: "center", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "0px" }} />
    </Element>
  );
  return (
    <Element is={Section} canvas style={section({ paddingTop: "64px", paddingBottom: "64px" })}>
      <Element is={Container} canvas style={container()}>
        <Element is={Grid} canvas columns={4} style={{ display: "grid", gap: "20px", width: "100%", position: "relative" }}>
          {stat("120+", "Active members")}
          {stat("40", "Events a year")}
          {stat("15", "Live projects")}
          {stat("8", "Partner labs")}
        </Element>
      </Element>
    </Element>
  );
};

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

export type TemplateDef = { id: string; label: string; icon: React.ComponentType<any>; build: () => React.ReactElement };

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
