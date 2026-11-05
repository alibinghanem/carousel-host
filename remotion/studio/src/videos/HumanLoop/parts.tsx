import { AbsoluteFill, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp, shake } from "../../lib/theme";
import { useMusic } from "../../lib/music";

/** «خط الإنتاج والختم» — ألوان وخطوط الفيديو */
export const H = {
  paper: "#F1ECE2",
  paper2: "#E6DFD2",
  ink: "#13203A",
  y: "#FFC233",
  r: "#E5383B",
  g: "#1F9D6B",
  steel: "#7D8796",
  belt: "#26304A",
  card: "#FFFFFF",
  kraft: "#D9A066",
};
export const D = "Alexandria";
export const B = "IBM Plex Sans Arabic";
export const M = "JetBrains Mono";
export const V = (p: string) => staticFile(`videos/human-loop/${p}`);

/** خطوط تحذير صفراء/سوداء */
export const hazard = (w = 34, a = H.y, b = H.ink, off = 0) =>
  `repeating-linear-gradient(-45deg, ${a} ${off}px, ${a} ${off + w}px, ${b} ${off + w}px, ${b} ${off + w * 2}px)`;

/** خلفية ورق المصنع: شبكة مخطط هندسي + ترس باهت ينبض مع الكيك */
export const PaperBg: React.FC<{ dark?: boolean; yellow?: boolean }> = ({ dark, yellow }) => {
  const f = useCurrentFrame();
  const { kick, bass } = useMusic();
  const bg = yellow ? H.y : dark ? H.ink : H.paper;
  const line = dark ? "rgba(255,255,255,.06)" : "rgba(19,32,58,.07)";
  const glow = yellow ? "#FFF3C4" : dark ? H.y : "#FFD66B";
  return (
    <AbsoluteFill style={{ background: bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{
          backgroundImage: `linear-gradient(${line} 2px, transparent 2px), linear-gradient(90deg, ${line} 2px, transparent 2px)`,
          backgroundSize: "60px 60px",
          backgroundPosition: `${-(f * 0.6) % 60}px 0px`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(900px 900px at 50% 52%, ${glow}${Math.round((dark ? 0.1 : 0.35) * (0.3 + kick * 0.7 + bass * 0.2) * 255)
            .toString(16)
            .padStart(2, "0")}, transparent 70%)`,
        }}
      />
      <Gear size={760} x={-260} y={1320} rot={f * 0.35} scale={1 + kick * 0.04} color={dark ? "rgba(255,255,255,.05)" : "rgba(19,32,58,.06)"} />
      <Gear size={420} x={860} y={120} rot={-f * 0.6} scale={1 + kick * 0.05} color={dark ? "rgba(255,255,255,.05)" : "rgba(19,32,58,.06)"} />
    </AbsoluteFill>
  );
};

export const Gear: React.FC<{ size: number; x: number; y: number; rot: number; scale?: number; color: string }> = ({ size, x, y, rot, scale = 1, color }) => {
  const teeth = 12;
  const pts: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? 50 : 42;
    const a2 = a + Math.PI / (teeth * 2);
    pts.push(`${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`, `${50 + Math.cos(a2) * r},${50 + Math.sin(a2) * r}`);
  }
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ position: "absolute", left: x, top: y, rotate: `${rot}deg`, scale: `${scale}` }}>
      <polygon points={pts.join(" ")} fill={color} />
      <circle cx="50" cy="50" r="16" fill={H.paper} opacity={0} />
      <circle cx="50" cy="50" r="15" fill="none" stroke={color} strokeWidth="9" />
    </svg>
  );
};

/** ختم مطاطي يضرب لحظة at: ينزل من فوق ويترك حبراً خشناً */
export const Stamp: React.FC<{
  at: number;
  text: string;
  color?: string;
  x: number;
  y: number;
  rot?: number;
  size?: number;
}> = ({ at, text, color = H.r, x, y, rot = -12, size = 92 }) => {
  const f = useCurrentFrame();
  if (f < at - 7) return null;
  const drop = lerp(f, [at - 7, at], [0, 1], (t) => t * t);
  const sc = f < at ? 2.4 - 1.4 * drop : 1 + Math.max(0, 0.06 - (f - at) * 0.01);
  const fid = `ink-${at}-${x}`;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        translate: "-50% -50%",
        rotate: `${rot}deg`,
        scale: `${sc}`,
        opacity: f < at ? drop : 0.92,
        pointerEvents: "none",
      }}
    >
      <svg width="0" height="0" style={{ position: "absolute" }}>
        <filter id={fid}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={at} />
          <feDisplacementMap in="SourceGraphic" scale="7" />
        </filter>
      </svg>
      <div
        style={{
          filter: `url(#${fid})`,
          border: `${Math.round(size * 0.09)}px solid ${color}`,
          outline: `${Math.round(size * 0.04)}px solid ${color}`,
          outlineOffset: Math.round(size * 0.08),
          borderRadius: size * 0.22,
          padding: `${size * 0.06}px ${size * 0.42}px ${size * 0.12}px`,
          color,
          fontFamily: D,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 1.25,
          whiteSpace: "nowrap",
          direction: "rtl",
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** ذراع حاجز يدور ويقفل الطريق عند at (ويرتفع عند up) */
export const Barrier: React.FC<{ at: number; up?: number; x: number; y: number; len?: number; dir?: 1 | -1 }> = ({
  at,
  up = 99999,
  x,
  y,
  len = 360,
  dir = 1,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const down = spring({ frame: f - at + 8, fps, config: { damping: 9, stiffness: 160 } });
  const lift = lerp(f, [up, up + 12], [0, 1]);
  const ang = -82 * (1 - down) - 82 * lift;
  const blink = f >= at && f < up && Math.floor((f - at) / 8) % 2 === 0;
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      {/* العمود */}
      <div style={{ position: "absolute", left: -18, top: -30, width: 36, height: 230, borderRadius: 10, background: H.ink }} />
      <div
        style={{
          position: "absolute",
          left: -14,
          top: -66,
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: blink ? H.r : "#5A2A2E",
          boxShadow: blink ? `0 0 30px ${H.r}` : "none",
        }}
      />
      {/* الذراع */}
      <div
        style={{
          position: "absolute",
          left: dir === 1 ? 0 : -len,
          top: -14,
          width: len,
          height: 34,
          borderRadius: 17,
          background: hazard(26),
          border: `4px solid ${H.ink}`,
          transformOrigin: dir === 1 ? "0% 50%" : "100% 50%",
          rotate: `${ang * dir}deg`,
        }}
      />
      <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: "50%", background: H.ink, border: `6px solid ${H.y}` }} />
    </div>
  );
};

/** رأس روبوت بسيط (الوكيل) */
export const Bot: React.FC<{ size?: number; color?: string; eye?: string }> = ({ size = 64, color = H.ink, eye = H.y }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <line x1="32" y1="4" x2="32" y2="14" stroke={color} strokeWidth="4" strokeLinecap="round" />
    <circle cx="32" cy="5" r="4" fill={eye} />
    <rect x="8" y="14" width="48" height="40" rx="12" fill={color} />
    <circle cx="23" cy="33" r="6" fill={eye} />
    <circle cx="41" cy="33" r="6" fill={eye} />
    <rect x="22" y="44" width="20" height="4" rx="2" fill={eye} opacity={0.7} />
  </svg>
);

/** إنسان (أيقونة) */
export const Person: React.FC<{ size?: number; color?: string }> = ({ size = 64, color = H.ink }) => (
  <svg width={size} height={size} viewBox="0 0 64 64">
    <circle cx="32" cy="20" r="12" fill={color} />
    <path d="M10 60c0-13 10-22 22-22s22 9 22 22z" fill={color} />
  </svg>
);

/** مؤشر يد ينقر */
export const Cursor: React.FC<{ from: [number, number]; to: [number, number]; at: number; click: number }> = ({ from, to, at, click }) => {
  const f = useCurrentFrame();
  if (f < at) return null;
  const t = lerp(f, [at, click - 4], [0, 1]);
  const press = f >= click - 2 && f < click + 5 ? 0.85 : 1;
  return (
    <svg
      width="86"
      height="86"
      viewBox="0 0 24 24"
      style={{
        position: "absolute",
        left: from[0] + (to[0] - from[0]) * t,
        top: from[1] + (to[1] - from[1]) * t,
        scale: `${press}`,
        filter: "drop-shadow(0 6px 10px rgba(0,0,0,.35))",
        opacity: lerp(f, [at, at + 6], [0, 1]),
      }}
    >
      <path
        d="M9 11V5.5a1.5 1.5 0 013 0V10l.2-.03a1.5 1.5 0 012.8.53l.2-.02a1.5 1.5 0 012.6.92 1.5 1.5 0 012.2 1.3V16a6 6 0 01-6 6h-1.2a6 6 0 01-4.9-2.6L5 14.2a1.5 1.5 0 012.3-1.9z"
        fill="#fff"
        stroke={H.ink}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/** صورة حقيقية بإطار بولارويد وشريط لاصق + تكبير بطيء */
export const Photo: React.FC<{ src: string; at: number; w: number; h: number; rot?: number; caption?: string; pos?: string }> = ({
  src,
  at,
  w,
  h,
  rot = 2,
  caption,
  pos = "50% 50%",
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 120 } });
  return (
    <div
      style={{
        position: "relative",
        width: w + 28,
        padding: 14,
        paddingBottom: caption ? 64 : 14,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 28px 50px rgba(19,32,58,.28)",
        rotate: `${rot + (1 - s) * 8}deg`,
        translate: `0px ${(1 - s) * 200}px`,
        opacity: Math.min(1, s * 1.5),
      }}
    >
      <div style={{ width: w, height: h, overflow: "hidden", borderRadius: 4 }}>
        <Img src={src} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, scale: `${1.04 + f * 0.0006}` }} />
      </div>
      {caption ? (
        <div style={{ position: "absolute", bottom: 14, left: 0, right: 0, textAlign: "center", fontFamily: B, fontWeight: 600, fontSize: 30, color: H.steel, direction: "rtl" }}>
          {caption}
        </div>
      ) : null}
      <div style={{ position: "absolute", top: -18, right: 60, width: 150, height: 40, background: "rgba(255,226,140,.85)", rotate: "-6deg" }} />
      <div style={{ position: "absolute", top: -14, left: 70, width: 130, height: 38, background: "rgba(255,226,140,.85)", rotate: "5deg" }} />
    </div>
  );
};

/** بطاقة طلب موافقة من الوكيل (واجهة عامة — ليست لقطة لأي أداة) */
export const ApprovalCard: React.FC<{
  at: number;
  title: string;
  children: React.ReactNode;
  okLabel: string;
  noLabel: string;
  clickAt: number;
  doneLabel: string;
  width?: number;
}> = ({ at, title, children, okLabel, noLabel, clickAt, doneLabel, width = 860 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 13, stiffness: 170 } });
  const done = f >= clickAt;
  const press = f >= clickAt - 2 && f < clickAt + 4;
  return (
    <div
      style={{
        width,
        direction: "rtl",
        background: H.card,
        borderRadius: 34,
        padding: "30px 38px 34px",
        boxShadow: "0 30px 60px rgba(19,32,58,.25)",
        border: `3px solid ${H.ink}`,
        scale: `${0.6 + 0.4 * s}`,
        opacity: Math.min(1, s * 2),
        translate: `0px ${shake(f, clickAt, 10, 4)}px`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
        <div style={{ width: 70, height: 70, borderRadius: 20, background: H.y, display: "grid", placeItems: "center" }}>
          <Bot size={52} eye={H.y} />
        </div>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 36, color: H.ink }}>{title}</div>
        <div style={{ marginRight: "auto", fontFamily: B, fontWeight: 600, fontSize: 28, color: H.steel }}>الآن</div>
      </div>
      <div style={{ fontFamily: B, fontWeight: 700, fontSize: 46, color: H.ink, lineHeight: 1.45, marginBottom: 28 }}>{children}</div>
      <div style={{ display: "flex", gap: 20 }}>
        <div
          style={{
            flex: 1.3,
            textAlign: "center",
            padding: "20px 0",
            borderRadius: 22,
            background: H.g,
            color: "#fff",
            fontFamily: B,
            fontWeight: 700,
            fontSize: 40,
            scale: press ? "0.94" : "1",
            boxShadow: done ? `0 0 0 8px ${H.g}33` : "none",
          }}
        >
          {done ? `✓ ${doneLabel}` : okLabel}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "center",
            padding: "20px 0",
            borderRadius: 22,
            border: `3px solid ${H.ink}33`,
            color: H.steel,
            fontFamily: B,
            fontWeight: 700,
            fontSize: 40,
            opacity: done ? 0.4 : 1,
          }}
        >
          {noLabel}
        </div>
      </div>
    </div>
  );
};

