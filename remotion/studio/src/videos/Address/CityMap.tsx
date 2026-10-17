import React, { useMemo } from "react";
import { A, H, PIN, T, W } from "./theme";

/** مولّد عشوائي ثابت */
const rng = (seed: number) => () => {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
};

const STEP = 160;
const I0 = -2, I1 = 28; // أعمدة الشوارع
const J0 = -8, J1 = 41; // صفوف الشوارع (الشاشة طويلة)
const isMajor = (k: number) => ((k % 5) + 5) % 5 === 0;
const half = (k: number) => (isMajor(k) ? 22 : 8);

type R = { x: number; y: number; w: number; h: number; c: string };

/** يبني بلوكات المدينة مرة وحدة: مباني وحدائق بين الشوارع */
const buildBlocks = () => {
  const r = rng(7);
  const out: R[] = [];
  for (let i = I0; i < I1; i++)
    for (let j = J0; j < J1; j++) {
      const x0 = i * STEP + half(i);
      const x1 = (i + 1) * STEP - half(i + 1);
      const y0 = j * STEP + half(j);
      const y1 = (j + 1) * STEP - half(j + 1);
      const target = i === 13 && j === 10;
      if (!target && r() < 0.08) {
        out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, c: A.park });
        continue;
      }
      out.push({ x: x0, y: y0, w: x1 - x0, h: y1 - y0, c: A.block });
      if (target) continue;
      // 2×2 أو 3×2 مباني داخل البلوك
      const cols = r() < 0.5 ? 2 : 3;
      const rows = 2;
      const gw = (x1 - x0 - 8) / cols;
      const gh = (y1 - y0 - 8) / rows;
      for (let a = 0; a < cols; a++)
        for (let b = 0; b < rows; b++) {
          if (r() < 0.12) continue;
          const inset = 3 + r() * 6;
          out.push({ x: x0 + 4 + a * gw + inset, y: y0 + 4 + b * gh + inset, w: gw - inset * 2, h: gh - inset * 2, c: r() < 0.5 ? A.bld : A.bld2 });
        }
    }
  return out;
};

/** مسار المندوب: من طرف المدينة لين الباب */
const ROUTE = `M 400 3600 V 2400 H 2000 V 1600 H 2160 V ${T.y - 4}`;

/** البيت الهدف: سور، بيت، باب، رقم، شجرتين */
const Home: React.FC<{ door: number; box: number }> = ({ door, box }) => (
  <g>
    <rect x={2096} y={1630} width={128} height={114} fill="#EDE6D8" stroke="#CFC4B1" strokeWidth={1.2} />
    <rect x={2128} y={1652} width={64} height={52} rx={2} fill="#F7F1E6" stroke="#B9AC95" strokeWidth={1.2} />
    <rect x={2128} y={1652} width={64} height={10} fill="#C98B5B" />
    {/* الباب */}
    <rect x={2155} y={1660} width={10} height={14} rx={1} fill="#7A4B2A" />
    <rect x={2155 + 10 * (1 - door)} y={1660} width={10 * door} height={14} fill="#3B2414" opacity={door > 0 ? 1 : 0} />
    <circle cx={2163} cy={1667.5} r={0.8} fill="#F2C14E" />
    <rect x={2152} y={1674} width={16} height={2.4} fill="#BBAE97" />
    {/* رقم البيت */}
    <rect x={2170} y={1662} width={8} height={5} rx={0.8} fill="#2D6BFF" />
    <text x={2174} y={1666} fontSize={3.6} fill="#fff" textAnchor="middle" fontFamily="Space Grotesk" fontWeight={700}>
      12
    </text>
    {/* شجرتين */}
    <circle cx={2110} cy={1645} r={8} fill="#9FCF8E" />
    <circle cx={2210} cy={1645} r={8} fill="#9FCF8E" />
    {/* الطرد */}
    <g opacity={box} transform={`translate(${2154 + (1 - box) * 0} ${1679 - (1 - box) * 6})`}>
      <rect width={12} height={8} rx={0.6} fill="#D69A55" stroke="#A86F33" strokeWidth={0.5} />
      <rect x={5.2} width={1.6} height={8} fill="#F2D29B" />
    </g>
  </g>
);

export const CityMap: React.FC<{ s: number; route: number; routeO: number; door: number; box: number }> = ({ s, route, routeO, door, box }) => {
  const blocks = useMemo(buildBlocks, []);
  const tx = PIN.x - T.x * s;
  const ty = PIN.y - T.y * s;
  // نرسم بس اللي داخل الشاشة
  const vx0 = -tx / s - 60;
  const vy0 = -ty / s - 60;
  const vx1 = (W - tx) / s + 60;
  const vy1 = (H - ty) / s + 60;
  const vis = (x: number, y: number, w: number, h: number) => x + w > vx0 && x < vx1 && y + h > vy0 && y < vy1;
  const X0 = I0 * STEP, X1 = I1 * STEP, Y0 = J0 * STEP, Y1 = J1 * STEP;
  const roads: React.ReactNode[] = [];
  const fills: React.ReactNode[] = [];
  const lines = (k0: number, k1: number, vertical: boolean) => {
    for (let k = k0; k <= k1; k++) {
      const p = k * STEP;
      const hw = half(k);
      const maj = isMajor(k);
      roads.push(vertical ? <rect key={`cv${k}`} x={p - hw - 2} y={Y0} width={hw * 2 + 4} height={Y1 - Y0} fill={maj ? A.majorC : A.casing} /> : <rect key={`ch${k}`} x={X0} y={p - hw - 2} width={X1 - X0} height={hw * 2 + 4} fill={maj ? A.majorC : A.casing} />);
      fills.push(vertical ? <rect key={`fv${k}`} x={p - hw} y={Y0} width={hw * 2} height={Y1 - Y0} fill={maj ? A.major : A.road} /> : <rect key={`fh${k}`} x={X0} y={p - hw} width={X1 - X0} height={hw * 2} fill={maj ? A.major : A.road} />);
    }
  };
  lines(I0, I1, true);
  lines(J0, J1, false);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <rect width={W} height={H} fill={A.land} />
      <g transform={`translate(${tx} ${ty}) scale(${s})`}>
        {roads}
        {fills}
        {blocks.map((b, i) => (vis(b.x, b.y, b.w, b.h) ? <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill={b.c} rx={Math.min(3, b.w / 10)} /> : null))}
        <Home door={door} box={box} />
        <path d={ROUTE} fill="none" stroke={A.route} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" pathLength={1} strokeDasharray={`${route} 1`} opacity={route > 0 ? 0.9 * routeO : 0} />
      </g>
    </svg>
  );
};
