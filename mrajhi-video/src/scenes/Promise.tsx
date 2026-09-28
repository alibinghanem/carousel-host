import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, FONT, clampOpts, colors, ease, useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { KineticText, Rule } from "../components/KineticText";
import { ImageReveal } from "../components/ImageReveal";
import { P } from "../generated/photos";
import { BRAND, PILLARS } from "../content";

/** S6 — brand promise: the four «لماذا نحن» pillars, then the slogan takes the whole frame. */
export const PromiseScene: React.FC<{ short?: boolean }> = ({ short = false }) => {
  const frame = useCurrentFrame();
  const { width, height, portrait, margin } = useLayout();
  const sloganAt = short ? 72 : 152;
  const pillarExit = sloganAt - 8;
  const photos = [129, 158, 111];
  const per = short ? 40 : 84;
  const dim = interpolate(frame - sloganAt, [0, 16], [0, 1], { ...clampOpts, easing: ease.inOutQuart });

  // crossfade stack (photos layered, each fades in/out on its own window)
  const winStart = (i: number) => i * per;
  const photoOpacity = (i: number) =>
    interpolate(frame, [winStart(i) - 8, winStart(i) + 6, winStart(i + 1) - 2, winStart(i + 1) + 8], [i === 0 ? 1 : 0, 1, 1, i === photos.length - 1 ? 1 : 0], clampOpts);

  return (
    <AbsoluteFill>
      <GradientBackground variant="deep" seed={6} />
      {photos.map((p, i) => (
        <div key={p} style={{ position: "absolute", inset: 0, opacity: photoOpacity(i) }}>
          <ImageReveal photo={P[p]} reveal="none"
            box={portrait ? { left: 0, top: 0, width, height: interpolate(dim, [0, 1], [height * 0.46, height]) } : { left: 0, top: 0, width: interpolate(dim, [0, 1], [width * 0.47, width]), height }}
            kb={{ from: 1.04, to: 1.18, dur: per * 2, dx: i % 2 ? -5 : 5 }}
            scrim={portrait ? "bottom" : "right"} scrimOpacity={0.92} brightness={1 - dim * 0.45} />
        </div>
      ))}
      <AbsoluteFill style={{ background: "radial-gradient(70% 60% at 50% 50%, rgba(7,15,38,0.82), rgba(7,15,38,0.55))", opacity: dim }} />
      {/* pillars */}
      <div dir="rtl" style={{ position: "absolute", right: margin.x, top: portrait ? height * 0.5 : 0, bottom: portrait ? margin.bottom : 0, width: portrait ? width - margin.x * 2 : width * 0.44, display: "flex", flexDirection: "column", justifyContent: "center", gap: portrait ? 26 : 34 }}>
        {PILLARS.map((pl, i) => {
          const s = 8 + i * (short ? 8 : 14);
          const out = interpolate(frame - pillarExit - i * 3, [0, 14], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
          const inP = interpolate(frame - s, [0, 22], [0, 1], { ...clampOpts, easing: ease.expoOut });
          return (
            <div key={pl.title} style={{ display: "flex", alignItems: "center", gap: 28, fontFamily: FONT, opacity: inP * (1 - out), translate: `${(1 - inP) * 120 - out * 100}px 0` }}>
              <div dir="ltr" style={{ fontFamily: DISPLAY, fontSize: 40, fontWeight: 620, color: colors.gold, width: 72, textAlign: "center", flex: "none" }}>{"0" + (i + 1)}</div>
              <div style={{ width: 4, alignSelf: "stretch", background: colors.gold, borderRadius: 4, scale: `1 ${inP}` }} />
              <div>
                <div style={{ fontFamily: DISPLAY, fontSize: portrait ? 58 : 68, fontWeight: 620, color: colors.cream, lineHeight: 1.1 }}>{pl.title}</div>
                {!short && <div style={{ fontSize: 34, fontWeight: 500, color: colors.muted, marginTop: 8 }}>{pl.text}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {/* slogan */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <KineticText text={BRAND.slogan} size={portrait ? 98 : 132} weight={900} start={sloganAt + 4} align="center" goldWords={[2, 3]} maxWidth={portrait ? width - 140 : 1400} lineHeight={1.18} />
        <div style={{ height: 40 }} />
        <Rule start={sloganAt + 26} dur={24} width={340} thickness={6} style={{ transformOrigin: "center" }} />
      </div>
    </AbsoluteFill>
  );
};
