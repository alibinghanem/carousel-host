import { Img } from "remotion";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { BACK, BODY, DISPLAY, EN, K, OUT, SEG, SegK, V, ease } from "./theme";

/** عنوان أعلى الشاشة لكل مشهد: كشف بقناع ويخرج قبل القطع */
export const Headline: React.FC<{ f: number; seg: SegK; kicker?: React.ReactNode; lines: React.ReactNode[]; size?: number; y?: number }> = ({
  f,
  seg,
  kicker,
  lines,
  size = 96,
  y = 330,
}) => {
  const [a, b] = SEG[seg];
  if (f < a - 2 || f > b + 2) return null;
  const lf = f - a;
  const out = b - a - 12;
  return (
    <div style={{ position: "absolute", top: y, left: 60, right: 60, direction: "rtl", textAlign: "center" }}>
      {kicker ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}>
          <Reveal f={lf} at={0} d={16} out={out}>
            <div style={{ font: `600 36px ${BODY}`, color: "rgba(255,247,238,.82)", whiteSpace: "nowrap" }}>{kicker}</div>
          </Reveal>
        </div>
      ) : null}
      {lines.map((l, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "center" }}>
          <Reveal f={lf} at={4 + i * 7} d={20} out={out}>
            <div style={{ font: `700 ${size}px/1.3 ${DISPLAY}`, color: K.ivory, whiteSpace: "nowrap", textShadow: "0 6px 30px rgba(90,30,10,.35)" }}>{l}</div>
          </Reveal>
        </div>
      ))}
    </div>
  );
};

/** شرح أسفل النافذة */
export const Caption: React.FC<{ f: number; seg: SegK; at: number; children: React.ReactNode; y?: number }> = ({ f, seg, at, children, y = 1292 }) => {
  const [a, b] = SEG[seg];
  if (f < a - 2 || f > b + 2) return null;
  const lf = f - a;
  return (
    <div style={{ position: "absolute", top: y, left: 70, right: 70, direction: "rtl", display: "flex", justifyContent: "center", textAlign: "center" }}>
      <Reveal f={lf} at={at} d={18} out={b - a - 12}>
        <div style={{ font: `600 38px/1.5 ${BODY}`, color: K.ivory }}>{children}</div>
      </Reveal>
    </div>
  );
};

export const Chip: React.FC<{ children: React.ReactNode; p?: number; tone?: "ivory" | "deep" }> = ({ children, p = 1, tone = "ivory" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 10,
      padding: "8px 22px 12px",
      borderRadius: 999,
      background: tone === "ivory" ? K.ivory : "rgba(126,53,25,.55)",
      color: tone === "ivory" ? K.clay2 : K.ivory,
      font: `700 32px ${BODY}`,
      whiteSpace: "nowrap",
      opacity: p,
      transform: `translateY(${(1 - p) * 20}px) scale(${0.9 + 0.1 * p})`,
      boxShadow: tone === "ivory" ? "0 8px 20px rgba(90,30,10,.18)" : undefined,
    }}
  >
    {children}
  </span>
);

/** كلمة لاتينية معزولة داخل جملة عربية (عشان «؟» تجي في مكانها) */
export const En: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c }) => (
  <span style={{ fontFamily: EN, direction: "ltr", unicodeBidi: "isolate", color: c }}>{children}</span>
);

export const ClaudeLogo: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => <Img src={V("claude-color.svg")} style={{ width: size, height: size, ...style }} />;

