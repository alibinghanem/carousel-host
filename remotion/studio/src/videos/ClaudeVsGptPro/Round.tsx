import { BODY, DISPLAY, EN, MID, OUT, W, ease } from "./theme";
import { Reveal, SplitLayer, exitOf } from "./kit";

/** رأس الجولة: «01 / 04» + عنوان يعبر الخط */
export const RoundHead: React.FC<{ f: number; dur: number; n: number; of?: number; lines: React.ReactNode[]; size?: number }> = ({ f, dur, n, of = 4, lines, size = 112 }) => {
  const out = dur - 12;
  return (
    <>
      <SplitLayer y={372} h={60}>
        <div style={{ width: W, display: "flex", justifyContent: "center" }}>
          <Reveal f={f} at={0} d={16} out={out}>
            <div style={{ font: `700 30px ${EN}`, color: "var(--sub)", letterSpacing: 4, direction: "ltr", whiteSpace: "nowrap" }}>
              {n <= of ? (
                <>
                  <span style={{ color: "var(--acc)" }}>{String(n).padStart(2, "0")}</span> / {String(of).padStart(2, "0")}
                </>
              ) : (
                <span style={{ fontFamily: BODY, letterSpacing: 0, fontWeight: 700, color: "var(--acc)" }}>الخلاصة</span>
              )}
            </div>
          </Reveal>
        </div>
      </SplitLayer>
      {lines.map((l, i) => (
        <SplitLayer key={i} y={430 + i * size * 1.18} h={size * 1.45}>
          <div style={{ width: W, display: "flex", justifyContent: "center" }}>
            <Reveal f={f} at={1 + i * 6} d={20} out={out}>
              <div style={{ font: `700 ${size}px/1.3 ${DISPLAY}`, color: "var(--ink)", whiteSpace: "nowrap" }}>{l}</div>
            </Reveal>
          </div>
        </SplitLayer>
      ))}
    </>
  );
};

/** شريط القرار: ينبثق من الخط الفاصل للجهتين */
export const Decision: React.FC<{ f: number; dur: number; at: number; right?: React.ReactNode; left?: React.ReactNode; single?: React.ReactNode; y?: number; size?: number }> = ({
  f,
  dur,
  at,
  right,
  left,
  single,
  y = 1312,
  size = 34,
}) => {
  const grow = ease(f, at, 22, OUT);
  const q = exitOf(f, dur);
  if (grow <= 0) return null;
  const pill = (content: React.ReactNode, w: number, key: string) => (
    <div
      key={key}
      style={{
        width: w,
        height: 104,
        borderRadius: 52,
        background: "var(--bg2)",
        border: "2px solid var(--line)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        font: `700 ${size}px/1.35 ${BODY}`,
        color: "var(--ink)",
        whiteSpace: "nowrap",
        overflow: "hidden",
      }}
    >
      <Reveal f={f} at={at + 8} d={18}>
        {content}
      </Reveal>
    </div>
  );
  return (
    <SplitLayer y={y} h={120} style={{ opacity: 1 - q, transform: `translateY(${q * 40}px)` }}>
      <div style={{ position: "absolute", left: MID, top: 0, transform: `translateX(-50%) scaleX(${grow})`, display: "flex", gap: 24, direction: "rtl" }}>
        {single ? pill(single, 980, "s") : [pill(right, 478, "r"), pill(left, 478, "l")]}
      </div>
    </SplitLayer>
  );
};

/** كلمة لاتينية داخل جملة عربية */
export const En: React.FC<{ children: React.ReactNode; c?: string }> = ({ children, c }) => (
  <span style={{ fontFamily: EN, fontWeight: 700, direction: "ltr", unicodeBidi: "isolate", color: c }}>{children}</span>
);
