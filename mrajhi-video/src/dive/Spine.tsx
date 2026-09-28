import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { FONT, clampOpts, colors, ease } from "../theme";

/**
 * Persistent HUD over the whole dive: a gold spine on the right edge that travels with the film
 * (ticks = chapters) and a tiny brand line. It never cuts, which is what makes the chapters read as one move.
 */
export const Spine: React.FC<{ marks: number[]; total: number }> = ({ marks, total }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const top = 300, bottom = height - 300, len = bottom - top;
  const prog = interpolate(frame, [0, total - 1], [0, 1], { ...clampOpts, easing: ease.softOut });
  const on = interpolate(frame, [20, 44], [0, 1], clampOpts) * interpolate(frame, [total - 40, total - 20], [1, 0], clampOpts);
  const x = width - 46;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: on }}>
      <div style={{ position: "absolute", left: x, top, width: 2, height: len, background: "rgba(247,243,232,0.22)" }} />
      <div style={{ position: "absolute", left: x, top, width: 2, height: len * prog, background: colors.gold, boxShadow: "0 0 18px rgba(220,165,13,0.8)" }} />
      {marks.map((m, i) => {
        const y = top + (m / total) * len;
        const passed = frame >= m;
        return <div key={i} style={{ position: "absolute", left: x - 8, top: y - 1, width: 18, height: 2, background: passed ? colors.gold : "rgba(247,243,232,0.4)" }} />;
      })}
      <div style={{ position: "absolute", left: x - 6, top: top + len * prog - 7, width: 14, height: 14, borderRadius: 7, background: colors.gold, boxShadow: "0 0 24px rgba(220,165,13,0.95)" }} />
      <div dir="rtl" style={{ position: "absolute", right: 72, top: 96, fontFamily: FONT, fontWeight: 600, fontSize: 26, letterSpacing: 0, color: "rgba(247,243,232,0.85)", textShadow: "0 2px 12px rgba(0,0,0,0.5)" }}>
        الراجحي للتنمية والاستثمارات
      </div>
    </div>
  );
};
