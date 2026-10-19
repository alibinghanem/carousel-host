import { COLOR, K, MIN, MONO, OUT, SEG, STEPS, StepK, ease } from "./theme";

/** كم دقيقة انصرفت عند الفريم f (كل خطوة تصرف دقايقها على طول مشهدها) */
export const elapsedAt = (f: number) => {
  let m = 0;
  for (const k of STEPS) {
    const [a, b] = SEG[k];
    const [m0, m1] = MIN[k];
    if (f >= a) m = m0 + (m1 - m0) * ease(f, a + 10, b - a - 40, OUT);
  }
  return m;
};

const arc = (r: number, a0: number, a1: number) => {
  const p = (a: number) => [Math.sin((a / 60) * Math.PI * 2) * r, -Math.cos((a / 60) * Math.PI * 2) * r];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = a1 - a0 > 30 ? 1 : 0;
  return `M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
};

/** مؤقت مطبخ: وجه كريمي، شرائح ملوّنة لكل خطوة، وعقرب، والباقي رقمياً في الوسط */
export const Timer: React.FC<{ f: number; kick: number; faceP?: number }> = ({ f, kick, faceP = 0 }) => {
  const m = elapsedAt(f);
  const left = Math.max(0, 60 - m);
  const mm = Math.ceil(left - 0.001);
  const ang = (m / 60) * 360;
  return (
    <svg width={400} height={420} viewBox="-200 -210 400 420" style={{ overflow: "visible" }}>
      {/* المقبض */}
      <rect x={-34} y={-206} width={68} height={34} rx={10} fill={K.tomato2} />
      <circle r={182} fill={K.tomato} style={{ filter: "drop-shadow(0 18px 24px rgba(29,43,42,.28))" }} />
      <circle r={182} fill="none" stroke={K.tomato2} strokeWidth={6} />
      <circle r={156} fill={K.cream} />
      {STEPS.map((k: StepK) => {
        const [m0, m1] = MIN[k];
        if (m <= m0) return null;
        return <path key={k} d={arc(150, m0, Math.min(m, m1))} fill={COLOR[k]} opacity={0.9} />;
      })}
      <circle r={96} fill={K.cream} />
      {Array.from({ length: 60 }, (_, i) => {
        const big = i % 5 === 0;
        const a = (i / 60) * Math.PI * 2;
        const r0 = big ? 132 : 142;
        return <line key={i} x1={Math.sin(a) * r0} y1={-Math.cos(a) * r0} x2={Math.sin(a) * 152} y2={-Math.cos(a) * 152} stroke={K.ink} strokeWidth={big ? 4 : 2} strokeLinecap="round" opacity={0.75} />;
      })}
      {[0, 10, 20, 30, 40, 50].map((n) => {
        const a = (n / 60) * Math.PI * 2;
        return (
          <text key={n} x={Math.sin(a) * 114} y={-Math.cos(a) * 114 + 9} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={24} fill={K.ink}>
            {n}
          </text>
        );
      })}
      {/* العقرب */}
      <g transform={`rotate(${ang})`}>
        <line x1={0} y1={-60} x2={0} y2={-150} stroke={K.ink} strokeWidth={6} strokeLinecap="round" />
        <circle cy={-150} r={7} fill={K.ink} />
      </g>
      <polygon points="-14,-196 14,-196 0,-172" fill={K.ink} />
      {faceP < 1 ? (
        <text y={18} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={54} fill={K.ink} opacity={1 - faceP} style={{ direction: "ltr" }}>
          {`${String(mm).padStart(2, "0")}:00`}
        </text>
      ) : null}
      <circle r={182 + kick * 6} fill="none" stroke={K.mustard} strokeWidth={3} opacity={kick * 0.6} />
    </svg>
  );
};
