import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, lerp } from "../theme";

/** كلمات تطلع وحدة وحدة بزنبرك + ضبابية */
export const Words: React.FC<{
  text: string;
  at: number;
  stagger?: number;
  style?: React.CSSProperties;
  color?: string;
}> = ({ text, at, stagger = 4, style, color }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ direction: "rtl", ...style }}>
      {text.split(" ").map((w, i) => {
        const s = spring({ frame: f - at - i * stagger, fps, config: { damping: 14, stiffness: 170 } });
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              marginLeft: "0.25em",
              color,
              opacity: Math.min(1, s * 1.4),
              translate: `0px ${(1 - s) * 70}px`,
              filter: `blur(${(1 - Math.min(1, s)) * 12}px)`,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** كتابة حرف حرف مع مؤشر */
export const Typer: React.FC<{ text: string; at: number; dur: number; style?: React.CSSProperties; caret?: string }> = ({
  text,
  at,
  dur,
  style,
  caret = C.cyan,
}) => {
  const f = useCurrentFrame();
  const n = Math.round(lerp(f, [at, at + dur], [0, text.length], (t) => t));
  const blink = Math.floor(f / 8) % 2 === 0 || (f > at && f < at + dur);
  return (
    <div style={{ direction: "rtl", ...style }}>
      {text.slice(0, n)}
      <span style={{ display: "inline-block", width: 5, height: "1em", marginRight: 6, verticalAlign: "-0.12em", background: caret, opacity: blink ? 1 : 0 }} />
    </div>
  );
};

/** ظهور بزنبرك (مقياس + شفافية) */
export const usePop = (at: number, damping = 12) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping, stiffness: 200 } });
  return { opacity: Math.min(1, s * 2), scale: 0.4 + 0.6 * s };
};

export const Chip: React.FC<{ at: number; children: React.ReactNode; bg?: string; color?: string; style?: React.CSSProperties }> = ({
  at,
  children,
  bg = "rgba(255,255,255,.1)",
  color = "#fff",
  style,
}) => {
  const p = usePop(at);
  return (
    <div
      style={{
        direction: "rtl",
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: "14px 26px",
        borderRadius: 999,
        background: bg,
        color,
        border: "2px solid rgba(255,255,255,.18)",
        backdropFilter: "blur(10px)",
        fontFamily: F.body,
        fontWeight: 700,
        fontSize: 36,
        whiteSpace: "nowrap",
        opacity: p.opacity,
        scale: `${p.scale}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** بطاقة زجاجية */
export const Glass: React.FC<{ children: React.ReactNode; style?: React.CSSProperties; light?: boolean }> = ({ children, style, light }) => (
  <div
    style={{
      direction: "rtl",
      borderRadius: 32,
      padding: "28px 34px",
      background: light ? "rgba(255,255,255,.96)" : "linear-gradient(160deg, rgba(255,255,255,.12), rgba(255,255,255,.04))",
      border: light ? `3px solid ${C.y}` : "2px solid rgba(255,255,255,.16)",
      boxShadow: "0 30px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.2)",
      color: light ? C.ink : "#fff",
      ...style,
    }}
  >
    {children}
  </div>
);

/** رأس السبب: رقم + عنوان يضرب مع الإيقاع */
export const ReasonHead: React.FC<{ n: string; title: string; color: string; textColor?: string }> = ({ n, title, color, textColor = C.ink }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f, fps, config: { damping: 11, stiffness: 190 } });
  const ab = lerp(f, [0, 14], [10, 0]);
  return (
    <div style={{ position: "absolute", top: 330, right: 80, left: 80, display: "flex", alignItems: "center", gap: 26, direction: "rtl" }}>
      <div
        style={{
          width: 116,
          height: 116,
          borderRadius: "50%",
          background: color,
          color: textColor,
          display: "grid",
          placeItems: "center",
          fontFamily: F.head,
          fontWeight: 800,
          fontSize: 70,
          scale: `${0.3 + 0.7 * s}`,
          rotate: `${(1 - s) * -90}deg`,
          boxShadow: `0 0 50px ${color}88`,
        }}
      >
        {n}
      </div>
      <div
        style={{
          fontFamily: F.head,
          fontWeight: 800,
          fontSize: 108,
          color: "#fff",
          lineHeight: 1.1,
          whiteSpace: "nowrap",
          opacity: Math.min(1, s * 1.5),
          translate: `${(1 - s) * -120}px 0px`,
          textShadow: `${ab}px 0 ${C.r}, ${-ab}px 0 ${C.cyan}`,
        }}
      >
        {title}
      </div>
    </div>
  );
};

/** وميض أبيض لحظة الضربة */
export const Flash: React.FC<{ at: number; dur?: number; color?: string; max?: number }> = ({ at, dur = 10, color = "#fff", max = 0.7 }) => {
  const f = useCurrentFrame();
  const o = f < at ? 0 : lerp(f, [at, at + dur], [max, 0]);
  return <div style={{ position: "absolute", inset: 0, background: color, opacity: o, pointerEvents: "none" }} />;
};

/** شظايا تنطلق من نقطة */
export const Burst: React.FC<{ at: number; x: number; y: number; color?: string; n?: number }> = ({ at, x, y, color = C.y, n = 22 }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = lerp(f, [at, at + 26], [0, 1]);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const a = (i / n) * Math.PI * 2 + i * 0.37;
        const d = (120 + ((i * 53) % 110)) * t;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x + Math.cos(a) * d - 6,
              top: y + Math.sin(a) * d - 6,
              width: 12 - t * 8,
              height: 12 - t * 8,
              borderRadius: "50%",
              background: i % 3 === 0 ? "#fff" : color,
              opacity: 1 - t,
              boxShadow: `0 0 12px ${color}`,
            }}
          />
        );
      })}
    </>
  );
};
