import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { colors } from "../theme";

/** Layered navy plate: drifting radial light, gold ember low-left, vignette. Frame-driven (no CSS animation). */
export const GradientBackground: React.FC<{ variant?: "navy" | "deep" | "warm"; seed?: number }> = ({
  variant = "navy",
  seed = 0,
}) => {
  const frame = useCurrentFrame();
  const a = Math.sin((frame + seed * 40) / 110);
  const b = Math.cos((frame + seed * 25) / 140);
  const base =
    variant === "deep"
      ? [colors.navySurface, colors.navyDeep, "#03060F"]
      : variant === "warm"
        ? ["#1E2F5C", colors.navy, colors.navyDeep]
        : [colors.navySurface, colors.navy, colors.navyDeep];
  return (
    <AbsoluteFill style={{ background: colors.navyDeep }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(120% 95% at ${72 + a * 8}% ${18 + b * 8}%, ${base[0]} 0%, ${base[1]} 48%, ${base[2]} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(46% 42% at ${14 + b * 4}% ${92 + a * 3}%, rgba(220,165,13,0.20), rgba(220,165,13,0) 70%)`,
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(90% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }}
      />
    </AbsoluteFill>
  );
};
