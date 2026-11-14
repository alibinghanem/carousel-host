import { Reveal } from "../ClaudeVsGptPro/kit";
import { B, BODY, DISPLAY, EN, MONO, OUT, ease } from "./theme";

/** خط يُرسم (dash) */
export const Draw: React.FC<{ d: string; p: number; w?: number; c?: string; dash?: boolean; fill?: string }> = ({ d, p, w = 4, c = B.line, dash, fill = "none" }) => (
  <path d={d} pathLength={1} fill={fill} stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dash ? undefined : "1 1"} strokeDashoffset={dash ? undefined : 1 - Math.min(1, Math.max(0, p))} />
);

/** عنوان الخلية */
export const Title: React.FC<{ lf: number; out: number; kicker?: React.ReactNode; children: React.ReactNode; size?: number }> = ({ lf, out, kicker, children, size = 100 }) => (
  <div style={{ position: "absolute", top: 300, left: 60, right: 60, direction: "rtl", textAlign: "center" }}>
    {kicker ? (
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <Reveal f={lf} at={2} d={16} out={out}>
          <div style={{ font: `700 34px ${MONO}`, color: B.yel, direction: "ltr", letterSpacing: 2, whiteSpace: "nowrap" }}>{kicker}</div>
        </Reveal>
      </div>
    ) : null}
    <div style={{ display: "flex", justifyContent: "center" }}>
      <Reveal f={lf} at={6} d={20} out={out}>
        <div style={{ font: `900 ${size}px/1.3 ${DISPLAY}`, color: B.line, whiteSpace: "nowrap" }}>{children}</div>
      </Reveal>
    </div>
  </div>
);

export const Caption: React.FC<{ lf: number; at: number; out: number; children: React.ReactNode; y?: number }> = ({ lf, at, out, children, y = 1300 }) => (
  <div style={{ position: "absolute", top: y, left: 70, right: 70, display: "flex", justifyContent: "center", direction: "rtl", textAlign: "center" }}>
    <Reveal f={lf} at={at} d={18} out={out}>
      <div style={{ font: `600 38px/1.5 ${BODY}`, color: B.soft }}>{children}</div>
    </Reveal>
  </div>
);

/** ركن العنوان الهندسي (title block) أسفل كل خلية */
export const TitleBlock: React.FC<{ n: number; name: string }> = ({ n, name }) => (
  <div style={{ position: "absolute", left: 60, top: 1700, width: 420, height: 120, border: `3px solid ${B.dim}`, display: "grid", gridTemplateColumns: "120px 1fr", font: `700 24px ${MONO}`, color: "rgba(232,242,255,.45)", direction: "ltr" }}>
    <div style={{ borderRight: `3px solid ${B.dim}`, display: "grid", placeItems: "center", fontSize: 40 }}>{String(n).padStart(2, "0")}</div>
    <div style={{ padding: "16px 18px", lineHeight: 1.6 }}>
      SHEET {n}/6
      <br />
      {name}
    </div>
  </div>
);

export const En: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c }) => (
  <span style={{ fontFamily: EN, fontWeight: 700, direction: "ltr", unicodeBidi: "isolate", color: c }}>{children}</span>
);

export const pop = (lf: number, at: number) => ease(lf, at, 14, OUT);
