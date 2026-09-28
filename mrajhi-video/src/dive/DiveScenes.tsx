import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, DISPLAY, clampOpts, colors, ease, stagger } from "../theme";
import { KineticText, Rule } from "../components/KineticText";
import { StatCounter } from "../components/StatCounter";
import { GrowthChart } from "../components/GrowthChart";
import { P, BRAND as PHOTOS } from "../generated/photos";
import { BRAND, GROWTH, GROWTH_BADGE, HOOK, PILLARS, STATS } from "../content";
import { INK, InnerPortal, Plate } from "./Plate";

const TEXT_RIGHT = 96; // leaves room for the spine
const ghostStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 620, lineHeight: 1, color: "transparent", WebkitTextStroke: "2px rgba(247,243,232,0.28)" };

/** Chapter 1 — a gold line rises, the frame opens around it onto the golden-hour facade, headline lands. */
export const DiveHook: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const lineX = width * 0.66;
  const lineP = interpolate(frame, [0, 22], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const open = interpolate(frame, [10, 44], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const lineFade = interpolate(frame, [40, 60], [1, 0], clampOpts);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0px ${(width - lineX) * (1 - open)}px 0px ${lineX * (1 - open)}px)` }}>
        <Plate photo={P[75]} focal={[0.62, 0.5]} kb={{ from: 1.1, to: 1.32, dur: 130, dx: -4 }} />
      </div>
      <div style={{ position: "absolute", left: lineX - 3, bottom: 0, width: 6, height: height * lineP, background: `linear-gradient(to top, ${colors.goldSoft}, ${colors.gold})`, boxShadow: "0 0 40px rgba(220,165,13,0.85)", opacity: lineFade, borderRadius: 3 }} />
      <div style={{ position: "absolute", right: TEXT_RIGHT, bottom: 190, width: 880 }}>
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 34, fontWeight: 600, color: colors.gold, marginBottom: 18, opacity: interpolate(frame, [44, 60], [0, 1], clampOpts), translate: `0 ${interpolate(frame, [44, 60], [18, 0], { ...clampOpts, easing: ease.expoOut })}px` }}>
          {BRAND.name}
        </div>
        <KineticText text={HOOK.words.join(" ")} size={128} weight={900} start={28} goldWords={[HOOK.goldFrom + 1]} maxWidth={880} staggerFrames={5} />
      </div>
    </AbsoluteFill>
  );
};

type Project = { name: string; district: string; ext: number; int: number; focal?: [number, number]; portal?: [number, number] };

/** Chapters 2-4 — exterior, then a window opens inside the photo and we dive into the interior. */
export const DiveProject: React.FC<{ project: Project; index: number; total: number }> = ({ project, index, total }) => {
  const frame = useCurrentFrame();
  const two = (n: number) => String(n).padStart(2, "0");
  const ghost = interpolate(frame, [0, 40], [80, 0], { ...clampOpts, easing: ease.expoOut });
  const portalAt = 40;
  const swap = interpolate(frame, [portalAt + 14, portalAt + 30], [0, 1], clampOpts);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Plate photo={P[project.ext]} focal={project.focal ?? [0.5, 0.5]} kb={{ from: 1.08, to: 1.26, dur: 110, dx: index % 2 ? 4 : -4 }}>
        <InnerPortal photo={P[project.int]} start={portalAt} fx={project.portal?.[0] ?? 0.5} fy={project.portal?.[1] ?? 0.42} />
      </Plate>
      <div dir="rtl" style={{ position: "absolute", right: TEXT_RIGHT - 10, top: 230, ...ghostStyle, fontSize: 340, opacity: interpolate(frame, [0, 26], [0, 1], clampOpts), translate: `${ghost}px 0` }}>
        <span dir="ltr">{two(index + 1)}</span>
      </div>
      <div style={{ position: "absolute", right: TEXT_RIGHT, left: 60, bottom: 190, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12 }}>
        <div dir="rtl" style={{ fontFamily: FONT, fontSize: 32, fontWeight: 600, color: colors.gold, opacity: interpolate(frame, [4, 20], [0, 1], clampOpts) }}>
          <span>مشروع</span> <span dir="ltr">{two(index + 1)} / {two(total)}</span>
        </div>
        <KineticText text={project.name} size={104} weight={900} start={8} maxWidth={880} />
        <div style={{ display: "flex", alignItems: "center", gap: 24 }} dir="rtl">
          <Rule start={26} dur={22} width={150} thickness={5} />
          <div style={{ fontFamily: FONT, fontSize: 36, fontWeight: 500, color: colors.cream, opacity: interpolate(frame, [30, 48], [0, 1], clampOpts) * (1 - 0.35 * swap) }}>{project.district}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Chapter 5 — the real numbers over the real city; the growth curve is drawn through the skyline. */
export const DiveProof: React.FC = () => {
  const frame = useCurrentFrame();
  const gridW = 1080 - 96 - 130;
  const badge = interpolate(frame - 70, [0, 20], [0, 1], { ...clampOpts, easing: ease.expoOut });
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Plate photo={PHOTOS.riyadh} focal={[0.5, 0.35]} brightness={0.62} kb={{ from: 1.1, to: 1.3, dur: 170, dx: 2, dy: -3 }} scrim={0.8} />
      <div style={{ position: "absolute", right: TEXT_RIGHT, top: 250 }}>
        <KineticText text="أرقام تتحدث عن نفسها" size={72} weight={900} start={2} goldWords={[2]} maxWidth={880} />
      </div>
      <div dir="rtl" style={{ position: "absolute", right: TEXT_RIGHT, top: 430, width: gridW, display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: 70, columnGap: 24 }}>
        {STATS.map((s, i) => (
          <StatCounter key={s.label} value={s.value} suffix={s.suffix} label={s.label} start={10 + i * stagger.card} size={112} labelSize={34} />
        ))}
      </div>
      <div style={{ position: "absolute", right: TEXT_RIGHT, top: 1070, width: gridW }}>
        <div dir="rtl" style={{ display: "inline-flex", alignItems: "baseline", gap: 12, padding: "12px 28px", borderRadius: 999, background: "rgba(7,15,38,0.55)", outline: "1.5px solid rgba(220,165,13,0.7)", outlineOffset: -1.5, fontFamily: DISPLAY, opacity: badge, scale: String(0.9 + 0.1 * badge) }}>
          <span dir="ltr" style={{ fontSize: 46, fontWeight: 620, color: colors.gold }}>+{GROWTH_BADGE.value}%</span>
          <span style={{ fontFamily: FONT, fontSize: 32, fontWeight: 600, color: colors.cream }}>{GROWTH_BADGE.label}</span>
        </div>
        <div style={{ height: 8 }} />
        <GrowthChart data={GROWTH} width={gridW} height={480} start={56} dur={80} labelSize={30} />
      </div>
    </AbsoluteFill>
  );
};

/** Chapter 6 — promise: pillars land word by word while we dive through three interiors; slogan closes it. */
export const DivePromise: React.FC = () => {
  const frame = useCurrentFrame();
  const sloganAt = 84;
  const dim = interpolate(frame - sloganAt, [0, 14], [0, 1], clampOpts);
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Plate photo={P[129]} brightness={0.85 - 0.3 * dim} kb={{ from: 1.08, to: 1.26, dur: 140, dx: 4 }} scrim={0.95}>
        <InnerPortal photo={P[158]} start={30} fx={0.5} fy={0.5} />
        <InnerPortal photo={P[111]} start={64} fx={0.5} fy={0.5} focal={[0.5, 0.55]} />
      </Plate>
      <AbsoluteFill style={{ background: "radial-gradient(70% 50% at 50% 46%, rgba(7,15,38,0.78), rgba(7,15,38,0.2))", opacity: 0.55 + 0.4 * dim }} />
      <div dir="rtl" style={{ position: "absolute", right: TEXT_RIGHT, top: 430, display: "flex", flexDirection: "column", gap: 34 }}>
        {PILLARS.map((pl, i) => {
          const s = 6 + i * 12;
          const inP = interpolate(frame - s, [0, 20], [0, 1], { ...clampOpts, easing: ease.expoOut });
          const o = interpolate(frame - (sloganAt - 14) - i * 3, [0, 12], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
          return (
            <div key={pl.title} style={{ display: "flex", alignItems: "center", gap: 26, opacity: inP * (1 - o), translate: `${(1 - inP) * 140 - o * 90}px 0` }}>
              <div dir="ltr" style={{ fontFamily: DISPLAY, fontWeight: 620, fontSize: 38, color: colors.gold, width: 70, textAlign: "center", flex: "none" }}>{"0" + (i + 1)}</div>
              <div style={{ width: 4, height: 84, background: colors.gold, borderRadius: 4, scale: `1 ${inP}` }} />
              <div style={{ fontFamily: DISPLAY, fontWeight: 620, fontSize: 70, color: colors.cream, lineHeight: 1.3, textShadow: "0 4px 30px rgba(3,6,15,0.6)" }}>{pl.title}</div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingRight: 30 }}>
        <KineticText text={BRAND.slogan} size={100} weight={900} start={sloganAt + 2} align="center" goldWords={[2, 3]} maxWidth={880} />
        <div style={{ height: 36 }} />
        <Rule start={sloganAt + 26} dur={24} width={320} thickness={6} style={{ transformOrigin: "center" }} />
      </div>
    </AbsoluteFill>
  );
};
