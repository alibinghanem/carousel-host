import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { LOGO_COLORS, LOGO_LAYERS, LOGO_VIEWBOX } from "../generated/logo-paths";
import { clampOpts, ease } from "../theme";

/**
 * The real brand logo (vector-traced from logo.jpg, colours untouched) assembled in stages:
 * gold tower outline draws → fills, charcoal tower → base bar → Arabic name wipes in (R→L) → English name → light sweep.
 * Aspect ratio is fixed by the viewBox; only `height` is a free parameter.
 */
export const LogoReveal: React.FC<{ start?: number; height: number; plate?: boolean }> = ({ start = 0, height, plate = true }) => {
  const frame = useCurrentFrame() - start;
  const { x, y, w, h } = LOGO_VIEWBOX;
  const width = (height * w) / h;
  const t = (a: number, b: number, easing = ease.inOutQuart) => interpolate(frame, [a, b], [0, 1], { ...clampOpts, easing });
  const pad = height * 0.09;
  const plateP = t(0, 22, ease.expoOut);
  const drawGold = t(6, 40);
  const fillGold = t(30, 52, ease.softOut);
  const drawDark = t(16, 50);
  const fillDark = t(42, 64, ease.softOut);
  const bar = t(48, 66);
  const nameAr = t(58, 84);
  const mid = t(72, 86);
  const nameEn = t(82, 108);
  const sweep = t(108, 140, ease.inOutQuart);
  const g = LOGO_LAYERS;
  const stroke = (d: string, color: string, prog: number, fill: number, wSt: number) => (
    <>
      <path d={d} fill={color} fillOpacity={fill} fillRule="evenodd" />
      <path d={d} fill="none" stroke={color} strokeWidth={wSt} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - prog} opacity={prog > 0 && fill < 1 ? 1 : 0} />
    </>
  );
  return (
    <div style={{ position: "relative", width: width + pad * 2, height: height + pad * 2 }}>
      {plate && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: pad * 0.9,
            background: "linear-gradient(160deg,#FFFFFF,#F7F3E8)",
            boxShadow: "0 50px 120px rgba(3,6,15,0.6), 0 10px 30px rgba(3,6,15,0.4)",
            opacity: plateP,
            scale: String(interpolate(plateP, [0, 1], [0.92, 1])),
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-20%",
              bottom: "-20%",
              width: "26%",
              left: `${interpolate(sweep, [0, 1], [130, -50])}%`,
              rotate: "18deg",
              background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(220,165,13,0.28), rgba(255,255,255,0))",
            }}
          />
        </div>
      )}
      <svg viewBox={`${x} ${y} ${w} ${h}`} width={width} height={height} style={{ position: "absolute", left: pad, top: pad, overflow: "visible" }}>
        <defs>
          <clipPath id="lr-ar"><rect x={x + w - w * nameAr} y={1225} width={w * nameAr + 2} height={100} /></clipPath>
          <clipPath id="lr-en"><rect x={x + w - w * nameEn} y={1360} width={w * nameEn + 2} height={90} /></clipPath>
        </defs>
        {stroke(g.markGold.d, LOGO_COLORS.gold, drawGold, fillGold, 5)}
        {stroke(g.markDark.d, LOGO_COLORS.charcoal, drawDark, fillDark, 5)}
        <g style={{ transformBox: "fill-box", transformOrigin: "right center", scale: `${bar} 1` }}>
          <path d={g.baseBar.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" />
        </g>
        <g clipPath="url(#lr-ar)"><path d={g.nameAr.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" /></g>
        <g style={{ transformBox: "fill-box", transformOrigin: "right center", scale: `${mid} 1` }}>
          <path d={g.midBar.d} fill={LOGO_COLORS.charcoal} fillRule="evenodd" />
        </g>
        <g clipPath="url(#lr-en)"><path d={g.nameEn.d} fill={LOGO_COLORS.gold} fillRule="evenodd" /></g>
      </svg>
    </div>
  );
};
