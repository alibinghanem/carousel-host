import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, FONT, clampOpts, colors, ease, stagger, useLayout } from "../theme";
import { GradientBackground } from "../components/GradientBackground";
import { KineticText } from "../components/KineticText";
import { StatCounter } from "../components/StatCounter";
import { GrowthChart } from "../components/GrowthChart";
import { ImageReveal } from "../components/ImageReveal";
import { BRAND as PHOTOS } from "../generated/photos";
import { CITIES, GROWTH, GROWTH_BADGE, STATS } from "../content";

const CITY_AT = 165;

const Badge: React.FC<{ start: number; size: number }> = ({ start, size }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - start, [0, 20], [0, 1], { ...clampOpts, easing: ease.expoOut });
  return (
    <div dir="rtl" style={{ display: "inline-flex", alignItems: "baseline", gap: 12, padding: `${size * 0.35}px ${size * 0.7}px`, borderRadius: 999, background: "rgba(220,165,13,0.14)", outline: `1.5px solid rgba(220,165,13,0.6)`, outlineOffset: -1.5, fontFamily: FONT, opacity: p, scale: String(0.9 + p * 0.1) }}>
      <span dir="ltr" style={{ fontFamily: DISPLAY, fontSize: size * 1.5, fontWeight: 620, color: colors.gold }}>+{GROWTH_BADGE.value}%</span>
      <span style={{ fontSize: size, fontWeight: 700, color: colors.cream }}>{GROWTH_BADGE.label}</span>
    </div>
  );
};

/** S5 — proof: real stats count up over the real growth curve; landscape then opens on the footprint map cards. */
export const Proof: React.FC<{ short?: boolean }> = ({ short = false }) => {
  const frame = useCurrentFrame();
  const { width, portrait, margin } = useLayout();
  const phaseOut = short ? 0 : interpolate(frame - CITY_AT + 14, [0, 16], [0, 1], { ...clampOpts, easing: ease.inOutQuart });

  if (portrait) {
    const gridW = width - margin.x * 2;
    return (
      <AbsoluteFill>
        <GradientBackground variant="navy" seed={5} />
        <div style={{ position: "absolute", right: margin.x, top: margin.top }}>
          <KineticText text="أرقام تتحدث عن نفسها" size={74} weight={900} start={2} goldWords={[2]} maxWidth={gridW + 40} />
        </div>
        <div dir="rtl" style={{ position: "absolute", right: margin.x, top: margin.top + 150, width: gridW, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 80, columnGap: 40 }}>
          {STATS.map((s, i) => (
            <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} start={14 + i * stagger.card} size={132} labelSize={36} />
          ))}
        </div>
        <div style={{ position: "absolute", right: margin.x, top: margin.top + 700, width: gridW }}>
          <Badge start={70} size={40} />
          <div style={{ height: 20 }} />
          <GrowthChart data={GROWTH} width={gridW} height={620} start={64} dur={80} labelSize={32} />
        </div>
      </AbsoluteFill>
    );
  }

  const statW = (width - margin.x * 2 - 3 * 40) / 4;
  // ---- landscape city phase geometry
  const bigW = 700, bigH = 720, gTop = 250, tile = { w: (width - margin.x * 2 - bigW - 60 - 30) / 2, h: 345 };
  const cityBox = (i: number) => {
    if (i === 0) return { left: width - margin.x - bigW, top: gTop, width: bigW, height: bigH };
    const k = i - 1, col = k % 2, row = Math.floor(k / 2);
    return { left: width - margin.x - bigW - 60 - tile.w - col * (tile.w + 30), top: gTop + row * (tile.h + 30), width: tile.w, height: tile.h };
  };
  return (
    <AbsoluteFill>
      <GradientBackground variant="navy" seed={5} />
      <div style={{ position: "absolute", right: margin.x, top: margin.top - 6, opacity: 1 - phaseOut }}>
        <KineticText text="أرقام تتحدث عن نفسها" size={92} weight={900} start={2} goldWords={[2]} />
      </div>
      <div dir="rtl" style={{ position: "absolute", right: margin.x, top: 250, width: width - margin.x * 2, display: "flex", gap: 40, opacity: 1 - phaseOut, translate: `0 ${-phaseOut * 60}px` }}>
        {STATS.map((s, i) => (
          <div key={s.label} style={{ width: statW }}>
            <StatCounter value={s.value} suffix={s.suffix} label={s.label} start={12 + i * stagger.card} size={110} labelSize={34} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", right: margin.x, top: 540, width: width - margin.x * 2, opacity: 1 - phaseOut, translate: `0 ${phaseOut * 60}px` }}>
        <div dir="rtl" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
          <div style={{ fontFamily: FONT, fontSize: 38, fontWeight: 700, color: colors.cream, opacity: interpolate(frame, [40, 60], [0, 1], clampOpts) }}>نمو المشاريع من 2000 إلى 2026</div>
          <Badge start={54} size={30} />
        </div>
        <GrowthChart data={GROWTH} width={width - margin.x * 2} height={380} start={46} dur={85} labelSize={28} />
      </div>
      {/* footprint phase */}
      <div style={{ position: "absolute", right: margin.x, top: margin.top - 6 }}>
        <KineticText text="أينما كنت، نحن هناك" size={92} weight={900} start={CITY_AT} goldWords={[3]} />
      </div>
      {CITIES.map((c, i) => (
        <React.Fragment key={c.key}>
          <ImageReveal photo={PHOTOS[c.key]} reveal={i === 0 ? "right" : "up"} start={CITY_AT + 6 + i * 7} revealDur={26}
            box={cityBox(i)} radius={24} shadow border duotone={i === 0 ? 0.0 : 0.5}
            scrim="bottom" scrimOpacity={0.88} kb={{ from: 1.04, to: 1.14, dur: 130, dx: i % 2 ? -3 : 3 }} />
          <div dir="rtl" style={{ position: "absolute", right: (width - (cityBox(i).left + cityBox(i).width)) + 26, top: cityBox(i).top + cityBox(i).height - (i === 0 ? 150 : 108), fontFamily: FONT, opacity: interpolate(frame - CITY_AT - 20 - i * 7, [0, 16], [0, 1], clampOpts), translate: `0 ${interpolate(frame - CITY_AT - 20 - i * 7, [0, 16], [16, 0], { ...clampOpts, easing: ease.expoOut })}px` }}>
            <div style={{ fontFamily: DISPLAY, fontSize: i === 0 ? 70 : 46, fontWeight: 620, color: colors.cream, lineHeight: 1.1 }}>{c.name}</div>
            <div style={{ fontSize: i === 0 ? 32 : 24, fontWeight: 500, color: i === 0 ? colors.gold : colors.muted, marginTop: 6 }}>{c.note}</div>
          </div>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
