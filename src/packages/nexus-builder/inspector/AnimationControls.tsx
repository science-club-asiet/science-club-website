import { Sparkles } from "lucide-react";
import { Section, Row } from "../ui/primitives";
import { SelectField, NumberField } from "../ui/fields";
import type { AnimationConfig } from "../lib/animation";

const TYPES: { label: string; value: AnimationConfig["type"] }[] = [
  { label: "None", value: "none" },
  { label: "Fade in", value: "fade" },
  { label: "Slide up", value: "up" },
  { label: "Slide down", value: "down" },
  { label: "Slide left", value: "left" },
  { label: "Slide right", value: "right" },
  { label: "Zoom in", value: "zoom" },
];

export const AnimationControls = ({
  anim,
  setAnim,
}: {
  anim: AnimationConfig | undefined;
  setAnim: (patch: Partial<AnimationConfig>) => void;
}) => {
  const type = anim?.type ?? "none";
  const active = type !== "none";

  return (
    <Section
      title="Animation"
      defaultOpen={false}
      right={active ? <span className="text-[9px] font-semibold text-[#2563EB] bg-[#EFF4FF] px-1.5 py-0.5 rounded-full">ON</span> : <Sparkles size={12} className="text-[#C0C4CC]" />}
    >
      <Row label="Effect">
        <SelectField className="w-32" value={type} onChange={(v) => setAnim({ type: v as AnimationConfig["type"] })} options={TYPES.map((t) => ({ label: t.label, value: t.value }))} />
      </Row>
      {active && (
        <>
          <Row label="Trigger">
            <SelectField className="w-36" value={anim?.trigger ?? "scroll"} onChange={(v) => setAnim({ trigger: v as AnimationConfig["trigger"] })} options={[{ label: "On scroll in", value: "scroll" }, { label: "On page load", value: "load" }]} />
          </Row>
          <Row label="Duration"><NumberField className="w-24" value={String(anim?.duration ?? 600)} step={50} min={0} onChange={(v) => setAnim({ duration: Number(v) || 0 })} /></Row>
          <Row label="Delay"><NumberField className="w-24" value={String(anim?.delay ?? 0)} step={50} min={0} onChange={(v) => setAnim({ delay: Number(v) || 0 })} /></Row>
          <p className="text-[10px] text-[#9CA3AF]">Plays on the live page — the canvas shows the final state.</p>
        </>
      )}
    </Section>
  );
};
