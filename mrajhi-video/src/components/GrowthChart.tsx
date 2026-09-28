import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { evolvePath } from "@remotion/paths";
import { DISPLAY, FONT, clampOpts, colors, ease } from "../theme";

type Props = { data: number[]; width: number; height: number; start?: number; dur?: number; startYear?: number; labelSize: number };

/** Draws the site's real «نمو المشاريع من 2000 إلى 2026» curve; time flows right→left (RTL). */
export const GrowthChart: React.FC<Props> = ({ data, width, height, start = 0, dur = 70, startYear = 2000, labelSize }) => {
  const frame = useCurrentFrame();
  const padT = 80, padB = labelSize * 2.2, padX = 20;
  const w = width - padX * 2, h = height - padT - padB;
  const max = Math.max(...data);
  const pts = data.map((v, i) => ({ x: padX + w - (i / (data.length - 1)) * w, y: padT + h - (v / max) * h }));
  // Catmull-Rom → cubic Bézier
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? p2;
    d += ` C ${p1.x + (p2.x - p0.x) / 6} ${p1.y + (p2.y - p0.y) / 6}, ${p2.x - (p3.x - p1.x) / 6} ${p2.y - (p3.y - p1.y) / 6}, ${p2.x} ${p2.y}`;
  }
  const prog = interpolate(frame - start, [0, dur], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const { strokeDasharray, strokeDashoffset } = evolvePath(prog, d);
  const fIdx = prog * (data.length - 1);
  const i0 = Math.min(data.length - 2, Math.floor(fIdx));
  const head = { x: pts[i0].x + (pts[i0 + 1].x - pts[i0].x) * (fIdx - i0), y: pts[i0].y + (pts[i0 + 1].y - pts[i0].y) * (fIdx - i0) };
  const year = startYear + Math.round(fIdx);
  const axisP = interpolate(frame - start, [0, 20], [0, 1], { ...clampOpts, easing: ease.inOutQuart });
  const ticks = [2000, 2005, 2010, 2015, 2020, 2026];
  const areaD = `${d} L ${pts[pts.length - 1].x} ${padT + h} L ${pts[0].x} ${padT + h} Z`;
  return (
    <svg width={width} height={height} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="gcArea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={colors.gold} stopOpacity="0.32" />
          <stop offset="1" stopColor={colors.gold} stopOpacity="0" />
        </linearGradient>
        <clipPath id="gcClip"><rect x={head.x} y={0} width={width - head.x + 40} height={height} /></clipPath>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((g) => (
        <line key={g} x1={padX + w} x2={padX + w - w * axisP} y1={padT + h - h * g} y2={padT + h - h * g} stroke="rgba(247,243,232,0.10)" strokeWidth={1.5} />
      ))}
      <line x1={padX + w} x2={padX + w - w * axisP} y1={padT + h} y2={padT + h} stroke="rgba(247,243,232,0.4)" strokeWidth={2} />
      <path d={areaD} fill="url(#gcArea)" clipPath="url(#gcClip)" />
      <path d={d} fill="none" stroke={colors.gold} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} style={{ filter: "drop-shadow(0 0 14px rgba(220,165,13,0.55))" }} />
      {ticks.map((t) => {
        const x = padX + w - ((t - startYear) / (data.length - 1)) * w;
        const shown = fIdx >= t - startYear - 0.2;
        return (
          <text key={t} x={x} y={padT + h + labelSize * 1.5} textAnchor="middle" fontFamily={FONT} fontSize={labelSize} fontWeight={500} fill={colors.muted} opacity={shown ? 1 : 0.3}>
            {t}
          </text>
        );
      })}
      {prog > 0 && (
        <g>
          <circle cx={head.x} cy={head.y} r={22} fill={colors.gold} opacity={0.22} />
          <circle cx={head.x} cy={head.y} r={11} fill={colors.gold} />
          <text x={head.x} y={head.y - 34} textAnchor="middle" fontFamily={DISPLAY} fontSize={labelSize * 1.15} fontWeight={800} fill={colors.cream}>{year}</text>
        </g>
      )}
    </svg>
  );
};
