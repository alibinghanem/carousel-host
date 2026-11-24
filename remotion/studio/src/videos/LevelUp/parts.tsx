import { Img } from "remotion";
import { Reveal } from "../ClaudeVsGptPro/kit";
import { BACK, BODY, DISPLAY, EN, G, OUT, PIXEL, ease, outline } from "./theme";

export const pop = (lf: number, at: number) => ease(lf, at, 14, BACK);
export const fade = (lf: number, at: number, d = 12) => ease(lf, at, d, OUT);

/** شخصية بكسل (كاب ونظارة وثوب أبيض) — تحية لصورة علي */
const SPRITE = [
  "....NNNNN...",
  "...NNNNNNN..",
  ".NNNNNNNNN..",
  "...SSSSSSS..",
  "..SGGSGGSS..",
  "...SSSSSSS..",
  "...SKKKKSS..",
  "....KKKK....",
  "..WWWWWWWW..",
  ".WWWWWWWWWW.",
  ".SWWWWWWWWS.",
  "..WWWWWWWW..",
  "..WwWWWWwW..",
  "..WWWWWWWW..",
];
const LEGS = [
  ["...KK..KK...", "...KK..KK..."],
  ["..KK....KK..", "..K......K.."],
];
const PAL: Record<string, string> = { N: "#1B2A55", S: "#E2A877", G: "#111111", K: "#2B1D14", W: "#FFFFFF", w: "#D9E3F0" };

export const Player: React.FC<{ px?: number; step?: number; squash?: number }> = ({ px = 10, step = 0, squash = 0 }) => {
  const rows = [...SPRITE, ...LEGS[step % 2]];
  return (
    <svg width={12 * px} height={rows.length * px} viewBox={`0 0 12 ${rows.length}`} shapeRendering="crispEdges" style={{ transform: `scale(${1 + squash * 0.12}, ${1 - squash * 0.14})`, transformOrigin: "50% 100%", overflow: "visible" }}>
      <ellipse cx={6} cy={rows.length + 0.3} rx={4.5} ry={0.7} fill="rgba(13,27,61,.25)" />
      {rows.map((r, y) =>
        r.split("").map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={PAL[c]} />)),
      )}
    </svg>
  );
};

/** عملة ذهبية تلف */
export const Coin: React.FC<{ f: number; size?: number; phase?: number }> = ({ f, size = 54, phase = 0 }) => {
  const sx = Math.abs(Math.cos((f + phase) / 9));
  return (
    <div style={{ width: size, height: size, display: "grid", placeItems: "center" }}>
      <div style={{ width: size * Math.max(0.18, sx), height: size, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, #FFF2A8, ${G.coin} 55%, ${G.coin2})`, border: `4px solid ${G.ink}` }} />
    </div>
  );
};

/** عنوان الطابق: «LEVEL n» ببكسل + عنوان عربي بحد كحلي */
export const Title: React.FC<{ lf: number; out: number; level?: string; tag?: string; children: React.ReactNode; size?: number; top?: number }> = ({
  lf,
  out,
  level,
  tag,
  children,
  size = 104,
  top = 300,
}) => (
  <div style={{ position: "absolute", top, left: 40, right: 40, direction: "rtl", textAlign: "center" }}>
    {level ? (
      <div style={{ display: "flex", justifyContent: "center", gap: 18, alignItems: "center", marginBottom: 6, transform: `scale(${pop(lf, 2)})` }}>
        <div style={{ font: `400 34px ${PIXEL}`, color: G.coin, textShadow: outline(G.ink, 4, 6), direction: "ltr", whiteSpace: "nowrap" }}>{level}</div>
        {tag ? <div style={{ padding: "4px 20px 10px", background: G.ink, color: G.white, font: `800 34px ${DISPLAY}`, borderRadius: 8 }}>{tag}</div> : null}
      </div>
    ) : null}
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Reveal f={lf} at={6} d={20} out={out}>
        <div style={{ font: `800 ${size}px/1.25 ${DISPLAY}`, color: G.white, textShadow: outline(G.ink, 7, 12), whiteSpace: "nowrap" }}>{children}</div>
      </Reveal>
    </div>
  </div>
);

/** لوح بكسل أبيض بحد كحلي وظل صلب */
export const Panel: React.FC<{ style?: React.CSSProperties; children: React.ReactNode; tone?: "white" | "ink" | "cream" }> = ({ style, children, tone = "white" }) => (
  <div
    style={{
      background: tone === "ink" ? G.ink : tone === "cream" ? G.cream : G.white,
      color: tone === "ink" ? G.white : G.ink,
      border: `6px solid ${G.ink}`,
      borderRadius: 14,
      boxShadow: `0 12px 0 ${G.ink}`,
      ...style,
    }}
  >
    {children}
  </div>
);

/** فقاعة محادثة بملصق صغير («أنت» أو «المدرّب») */
export const Bubble: React.FC<{ who: "me" | "ai"; p: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ who, p, children, style }) => (
  <div style={{ opacity: p > 0 ? 1 : 0, transform: `translateY(${(1 - p) * 40}px) scale(${0.92 + 0.08 * p})`, transformOrigin: who === "me" ? "100% 100%" : "0 100%", ...style }}>
    <Panel tone={who === "me" ? "ink" : "white"} style={{ position: "relative", padding: "22px 30px 26px", direction: "rtl" }}>
      <div style={{ position: "absolute", top: -26, [who === "me" ? "right" : "left"]: 26, padding: "2px 16px 6px", background: who === "me" ? G.coin : G.ok, color: G.ink, border: `4px solid ${G.ink}`, borderRadius: 10, font: `800 26px ${DISPLAY}` }}>
        {who === "me" ? "أنت" : "المدرّب"}
      </div>
      <div style={{ font: `700 38px/1.5 ${BODY}` }}>{children}</div>
    </Panel>
  </div>
);

export const Caption: React.FC<{ lf: number; at: number; out: number; children: React.ReactNode; y?: number }> = ({ lf, at, out, children, y = 1330 }) => (
  <div style={{ position: "absolute", top: y, left: 60, right: 60, display: "flex", justifyContent: "center", direction: "rtl", textAlign: "center" }}>
    <Reveal f={lf} at={at} d={18} out={out}>
      <div style={{ padding: "8px 30px 14px", borderRadius: 999, background: "rgba(13,27,61,.82)", font: `700 38px/1.45 ${BODY}`, color: G.white, whiteSpace: "nowrap" }}>{children}</div>
    </Reveal>
  </div>
);

export const En: React.FC<{ children: React.ReactNode; c?: string; font?: string }> = ({ children, c, font = EN }) => (
  <span style={{ fontFamily: font, direction: "ltr", unicodeBidi: "isolate", color: c }}>{children}</span>
);

/** مؤشر بكسل ▶ */
export const Cursor: React.FC<{ size?: number; color?: string }> = ({ size = 40, color = G.coin }) => (
  <svg width={size} height={size} viewBox="0 0 8 8" shapeRendering="crispEdges">
    <path d="M1 0h2v1h1v1h1v1h1v2h-1v1h-1v1h-1v1h-2z" fill={G.ink} />
    <path d="M2 1h1v1h1v1h1v2h-1v1h-1v1h-1z" fill={color} />
  </svg>
);

export const Logo: React.FC<{ src: string; size: number }> = ({ src, size }) => <Img src={src} style={{ width: size, height: size }} />;