/** رأس البوابة: ذراع حاجز ينزل على النبض + لوحة رقم وعنوان */
export const GateHead: React.FC<{ n: string; title: string; sub: string; size?: number }> = ({ n, title, sub, size = 100 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const arm = spring({ frame: f - 3, fps, config: { damping: 10, stiffness: 170 } });
  const plate = spring({ frame: f - 12, fps, config: { damping: 14, stiffness: 160 } });
  return (
    <div style={{ position: "absolute", top: 330, left: 70, right: 70, direction: "rtl" }}>
      <div
        style={{
          height: 38,
          borderRadius: 19,
          background: hazard(28),
          border: `4px solid ${H.ink}`,
          transformOrigin: "100% 50%",
          rotate: `${-70 * (1 - arm)}deg`,
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 26,
          marginTop: 34,
          opacity: Math.min(1, plate * 1.5),
          translate: `${(1 - plate) * 140}px 0px`,
        }}
      >
        <div
          style={{
            width: 132,
            height: 132,
            flex: "none",
            borderRadius: 30,
            background: H.ink,
            color: H.y,
            display: "grid",
            placeItems: "center",
            fontFamily: D,
            fontWeight: 800,
            fontSize: 84,
            rotate: `${(1 - plate) * -30}deg`,
          }}
        >
          {n}
        </div>
        <div>
          <div style={{ fontFamily: B, fontWeight: 700, fontSize: 38, color: H.steel, lineHeight: 1.1 }}>بوابة إلزامية</div>
          <div style={{ fontFamily: D, fontWeight: 800, fontSize: size, color: H.ink, lineHeight: 1.15, whiteSpace: "nowrap" }}>{title}</div>
        </div>
      </div>
      <div
        style={{
          marginTop: 22,
          fontFamily: B,
          fontWeight: 700,
          fontSize: 44,
          color: H.ink,
          opacity: lerp(f, [30, 42], [0, 0.75]),
          translate: `0px ${lerp(f, [30, 42], [20, 0])}px`,
        }}
      >
        {sub}
      </div>
    </div>
  );
};
