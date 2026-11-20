import { Img, staticFile } from "remotion";
import { useMusic } from "../../lib/music";
import { clamp, ramp } from "../ClaudeTrio/parts";

/** هوية «وكيل ولا فريق»: ورق كريمي + حبر كحلي + برتقالي للوكيل الواحد + تيل للفريق */
export const P = {
  bg: "#F3EBDD",
  paper: "#EFE5D2",
  grid: "#D9CCB3",
  ink: "#1B2236",
  mute: "#6C6A66",
  single: "#E4572E",
  team: "#14A38B",
  violet: "#6B5BD6",
  gold: "#E0A526",
  white: "#FFFDF8",
  bad: "#D83A4A",
  ok: "#1E9E6A",
};
export const V = (p: string) => staticFile(`videos/agent-team/${p}`);

/** قطعة وكيل (منظر علوي): دائرة بشعار Claude، حلقة لون، تاج اختياري، وحلقة تقدّم */
export const Pawn: React.FC<{ s?: number; color: string; crown?: boolean; progress?: number; f: number; pulse?: boolean }> = ({
  s = 200,
  color,
  crown,
  progress,
  f,
  pulse,
}) => {
  const { kick } = useMusic();
  const k = pulse ? kick : 0;
  return (
    <div style={{ position: "relative", width: s, height: s, scale: `${1 + k * 0.04}` }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "rgba(40,30,10,.28)", filter: "blur(14px)", translate: `${s * 0.07}px ${s * 0.1}px` }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: P.white, border: `${s * 0.065}px solid ${color}`, boxShadow: `0 ${s * 0.04}px 0 ${color}66` }} />
      {crown ? (
        <svg width={s * 1.36} height={s * 1.36} viewBox="-68 -68 136 136" style={{ position: "absolute", left: -s * 0.18, top: -s * 0.18, rotate: `${f * 0.4}deg` }}>
          {Array.from({ length: 10 }, (_, i) => (
            <path key={i} d="M-6 -62 L0 -74 L6 -62 Z" fill={P.gold} transform={`rotate(${i * 36})`} />
          ))}
          <circle r={62} fill="none" stroke={P.gold} strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
        </svg>
      ) : null}
      {progress !== undefined ? (
        <svg width={s * 1.2} height={s * 1.2} viewBox="-60 -60 120 120" style={{ position: "absolute", left: -s * 0.1, top: -s * 0.1, rotate: "-90deg" }}>
          <circle r={56} fill="none" stroke={`${color}33`} strokeWidth={5} />
          <circle r={56} fill="none" stroke={color} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${clamp(progress) * 352} 400`} />
        </svg>
      ) : null}
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
        <Img src={V("claude-color.svg")} style={{ width: s * 0.5, height: s * 0.5 }} />
      </div>
    </div>
  );
};

/** رموز بسيطة (خطية) لبطاقات المهام */
export const Ico: React.FC<{ k: "search" | "chart" | "pen" | "check" | "target" | "doc" | "tool" | "stop" | "hourglass" | "bug"; s?: number; c?: string }> = ({ k, s = 64, c = P.ink }) => {
  const d: Record<string, React.ReactNode> = {
    search: (<><circle cx="10.5" cy="10.5" r="6" /><path d="M15 15l5 5" /></>),
    chart: (<><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>),
    pen: (<><path d="M4 20l1-4L16 5l3 3L8 19z" /><path d="M14 7l3 3" /></>),
    check: <path d="M5 12.5l4.6 4.6L19 7.5" />,
    target: (<><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.4" fill={c} /></>),
    doc: (<><path d="M6 3h8l4 4v14H6z" /><path d="M9 12h6M9 16h6" /></>),
    tool: <path d="M14.5 6.5a4 4 0 00-5 5L4 17l3 3 5.5-5.5a4 4 0 005-5l-2.5 2.5-2.5-.5-.5-2.5z" />,
    stop: (<><path d="M8 3h8l5 5v8l-5 5H8l-5-5V8z" /><path d="M8 12h8" /></>),
    hourglass: <path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9" />,
    bug: (<><ellipse cx="12" cy="13" rx="5" ry="7" /><path d="M12 6V3M4 9l4 2M4 17l4-2M20 9l-4 2M20 17l-4-2" /></>),
  };
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {d[k]}
    </svg>
  );
};

/** بطاقة مهمة مسطحة على الطاولة */
export const Tile: React.FC<{ s?: number; color: string; icon: React.ComponentProps<typeof Ico>["k"]; label?: string; done?: number; lf?: number }> = ({ s = 170, color, icon, label, done = 0 }) => (
  <div style={{ position: "relative", width: s, height: s, borderRadius: s * 0.18, background: P.white, border: `4px solid ${color}`, boxShadow: `0 ${s * 0.05}px 0 ${color}55, 0 14px 30px rgba(40,30,10,.25)`, display: "grid", placeItems: "center", direction: "rtl" }}>
    <div style={{ display: "grid", justifyItems: "center", gap: 4 }}>
      <Ico k={icon} s={s * 0.36} c={color} />
      {label ? <div style={{ font: `900 ${s * 0.25}px/1.1 "Noto Kufi Arabic"`, color: P.ink }}>{label}</div> : null}
    </div>
    <div style={{ position: "absolute", right: -s * 0.14, top: -s * 0.14, width: s * 0.34, height: s * 0.34, borderRadius: "50%", background: P.ok, display: "grid", placeItems: "center", scale: `${done}`, opacity: clamp(done) }}>
      <Ico k="check" s={s * 0.22} c="#fff" />
    </div>
  </div>
);

export const fall = (lf: number, at: number, d = 12) => ramp(lf, at, d);
