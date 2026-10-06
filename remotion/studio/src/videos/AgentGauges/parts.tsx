import { Img, staticFile } from "remotion";
import { smooth } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";

/** هوية «لوحة القيادة»: كربون أسود + زمردي + عنبري، وخط Cairo للعناوين */
export const P = {
  bg: "#070D0B",
  panel: "#101A16",
  panel2: "#16241E",
  line: "#26352E",
  ink: "#EAF5EF",
  mute: "#8CA39A",
  em: "#2BE39A",
  amber: "#FFB020",
  red: "#FF5A4E",
  cyan: "#4FD9E8",
};
export const HEAD = "Cairo";
export const BODY = "IBM Plex Sans Arabic";
export const MONO = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/agent-gauges/${p}`);
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const ramp = (f: number, a: number, d = 10) => smooth((f - a) / d);
export const typed = (text: string, lf: number, at: number, dur: number) => text.slice(0, Math.round(clamp((lf - at) / dur) * text.length));

/** عدّاد سيارة: قوس 270°، مناطق ملوّنة، مؤشر، وقراءة رقمية. v من 0 إلى 1 */
export const Gauge: React.FC<{
  size?: number;
  v: number;
  zones: [number, number, string][];
  value: string;
  unit?: string;
  f: number;
  tag?: string;
}> = ({ size = 520, v, zones, value, unit, tag }) => {
  const { kick } = useMusic();
  const A0 = -135;
  const A1 = 135;
  const ang = A0 + (A1 - A0) * clamp(v);
  const pt = (a: number, r: number) => [200 + r * Math.sin((a * Math.PI) / 180), 200 - r * Math.cos((a * Math.PI) / 180)];
  const arc = (a: number, b: number, r: number) => {
    const [x0, y0] = pt(a, r);
    const [x1, y1] = pt(b, r);
    return `M${x0} ${y0} A${r} ${r} 0 ${b - a > 180 ? 1 : 0} 1 ${x1} ${y1}`;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 400 400" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="gf" cx="50%" cy="42%" r="60%">
          <stop offset="0" stopColor="#1B2D26" />
          <stop offset="1" stopColor="#0A120F" />
        </radialGradient>
      </defs>
      <circle cx={200} cy={200} r={198} fill="#0A110E" stroke={P.line} strokeWidth={10} />
      <circle cx={200} cy={200} r={186} fill="url(#gf)" stroke="#000" strokeWidth={3} />
      {zones.map(([a, b, c], i) => (
        <path key={i} d={arc(A0 + (A1 - A0) * a, A0 + (A1 - A0) * b, 160)} stroke={c} strokeWidth={12} fill="none" opacity={0.85} />
      ))}
      {Array.from({ length: 41 }, (_, i) => {
        const a = A0 + ((A1 - A0) * i) / 40;
        const major = i % 4 === 0;
        const [x0, y0] = pt(a, major ? 138 : 146);
        const [x1, y1] = pt(a, 152);
        return <line key={i} x1={x0} y1={y0} x2={x1} y2={y1} stroke={P.ink} strokeWidth={major ? 3.5 : 1.6} opacity={major ? 0.9 : 0.4} />;
      })}
      {[0, 0.5, 1].map((t, i) => {
        const [x, y] = pt(A0 + (A1 - A0) * t, 118);
        return (
          <text key={i} x={x} y={y + 7} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={20} fill={P.mute}>
            {["0", "50", "100"][i]}
          </text>
        );
      })}
      {tag ? (
        <text x={200} y={118} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={22} fill={P.amber}>
          {tag}
        </text>
      ) : null}
      <text x={200} y={268} textAnchor="middle" fontFamily={MONO} fontWeight={800} fontSize={74} fill={P.ink} style={{ direction: "ltr" }}>
        {value}
      </text>
      {unit ? (
        <text x={200} y={304} textAnchor="middle" fontFamily={BODY} fontWeight={700} fontSize={26} fill={P.mute}>
          {unit}
        </text>
      ) : null}
      <g transform={`rotate(${ang} 200 200)`}>
        <polygon points="196,214 204,214 201,70 199,70" fill={P.amber} />
        <polygon points="198,214 202,214 200.6,70 199.4,70" fill="#fff" opacity={0.7} />
      </g>
      <circle cx={200} cy={200} r={20 + kick * 3} fill="#0A110E" stroke={P.amber} strokeWidth={5} />
      <circle cx={200} cy={200} r={7} fill={P.amber} />
      <path d="M40 120 A190 190 0 0 1 200 14" stroke="rgba(255,255,255,.18)" strokeWidth={6} fill="none" strokeLinecap="round" />
    </svg>
  );
};

export const ClaudeMark: React.FC<{ size: number; glow?: string }> = ({ size, glow }) => (
  <Img src={V("claude-color.svg")} style={{ width: size, height: size, filter: glow ? `drop-shadow(0 0 ${size * 0.3}px ${glow})` : undefined }} />
);

/** بطاقة طلب صغيرة: pending / ok / warn */
export const Chip: React.FC<{ s?: number; state: 0 | 1 | 2; p: number }> = ({ s = 74, state, p }) => {
  const c = state === 1 ? P.em : state === 2 ? P.amber : P.line;
  return (
    <div style={{ width: s, height: s, borderRadius: s * 0.24, background: state === 0 ? P.panel2 : `${c}`, border: `3px solid ${c}`, display: "grid", placeItems: "center", boxShadow: state ? `0 0 26px ${c}88` : "none", scale: `${0.9 + 0.1 * p}` }}>
      {state === 1 ? (
        <svg width={s * 0.56} height={s * 0.56} viewBox="0 0 24 24" fill="none" stroke={P.bg} strokeWidth={3.6} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.6 4.6L19 7.5" /></svg>
      ) : state === 2 ? (
        <div style={{ font: `900 ${s * 0.5}px ${HEAD}`, color: P.bg }}>!</div>
      ) : (
        <div style={{ width: s * 0.36, height: s * 0.1, borderRadius: 4, background: P.line }} />
      )}
    </div>
  );
};
