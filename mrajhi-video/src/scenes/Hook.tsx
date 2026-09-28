import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT, clampOpts, colors, ease, useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { ImageReveal } from "../components/ImageReveal";
import { KineticText } from "../components/KineticText";
import { P } from "../generated/photos";
import { BRAND, HOOK } from "../content";

/** S1 — a gold line (the logo's gold tower) rises, the frame opens around it onto a golden-hour facade. */
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, portrait, margin, size } = useLayout();
  const lineX = width * (portrait ? 0.7 : 0.64);
  const lineP = interpolate(frame, [0, 22], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const open = interpolate(frame, [12, 46], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const leftInset = lineX * (1 - open);
  const rightInset = (width - lineX) * (1 - open);
  const lineFade = interpolate(frame, [40, 58], [1, 0], clampOpts);
  const headSize = portrait ? 132 : size.hero - 8;
  return (
    <AbsoluteFill>
      <GradientBackground variant="deep" />
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px ${rightInset}px 0px ${leftInset}px)` }}>
        <ImageReveal photo={P[75]} reveal="none" box={{ left: 0, top: 0, width, height }} focal={[portrait ? 0.62 : 0.5, 0.5]}
          kb={{ from: 1.02, to: 1.16, dur: 120, dx: -3, dy: 0 }} scrim="bottom" scrimOpacity={0.88} />
        <AbsoluteFill style={{ background: portrait ? "linear-gradient(to left, rgba(7,15,38,0.55), rgba(7,15,38,0) 70%)" : "linear-gradient(to left, rgba(7,15,38,0.7), rgba(7,15,38,0) 62%)" }} />
      </div>
      {/* the rising gold line */}
      <div style={{ position: "absolute", left: lineX - 3, bottom: 0, width: 6, height: height * lineP, background: `linear-gradient(to top, ${colors.goldSoft}, ${colors.gold})`, boxShadow: "0 0 40px rgba(220,165,13,0.8)", opacity: lineFade, borderRadius: 3 }} />
      <div style={{ position: "absolute", right: margin.x, bottom: portrait ? margin.bottom + 60 : margin.bottom + 30, width: portrait ? width - margin.x * 2 : 1150 }}>
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: size.caption + 4, fontWeight: 700, color: colors.gold, marginBottom: 26, opacity: interpolate(frame, [46, 62], [0, 1], clampOpts), translate: `0 ${interpolate(frame, [46, 62], [20, 0], { ...clampOpts, easing: ease.expoOut })}px` }}>
          {BRAND.name}
        </div>
        <KineticText text={HOOK.words.join(" ")} size={headSize} weight={900} start={30} goldWords={[HOOK.goldFrom + 1]} maxWidth={portrait ? width - margin.x * 2 : 1100} lineHeight={1.12} staggerFrames={5} />
      </div>
    </AbsoluteFill>
  );
};
