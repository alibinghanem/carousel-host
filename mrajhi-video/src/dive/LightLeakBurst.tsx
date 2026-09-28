import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { ease } from "../theme";

/**
 * Warm gold light flare on the music hit (21 s) as the camera lands on the logo.
 * Pure CSS gradients driven by frame (no WebGL), so it renders identically everywhere.
 */
const Leak: React.FC<{ dur: number }> = ({ dur }) => {
  const frame = useCurrentFrame();
  const t = interpolate(frame, [0, dur - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const swell = Math.sin(Math.PI * t); // 0 → 1 → 0
  const sweep = interpolate(t, [0, 1], [-30, 130], { easing: ease.inOutQuart });
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      <AbsoluteFill style={{ background: `radial-gradient(60% 42% at 50% 24%, rgba(255,214,120,${0.75 * swell}), rgba(220,165,13,${0.28 * swell}) 45%, rgba(220,165,13,0) 75%)` }} />
      <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(255,236,190,0) ${sweep - 18}%, rgba(255,226,150,${0.55 * swell}) ${sweep}%, rgba(255,236,190,0) ${sweep + 18}%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 100% 0%, rgba(255,190,80,${0.35 * swell}), rgba(255,190,80,0) 70%)` }} />
    </AbsoluteFill>
  );
};

export const LightLeakBurst: React.FC<{ at: number; dur: number }> = ({ at, dur }) => (
  <Sequence from={at} durationInFrames={dur} layout="absolute-fill">
    <Leak dur={dur} />
  </Sequence>
);
