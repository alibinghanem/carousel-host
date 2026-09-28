import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FONT, clampOpts, colors, ease, useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { ImageReveal } from "../components/ImageReveal";
import { KineticText, Rule } from "../components/KineticText";
import { LogoReveal } from "../components/LogoReveal";
import { BRAND as PHOTOS } from "../generated/photos";
import { BRAND } from "../content";

const Pill: React.FC<{ start: number; children: React.ReactNode; size: number; gold?: boolean }> = ({ start, children, size, gold }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, 22], [0, 1], { ...clampOpts, easing: ease.expoOut });
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 18, padding: `${size * 0.42}px ${size * 0.9}px`, borderRadius: 999, fontFamily: FONT, fontSize: size, fontWeight: 700,
      color: gold ? colors.navyDeep : colors.cream, background: gold ? `linear-gradient(90deg, ${colors.goldSoft}, ${colors.gold})` : "rgba(247,243,232,0.08)",
      outline: gold ? undefined : `1.5px solid rgba(247,243,232,0.35)`, outlineOffset: -1.5, opacity: p, translate: `0 ${(1 - p) * 30}px`, clipPath: `inset(0 ${(1 - p) * 100}% 0 0 round 999px)`,
      boxShadow: gold ? "0 20px 50px rgba(220,165,13,0.28)" : undefined }}>
      {children}
    </div>
  );
};

const Globe: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.2 3 14.8 0 18M12 3c-3 3.2-3 14.8 0 18" /></svg>
);
const Phone: React.FC<{ s: number; c: string }> = ({ s, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></svg>
);

/** S7 — logo assembly + tagline + CTA. Everything is on screen by f≈125; the last ≥3 s is a hold. */
export const EndCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, portrait, margin } = useLayout();
  const logoH = portrait ? 600 : 640;
  const logoW = (logoH * 920) / 1150 + logoH * 0.18;
  const textW = portrait ? width - margin.x * 2 : width - margin.x * 2 - logoW - 110;
  const fade = interpolate(frame, [212, 224], [0, 1], clampOpts);
  return (
    <AbsoluteFill>
      <GradientBackground variant="deep" seed={7} />
      <ImageReveal photo={PHOTOS.hq} reveal="none" box={{ left: 0, top: 0, width, height }} blur={14} brightness={0.5} kb={{ from: 1.08, to: 1.16, dur: 240, dx: 3 }} duotone={0.35} />
      <AbsoluteFill style={{ background: "radial-gradient(80% 80% at 50% 45%, rgba(13,27,62,0.55), rgba(7,15,38,0.92))" }} />
      <div style={portrait ? { position: "absolute", left: 0, right: 0, top: margin.top + 50, display: "flex", justifyContent: "center" } : { position: "absolute", right: margin.x, top: (height - (logoH + logoH * 0.18)) / 2 }}>
        <LogoReveal start={4} height={logoH} />
      </div>
      <div dir="rtl" style={portrait
        ? { position: "absolute", right: margin.x, left: margin.x, top: margin.top + 50 + logoH * 1.18 + 90, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }
        : { position: "absolute", left: margin.x, width: textW, top: 0, bottom: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", gap: 26 }}>
        <KineticText text={BRAND.tagline} size={portrait ? 92 : 118} weight={900} start={96} goldWords={[1]} align={portrait ? "center" : "right"} maxWidth={textW} />
        <Rule start={112} dur={22} width={portrait ? 300 : 260} thickness={6} style={portrait ? { transformOrigin: "center" } : undefined} />
        <KineticText text={BRAND.cta} size={portrait ? 50 : 60} weight={500} color={colors.muted} start={110} align={portrait ? "center" : "right"} maxWidth={textW} shadow={false} />
        <div style={{ height: 14 }} />
        <div style={{ display: "flex", flexDirection: portrait ? "column" : "row", gap: 22, alignItems: "center" }}>
          <Pill start={122} size={portrait ? 46 : 46} gold><Globe s={44} c={colors.navyDeep} /><span dir="ltr">{BRAND.url}</span></Pill>
          <Pill start={132} size={portrait ? 46 : 46}><Phone s={40} c={colors.gold} /><span dir="ltr">{BRAND.phone}</span></Pill>
        </div>
        <div style={{ fontFamily: FONT, fontSize: 26, fontWeight: 500, color: "rgba(185,194,214,0.8)", opacity: interpolate(frame, [140, 160], [0, 1], clampOpts), marginTop: 6 }}>
          رقم الترخيص: <span dir="ltr">{BRAND.license}</span>
        </div>
      </div>
      <AbsoluteFill style={{ background: colors.navyDeep, opacity: fade }} />
    </AbsoluteFill>
  );
};
