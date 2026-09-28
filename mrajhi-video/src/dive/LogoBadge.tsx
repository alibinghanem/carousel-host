import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { LOGO_COLORS, LOGO_LAYERS, LOGO_VIEWBOX } from "../generated/logo-paths";
import { BG_TONE } from "../generated/bg-tone";

const CREAM = [251, 247, 236] as const;
const CHARCOAL = [0x38, 0x39, 0x3d] as const;
const mix = (a: readonly number[], b: readonly number[], t: number) => `rgb(${a.map((v, i) => Math.round(v * (1 - t) + b[i] * t)).join(",")})`;
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The real logo, transparent (no plate), present in every frame and sitting directly on the shot.
 * Standard brand practice: original colours on light frames; on dark frames the charcoal parts switch to the light
 * (reversed) variant so they never disappear. The switch is continuous, driven by the measured brightness of the
 * frame behind it (BG_TONE), and the gold is never changed. A soft contrasting halo keeps mid-tone frames legible.
 */
export const LogoBadge: React.FC<{ height?: number; right?: number; top?: number; hideFrom?: number }> = ({ height = 156, right = 62, top = 92, hideFrom }) => {
  const frame = useCurrentFrame();
  const { x, y, w, h } = LOGO_VIEWBOX;
  const width = (height * w) / h;
  const g = LOGO_LAYERS;
  const bg = BG_TONE[Math.min(frame, BG_TONE.length - 1)] ?? [7, 15, 38];
  const lum = (0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]) / 255;
  const light = smooth(0.6, 0.76, lum); // 0 = dark frame → reversed logo, 1 = light frame → original logo
  const dark = mix(CREAM, CHARCOAL, light);
  // optional: fade out from `hideFrom` (used on the end card where the full-size logo takes over)
  const visible = hideFrom === undefined ? 1 : interpolate(frame, [hideFrom, hideFrom + 12], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  if (visible <= 0) return null;
  const halo = light > 0.5 ? `drop-shadow(0 0 5px rgba(255,255,255,${0.35 + 0.3 * light}))` : "drop-shadow(0 2px 8px rgba(3,6,15,0.65))";
  return (
    <svg viewBox={`${x} ${y} ${w} ${h}`} width={width} height={height} style={{ position: "absolute", right, top, overflow: "visible", filter: halo, opacity: visible }}>
      <path d={g.markGold.d} fill={LOGO_COLORS.gold} fillRule="evenodd" />
      <path d={g.markDark.d} fill={dark} fillRule="evenodd" />
      <path d={g.baseBar.d} fill={dark} fillRule="evenodd" />
      <path d={g.nameAr.d} fill={dark} fillRule="evenodd" />
      <path d={g.midBar.d} fill={dark} fillRule="evenodd" />
      <path d={g.nameEn.d} fill={LOGO_COLORS.gold} fillRule="evenodd" />
    </svg>
  );
};
