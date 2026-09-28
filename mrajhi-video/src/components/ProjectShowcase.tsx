import React from "react";
import { Sequence, interpolate, useCurrentFrame } from "remotion";
import { DISPLAY, FONT, clampOpts, colors, ease, useLayout } from "../theme";
import { KineticText, Rule } from "./KineticText";
import { ImageReveal } from "./ImageReveal";
import { P } from "../generated/photos";

export type Project = { name: string; district: string; main: number; second: number };

const Pin: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colors.gold} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.4" />
  </svg>
);

/** One project scene: main photo (masked reveal) + secondary interior overlapping + name/district. Exits at `exitAt`. */
export const ProjectPanel: React.FC<{ project: Project; index: number; total: number; exitAt: number }> = ({ project, index, total, exitAt }) => {
  const frame = useCurrentFrame();
  const { width, height, portrait, margin, size } = useLayout();
  const out = interpolate(frame - exitAt, [0, 8], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const dir = index % 2 === 0 ? 1 : -1;
  const two = (n: number) => String(n).padStart(2, "0");
  const label = (<><span>مشروع</span>{" "}<span dir="ltr">{two(index + 1)} / {two(total)}</span></>);

  if (!portrait) {
    const photoW = 1110, photoH = 760, top = (height - photoH) / 2 - 20;
    const colW = width - margin.x * 2 - photoW - 80;
    const ghost = interpolate(frame, [0, 40], [60, 0], { ...clampOpts, easing: ease.expoOut });
    return (
      <div style={{ position: "absolute", inset: 0, opacity: 1 - out, translate: `${out * -70}px 0` }}>
        <ImageReveal photo={P[project.main]} reveal="right" revealDur={26} box={{ left: margin.x, top, width: photoW, height: photoH }} radius={26} shadow border
          kb={{ from: 1.02, to: 1.16, dur: 130, dx: 3 * dir, dy: 2 }} scrim="bottom" scrimOpacity={0.35} />
        <ImageReveal photo={P[project.second]} reveal="up" start={12} revealDur={26} box={{ left: margin.x + photoW - 170, top: top + photoH - 270, width: 470, height: 330 }} radius={22} shadow border
          kb={{ from: 1.05, to: 1.22, dur: 130, dx: -4 * dir }} />
        <div dir="rtl" style={{ position: "absolute", right: margin.x - 10, top: top - 30, fontFamily: DISPLAY, fontSize: 430, fontWeight: 900, lineHeight: 1, color: "transparent", WebkitTextStroke: "2px rgba(220,165,13,0.22)", opacity: interpolate(frame, [0, 26], [0, 1], clampOpts), translate: `${ghost}px 0` }}>
          <span dir="ltr">{two(index + 1)}</span>
        </div>
        <div dir="rtl" style={{ position: "absolute", right: margin.x, top: top + 150, width: colW, fontFamily: FONT }}>
          <div style={{ fontSize: size.caption + 2, fontWeight: 700, color: colors.gold, opacity: interpolate(frame, [6, 22], [0, 1], clampOpts) }}>{label}</div>
          <div style={{ height: 24 }} />
          <KineticText text={project.name} size={116} start={10} weight={900} maxWidth={colW} lineHeight={1.1} />
          <div style={{ height: 34 }} />
          <Rule start={26} dur={22} width={220} thickness={6} />
          <div style={{ height: 34 }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 999, background: "rgba(247,243,232,0.08)", outline: "1.5px solid rgba(247,243,232,0.28)", outlineOffset: -1.5, fontSize: size.body - 6, fontWeight: 500, color: colors.cream, opacity: interpolate(frame, [30, 48], [0, 1], clampOpts), translate: `0 ${interpolate(frame, [30, 48], [20, 0], { ...clampOpts, easing: ease.expoOut })}px` }}>
            <Pin size={38} />
            <span>{project.district}</span>
          </div>
        </div>
      </div>
    );
  }
  // portrait
  const photoW = width - margin.x * 2;
  const photoH = 1120;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, translate: `0 ${out * -60}px` }}>
      <ImageReveal photo={P[project.main]} reveal="right" revealDur={26} box={{ left: margin.x, top: margin.top + 20, width: photoW, height: photoH }} radius={26} shadow border
        focal={[0.5, 0.5]} kb={{ from: 1.03, to: 1.2, dur: 130, dx: 4 * dir }} scrim="bottom" scrimOpacity={0.35} />
      <ImageReveal photo={P[project.second]} reveal="up" start={12} revealDur={26} box={{ left: margin.x + 28, top: margin.top + 20 + photoH - 200, width: 420, height: 300 }} radius={20} shadow border
        kb={{ from: 1.05, to: 1.22, dur: 130, dx: -4 * dir }} />
      <div dir="rtl" style={{ position: "absolute", right: margin.x, left: margin.x, top: margin.top + 20 + photoH + 130, fontFamily: FONT }}>
        <div style={{ fontSize: size.caption, fontWeight: 700, color: colors.gold, opacity: interpolate(frame, [6, 22], [0, 1], clampOpts) }}>{label}</div>
        <div style={{ height: 14 }} />
        <KineticText text={project.name} size={92} start={10} weight={900} lineHeight={1.12} />
        <div style={{ height: 20 }} />
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Rule start={26} dur={22} width={150} thickness={5} />
          <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: size.body - 6, fontWeight: 500, color: colors.muted, opacity: interpolate(frame, [30, 48], [0, 1], clampOpts) }}>
            <Pin size={34} /><span>{project.district}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/** Sequenced panels; each starts `step` frames after the previous, overlapping by the exit time. */
export const ProjectShowcase: React.FC<{ projects: Project[]; step: number }> = ({ projects, step }) => {
  const { portrait, margin } = useLayout();
  const frame = useCurrentFrame();
  const active = Math.min(projects.length - 1, Math.floor(frame / step));
  return (
    <>
      {projects.map((p, i) => (
        <Sequence key={p.name} from={i * step} durationInFrames={step + 12} layout="none">
          <ProjectPanel project={p} index={i} total={projects.length} exitAt={step - 8} />
        </Sequence>
      ))}
      {/* progress ticks */}
      <div style={{ position: "absolute", display: "flex", gap: 10, direction: "rtl", right: portrait ? margin.x : margin.x, bottom: portrait ? margin.bottom - 60 : margin.bottom - 40 }}>
        {projects.map((_, i) => (
          <div key={i} style={{ width: i === active ? 56 : 18, height: 6, borderRadius: 6, background: i === active ? colors.gold : "rgba(247,243,232,0.28)" }} />
        ))}
      </div>
    </>
  );
};
