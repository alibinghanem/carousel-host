import { Img, interpolate } from "remotion";
import { BODY, CL, DISPLAY, EN, GP, H, IN, MID, OUT, V, W, ease } from "./theme";

export type Side = "r" | "l";
export const pal = (s: Side) => (s === "r" ? CL : GP);

/**
 * نص يعبر الخط الفاصل: يُرسم مرتين ومقصوص عند الخط، فيأخذ ألوان كل عالم.
 * داخل الأبناء استخدم var(--ink) · var(--sub) · var(--acc).
 */
export const SplitLayer: React.FC<{ y: number; h?: number; split?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  y,
  h = 300,
  split = MID,
  children,
  style,
}) => (
  <>
    {(["r", "l"] as Side[]).map((s) => {
      const p = pal(s);
      return (
        <div
          key={s}
          style={
            {
              position: "absolute",
              left: 0,
              top: y,
              width: W,
              height: h,
              clipPath: s === "r" ? `inset(0 0 0 ${split}px)` : `inset(0 ${W - split}px 0 0)`,
              direction: "rtl",
              "--ink": p.ink,
              "--sub": p.sub,
              "--acc": p.acc,
              "--line": p.line,
              "--bg": p.bg,
              "--bg2": p.bg2,
              ...style,
            } as React.CSSProperties
          }
        >
          {children}
        </div>
      );
    })}
  </>
);

/** كشف سطر بقناع: النص يطلع من تحت خط مخفي (أسلوب التحرير الاحترافي) */
export const Reveal: React.FC<{ f: number; at: number; d?: number; children: React.ReactNode; style?: React.CSSProperties; out?: number }> = ({
  f,
  at,
  d = 20,
  children,
  style,
  out,
}) => {
  const p = ease(f, at, d, OUT);
  const q = out !== undefined ? ease(f, out, 12, IN) : 0;
  return (
    <div style={{ overflow: "hidden", padding: "0.2em 0.2em 0.5em", margin: "-0.2em -0.2em -0.5em", ...style }}>
      <div style={{ transform: `translateY(${(1 - p) * 160 - q * 160}%)`, opacity: p > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

/**
 * محتوى نصف واحد: يدخل بحركة متعاكسة (يمين من تحت، يسار من فوق) ويطلع بالعكس،
 * مع ضبابية حركة عمودية حسب السرعة. مقصوص على نصفه.
 */
export const Half: React.FC<{ side: Side; f: number; at: number; dur: number; id: string; dist?: number; children: React.ReactNode }> = ({
  side,
  f,
  at,
  dur,
  id,
  dist = 200,
  children,
}) => {
  const y = (t: number) => {
    const p = ease(t, at, 22, OUT);
    const q = ease(t, dur - 12, 12, IN);
    const k = side === "r" ? 1 : -1;
    return k * ((1 - p) * dist - q * dist * 1.4);
  };
  const yy = y(f);
  const v = Math.abs(yy - y(f - 1));
  const blur = Math.min(26, v * 0.55);
  const o = ease(f, at, 10) * (1 - ease(f, dur - 6, 6));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", top: 0, left: side === "r" ? MID : 0, width: MID, height: H, overflow: "hidden" }}>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <filter id={id} x="-10%" y="-30%" width="120%" height="160%">
          <feGaussianBlur stdDeviation={`0 ${blur.toFixed(2)}`} />
        </filter>
      </svg>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${yy}px)`, opacity: o, filter: blur > 0.4 ? `url(#${id})` : undefined }}>{children}</div>
    </div>
  );
};

/** خروج كل محتوى الجولة المشترك (العنوان والقرار) */
export const exitOf = (f: number, dur: number) => ease(f, dur - 12, 12, IN);

/** شعار الأداة */
export const Logo: React.FC<{ side: Side; size: number }> = ({ side, size }) =>
  side === "r" ? (
    <Img src={V("claude-color.svg")} style={{ width: size, height: size }} />
  ) : (
    <Img src={V("openai.svg")} style={{ width: size, height: size, filter: "brightness(0) invert(1)" }} />
  );

/** فقاعة طلب تنكتب حرفاً حرفاً */
export const Prompt: React.FC<{ side: Side; f: number; at: number; text: string; dur?: number; width?: number }> = ({ side, f, at, text, dur = 26, width = 360 }) => {
  const p = pal(side);
  const n = Math.round(Math.min(1, Math.max(0, (f - at - 6) / dur)) * text.length);
  const shown = text.slice(0, n);
  const caret = n < text.length && Math.floor(f / 8) % 2 === 0;
  const s = ease(f, at, 14, OUT);
  return (
    <div
      style={{
        width,
        direction: "rtl",
        display: "flex",
        justifyContent: "flex-start",
        opacity: s,
        transform: `translateY(${(1 - s) * 18}px) scale(${0.96 + 0.04 * s})`,
        transformOrigin: "100% 50%",
      }}
    >
      <div
        style={{
          maxWidth: width,
          padding: "14px 24px 16px",
          borderRadius: 28,
          borderTopRightRadius: 8,
          background: side === "r" ? CL.bg2 : "#2A2A2C",
          border: `1.5px solid ${side === "r" ? CL.line : "#3A3A3C"}`,
          font: `600 30px/1.45 ${BODY}`,
          color: p.ink,
          minHeight: 64,
          whiteSpace: "nowrap",
        }}
      >
        {shown}
        <span style={{ opacity: caret ? 1 : 0, color: p.acc }}>|</span>
      </div>
    </div>
  );
};

/** شارة رقم/مصدر صغيرة */
export const Source: React.FC<{ side: Side; text: string; f: number; at: number }> = ({ side, text, f, at }) => (
  <div style={{ font: `700 24px ${EN}`, color: pal(side).sub, opacity: 0.85 * ease(f, at, 14), direction: "ltr", letterSpacing: 0.5, whiteSpace: "nowrap" }}>
    ↗ {text}
  </div>
);

/** عنوان + شرح لكل جانب */
export const Statement: React.FC<{ side: Side; f: number; at: number; head: React.ReactNode; sub: React.ReactNode; headSize?: number }> = ({
  side,
  f,
  at,
  head,
  sub,
  headSize = 50,
}) => {
  const p = pal(side);
  return (
    <div style={{ width: 380, direction: "rtl", textAlign: "center" }}>
      <Reveal f={f} at={at}>
        <div style={{ font: `700 ${headSize}px/1.25 ${DISPLAY}`, color: p.ink, whiteSpace: "nowrap" }}>{head}</div>
      </Reveal>
      <div style={{ height: 10 }} />
      <Reveal f={f} at={at + 6}>
        <div style={{ font: `600 33px/1.45 ${BODY}`, color: p.sub }}>{sub}</div>
      </Reveal>
    </div>
  );
};

export const lerpColor = (a: string, b: string, t: number) => {
  const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16));
  const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16));
  const c = pa.map((v, i) => Math.round(interpolate(t, [0, 1], [v, pb[i]])));
  return `rgb(${c.join(",")})`;
};