/** أيقونة ملف بلون امتداده */
const EXT: Record<string, string> = { pdf: "#E5484D", xlsx: "#1D6F42", docx: "#2B5BD7", pptx: "#D2691E", jpg: "#8B5CF6" };
export const FileIcon: React.FC<{ ext: keyof typeof EXT | string; w?: number; label?: string }> = ({ ext, w = 64, label }) => {
  const h = w * 1.25;
  const c = EXT[ext] ?? K.sub;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{ position: "relative", width: w, height: h, borderRadius: w * 0.14, background: "#fff", border: `2px solid ${K.line}`, boxShadow: "0 6px 14px rgba(20,20,19,.12)" }}>
        <div style={{ position: "absolute", top: -2, left: -2, width: w * 0.32, height: w * 0.32, borderRadius: `${w * 0.14}px 0 ${w * 0.1}px 0`, background: K.ivory2, borderRight: `2px solid ${K.line}`, borderBottom: `2px solid ${K.line}` }} />
        <div style={{ position: "absolute", bottom: h * 0.12, left: w * 0.1, right: w * 0.1, padding: "2px 0 4px", borderRadius: 6, background: c, color: "#fff", font: `800 ${Math.round(w * 0.22)}px ${EN}`, textAlign: "center" }}>{ext.toUpperCase()}</div>
        {[0.34, 0.46].map((t) => (
          <div key={t} style={{ position: "absolute", top: h * t, left: w * 0.16, right: w * 0.16, height: 3, borderRadius: 2, background: K.line }} />
        ))}
      </div>
      {label ? <div style={{ font: `600 22px ${BODY}`, color: K.ink, whiteSpace: "nowrap", direction: "rtl" }}>{label}</div> : null}
    </div>
  );
};

export const Folder: React.FC<{ w?: number; label?: string; fill?: number }> = ({ w = 120, label, fill = 0 }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
    <svg width={w} height={w * 0.78} viewBox="0 0 100 78">
      <path d="M4 12a6 6 0 016-6h24l8 8h48a6 6 0 016 6v48a6 6 0 01-6 6H10a6 6 0 01-6-6z" fill="#E9A07F" />
      <path d="M4 26a6 6 0 016-6h80a6 6 0 016 6v42a6 6 0 01-6 6H10a6 6 0 01-6-6z" fill={K.clay} />
      <rect x="30" y={60 - 26 * fill} width="40" height={26 * fill} rx="3" fill="rgba(255,255,255,.35)" />
    </svg>
    {label ? <div style={{ font: `700 22px ${BODY}`, color: K.ink, whiteSpace: "nowrap" }}>{label}</div> : null}
  </div>
);

/** مؤشر الفأرة: يتحرك بين نقاط بتسهيل، ومع نقرة تموّج */
export type CurKey = { f: number; x: number; y: number; click?: boolean };
export const Cursor: React.FC<{ f: number; keys: CurKey[]; show: number }> = ({ f, keys, show }) => {
  if (show <= 0.01) return null;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 0; i < keys.length - 1; i++) {
    const a = keys[i];
    const b = keys[i + 1];
    if (f >= a.f && f <= b.f) {
      const t = ease(f, a.f, b.f - a.f, OUT);
      x = a.x + (b.x - a.x) * t;
      y = a.y + (b.y - a.y) * t;
    } else if (f > b.f) {
      x = b.x;
      y = b.y;
    }
  }
  const click = keys.find((k) => k.click && f >= k.f && f < k.f + 16);
  const cp = click ? (f - click.f) / 16 : 0;
  const press = click && f - click.f < 4 ? 0.85 : 1;
  return (
    <>
      {click ? (
        <div style={{ position: "absolute", left: x - 40 * cp - 6, top: y - 40 * cp - 6, width: 12 + 80 * cp, height: 12 + 80 * cp, borderRadius: "50%", border: `4px solid ${K.clay}`, opacity: 1 - cp }} />
      ) : null}
      <svg width={40} height={48} viewBox="0 0 24 28" style={{ position: "absolute", left: x - 4, top: y - 2, opacity: show, transform: `scale(${press})`, transformOrigin: "4px 2px", filter: "drop-shadow(0 4px 6px rgba(0,0,0,.3))" }}>
        <path d="M2 2 L2 22 L7.5 17 L11 25 L14.5 23.5 L11 15.8 L18.5 15.8 Z" fill="#141413" stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </>
  );
};

export const popIn = (f: number, at: number) => ease(f, at, 14, BACK);
