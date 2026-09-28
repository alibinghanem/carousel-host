import React from "react";
import { useCurrentFrame } from "remotion";
import { LOGO_COLORS, LOGO_LAYERS, LOGO_VIEWBOX } from "../generated/logo-paths";
import { BG_TONE } from "../generated/bg-tone";

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
};

/**
 * The real logo (vector trace, untouched colours) present in every frame. Its plate is not fixed white:
 * it is a frosted glass tinted by the measured colour of the frame behind it (BG_TONE, sampled per frame),
 * kept light enough that the charcoal + gold logo always stays legible.
 */
export const LogoBadge: React.FC<{ height?: number; right?: number; top?: number }> = ({ height = 144, right = 60, top = 90 }) => {
  const frame = useCurrentFrame();
  const { x, y, w, h } = LOGO_VIEWBOX;
  const width = (height * w) / h;
  const pad = height * 0.1;
  const g = LOGO_LAYERS;
  const bg = BG_TONE[Math.min(frame, BG_TONE.length - 1)] ?? [7, 15, 38];
  const [hue, sat] = rgbToHsl(bg[0], bg[1], bg[2]);
  // plate = the frame's own hue, saturation lifted, lightness kept high (0.90-0.94) so charcoal + gold stay legible
  const S = Math.round(Math.min(65, 22 + sat * 70));
  const c1 = `hsla(${Math.round(hue)}, ${S}%, 94%, 0.93)`;
  const c2 = `hsla(${Math.round(hue)}, ${Math.min(80, S + 12)}%, 87%, 0.93)`;
  return (
    <div
      style={{
        position: "absolute", right, top, width: width + pad * 2, height: height + pad * 2, borderRadius: pad * 0.9,
        background: `linear-gradient(160deg, ${c1}, ${c2})`,
        backdropFilter: "blur(16px) saturate(1.3)",
        boxShadow: "0 14px 40px rgba(3,6,15,0.5), 0 2px 8px rgba(3,6,15,0.35), inset 0 0 0 1.5px rgba(255,255,255,0.35)",
      }}
    >
      <svg viewBox={`${x} ${y} ${w} ${h}`} width={width} height={height} style={{ position: "absolute", left: pad, top: pad }}>
        <path d={g.markGold.d} fill={LOGO_COLORS.gold} fillRule="evenodd" />
        <path d={g.markDark.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" />
        <path d={g.baseBar.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" />
        <path d={g.nameAr.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" />
        <path d={g.midBar.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" />
        <path d={g.nameEn.d} fill={LOGO_COLORS.gold} fillRule="evenodd" />
      </svg>
    </div>
  );
};
