import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, stagger, useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { KineticText, Rule } from "../components/KineticText";
import { ServiceCard } from "../components/ServiceCard";
import { SERVICES_CT, SERVICES_RE } from "../content";

const SPLIT = 124; // frame where the second group takes over

/** S4 — «من الفكرة.. إلى المفتاح»: real-estate services, then contracting services. */
export const Services: React.FC = () => {
  const { width, height, portrait, margin } = useLayout();
  if (portrait) return null;
  const cw = (width - margin.x * 2 - 36 * 2) / 3;
  const top = 290, ch = height - top - margin.bottom - 20;
  const group = (g: typeof SERVICES_RE, base: number, exit?: number) =>
    g.items.map((it, i) => (
      <ServiceCard key={it.key} iconKey={it.key} title={it.title} text={it.text} photo={it.photo}
        start={base + i * stagger.card} exitAt={exit === undefined ? undefined : exit + i * 4}
        box={{ left: width - margin.x - cw - i * (cw + 36), top, width: cw, height: ch }}
        titleSize={54} textSize={33} kbDir={i % 2 ? 1 : -1} />
    ));
  return (
    <AbsoluteFill>
      <GradientBackground variant="deep" seed={3} />
      <div style={{ position: "absolute", right: margin.x, top: margin.top - 6 }}>
        <KineticText text="من الفكرة.. إلى المفتاح" size={92} weight={900} start={2} goldWords={[3]} />
      </div>
      <div style={{ position: "absolute", right: margin.x, top: margin.top + 118, width: 640, height: 60 }}>
        <KineticText text={SERVICES_RE.label} size={42} weight={700} color={colors.gold} start={16} exitAt={SPLIT - 12} style={{ whiteSpace: "nowrap" }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: 640 }}>
          <KineticText text={SERVICES_CT.label} size={42} weight={700} color={colors.gold} start={SPLIT + 4} style={{ whiteSpace: "nowrap" }} />
        </div>
      </div>
      <div style={{ position: "absolute", right: margin.x + 520, top: margin.top + 140 }}>
        <Rule start={20} dur={30} width={width - margin.x * 2 - 520} thickness={3} color="rgba(220,165,13,0.5)" />
      </div>
      {group(SERVICES_RE, 26, SPLIT - 16)}
      {group(SERVICES_CT, SPLIT + 4)}
    </AbsoluteFill>
  );
};
