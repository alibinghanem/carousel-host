import React from "react";
import { AbsoluteFill } from "remotion";
import { colors, useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { ImageReveal } from "../components/ImageReveal";
import { KineticText, Rule } from "../components/KineticText";
import { P } from "../generated/photos";
import { ASPIRATION } from "../content";

const SWITCH = 100; // beat-aligned: exteriors → interiors

/** S2 — warmth: staggered tall exterior frames drift in opposite directions, then swap to two interiors. */
export const Aspiration: React.FC = () => {
  const { width, portrait, margin, size } = useLayout();
  if (portrait) return null; // not part of the 9:16 cutdown
  const fw = 350, gap = 36, x0 = margin.x;
  const ext = [
    { p: 6, h: 740, top: 190, dy: 6 },
    { p: 78, h: 880, top: 100, dy: -6 },
    { p: 7, h: 690, top: 235, dy: 5 },
  ];
  const int = [
    { p: 104, h: 800, top: 140, dy: 5 },
    { p: 111, h: 800, top: 140, dy: -5 },
  ];
  const colW = width - margin.x * 2 - (3 * fw + 2 * gap) - 60;
  return (
    <AbsoluteFill>
      <GradientBackground variant="warm" seed={1} />
      {ext.map((e, i) => (
        <ImageReveal key={e.p} photo={P[e.p]} reveal="up" start={i * 8} revealDur={30} exitAt={SWITCH - 4} exitDur={18}
          box={{ left: x0 + i * (fw + gap), top: e.top, width: fw, height: e.h }} radius={22} shadow border
          kb={{ from: 1.06, to: 1.22, dur: 110, dx: i % 2 ? -5 : 5, dy: e.dy }} />
      ))}
      {int.map((e, i) => (
        <ImageReveal key={e.p} photo={P[e.p]} reveal="down" start={SWITCH + i * 8} revealDur={30}
          box={{ left: x0 + i * (533 + gap), top: e.top, width: 533, height: e.h }} radius={22} shadow border
          kb={{ from: 1.04, to: 1.16, dur: 100, dx: i ? -4 : 4, dy: e.dy }} />
      ))}
      <div style={{ position: "absolute", right: margin.x, top: 0, bottom: 0, width: colW, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start" }}>
        <KineticText text={ASPIRATION.l1} size={size.headline - 6} weight={900} start={14} goldWords={[3]} maxWidth={colW} exitAt={SWITCH - 6} lineHeight={1.16} />
        <div style={{ position: "absolute", top: "50%", right: 0, width: colW, translate: "0 -50%" }}>
          <KineticText text={ASPIRATION.l2} size={size.sub + 22} weight={800} start={SWITCH + 8} goldWords={[3]} maxWidth={colW} lineHeight={1.25} />
        </div>
        <div style={{ height: 40 }} />
        <Rule start={44} dur={26} width={220} thickness={6} exitAt={SWITCH - 6} />
        <div style={{ position: "absolute", top: "calc(50% + 190px)", right: 0 }}>
          <Rule start={SWITCH + 30} dur={26} width={220} thickness={6} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, bottom: 0, width: 6, height: 0, background: colors.gold }} />
    </AbsoluteFill>
  );
};
