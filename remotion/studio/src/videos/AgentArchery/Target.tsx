import { C } from "../../lib/theme";

/** لوحة هدف نيون. draw (0..1) يرسم الحلقات، glow شدة التوهج */
export const Target: React.FC<{
  size: number;
  draw?: number;
  glow?: number;
  style?: React.CSSProperties;
}> = ({ size, draw = 1, glow = 1, style }) => {
  const rings = [
    { r: 96, c: "#FFFFFF" },
    { r: 78, c: "#1B2330" },
    { r: 60, c: C.b },
    { r: 42, c: C.r },
    { r: 22, c: C.y },
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      style={{
        overflow: "visible",
        filter: `drop-shadow(0 0 ${18 * glow}px ${C.y}88) drop-shadow(0 0 ${40 * glow}px ${C.b}66)`,
        ...style,
      }}
    >
      {rings.map((ring, i) => {
        const L = 2 * Math.PI * ring.r;
        const p = Math.min(1, Math.max(0, draw * 1.25 - i * 0.06));
        return (
          <g key={i}>
            <circle cx={100} cy={100} r={ring.r} fill={ring.c} opacity={p} />
            <circle
              cx={100}
              cy={100}
              r={ring.r}
              fill="none"
              stroke={i === 1 ? C.cyan : "#ffffff"}
              strokeOpacity={0.55}
              strokeWidth={1.2}
              strokeDasharray={L}
              strokeDashoffset={L * (1 - p)}
              transform="rotate(-90 100 100)"
            />
          </g>
        );
      })}
      <circle cx={100} cy={100} r={4} fill={C.ink} opacity={draw} />
    </svg>
  );
};

/** سهم عمودي يشير للأعلى */
export const Arrow: React.FC<{ len?: number; color?: string; style?: React.CSSProperties }> = ({
  len = 360,
  color = "#EDE6D8",
  style,
}) => (
  <svg width={60} height={len} viewBox={`0 0 60 ${len}`} style={{ overflow: "visible", ...style }}>
    <path d={`M30 ${len - 40} V40`} stroke={color} strokeWidth={9} strokeLinecap="round" />
    <path d="M30 6 L12 44 L30 34 L48 44 Z" fill={color} />
    <path d={`M30 ${len - 70} L8 ${len - 30} L8 ${len} L30 ${len - 26} L52 ${len} L52 ${len - 30} Z`} fill={C.r} />
  </svg>
);
