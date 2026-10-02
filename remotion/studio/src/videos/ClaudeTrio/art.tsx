import { Img } from "remotion";
import { Cam } from "../../lib/camera3d";
import { Obj as RawObj } from "../../lib/world3d";
import { useMusic } from "../../lib/music";
import { BODY, ClaudeMark, KUFI, MONO, T, V, clamp, ramp, typed } from "./parts";

/** Obj بحدود أضيق: كل جزيرة ترى نفسها فقط (تتلاشى قبل ما تلمس الكاميرا وما تظهر من بعيد) */
export const Obj: React.FC<React.ComponentProps<typeof RawObj>> = (p) => <RawObj near={900} far={2700} farSoft={700} {...p} />;

/** عناصر الرسم المشتركة: منصة، عنوان في الفضاء، شخصية، فقاعة، كرة Claude، سحابة، حشرة… (بدون أي لوح خلفية) */

export const SKIN = "#D6A079";
export const THOBE = "#F2EFE8";
export const THOBE2 = "#D9D5CA";

/** منصة الجزيرة: قرص مضيء مسطّح على الأرض */
export const Platform: React.FC<{ cam: Cam; z: number; f: number; color: string; x?: number; size?: number }> = ({ cam, z, f, color, x = 0, size = 1500 }) => {
  const { kick } = useMusic();
  return (
    <Obj cam={cam} x={x} y={400} z={z} rx={90} near={500} far={3200} farSoft={900}>
      <div
        style={{
          position: "relative",
          width: size,
          height: size,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color}40 0%, ${color}16 46%, transparent 70%)`,
          border: `3px solid ${color}66`,
          boxShadow: `0 0 ${90 + kick * 50}px ${color}44`,
        }}
      >
        <div style={{ position: "absolute", inset: size * 0.1, borderRadius: "50%", border: `3px dashed ${color}99`, rotate: `${f * 0.5}deg` }} />
        <div style={{ position: "absolute", inset: size * 0.26, borderRadius: "50%", border: `2px solid ${color}55` }} />
        <div style={{ position: "absolute", inset: size * 0.4, borderRadius: "50%", border: `2px dotted ${color}66`, rotate: `${-f * 0.8}deg` }} />
      </div>
    </Obj>
  );
};

/** عنوان الجزيرة يطفو في الفضاء (بدون خلفية) */
export const Title: React.FC<{ cam: Cam; z: number; lf: number; n: string; title: React.ReactNode; sub: React.ReactNode; color: string; y?: number }> = ({
  cam,
  z,
  lf,
  n,
  title,
  sub,
  color,
  y = -800,
}) => {
  const p = ramp(lf, 4, 18);
  return (
    <Obj cam={cam} z={z + 120} y={y} opacity={p}>
      <div style={{ direction: "rtl", width: 1000, textAlign: "center", translate: `0px ${(1 - p) * 40}px`, filter: `blur(${(1 - p) * 8}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 22, textShadow: `0 6px 40px ${T.bg}, 0 0 60px ${color}66` }}>
          <div style={{ width: 84, height: 84, borderRadius: "50%", background: color, color: T.bg, display: "grid", placeItems: "center", font: `900 52px ${KUFI}`, boxShadow: `0 0 44px ${color}88` }}>{n}</div>
          <div style={{ font: `900 108px/1.2 ${KUFI}`, color: T.ink, whiteSpace: "nowrap" }}>{title}</div>
        </div>
        <div style={{ marginTop: 6, font: `700 46px/1.4 ${BODY}`, color, textShadow: `0 4px 28px ${T.bg}`, whiteSpace: "nowrap" }}>{sub}</div>
      </div>
    </Obj>
  );
};

/** جملة عائمة (ملاحظة أو أمر يُكتب) */
export const Say: React.FC<{ text: React.ReactNode; size?: number; color?: string; font?: string; weight?: number; p?: number; width?: number }> = ({
  text,
  size = 46,
  color = T.ink,
  font = BODY,
  weight = 700,
  p = 1,
  width = 980,
}) => (
  <div
    style={{
      direction: "rtl",
      width,
      textAlign: "center",
      font: `${weight} ${size}px/1.4 ${font}`,
      color,
      opacity: p,
      translate: `0px ${(1 - p) * 24}px`,
      textShadow: `0 4px 30px ${T.bg}, 0 0 20px ${T.bg}`,
    }}
  >
    {text}
  </div>
);

/** فقاعة حوار: u = المستخدم (فاتحة)، c = Claude (برتقالية) */
export const Bubble: React.FC<{ who: "u" | "c"; text: string; lf: number; at: number; dur: number; w?: number }> = ({ who, text, lf, at, dur, w = 520 }) => {
  const p = ramp(lf, at - 6, 8);
  if (p <= 0) return null;
  const isU = who === "u";
  const bg = isU ? "#EEF1F8" : T.chat;
  const fg = isU ? T.bg : "#1B0F08";
  return (
    <div style={{ position: "relative", direction: "rtl", width: w, opacity: p, scale: `${0.85 + 0.15 * p}`, transformOrigin: isU ? "0% 100%" : "100% 100%" }}>
      <div
        style={{
          padding: "26px 34px 30px",
          borderRadius: 40,
          borderBottomLeftRadius: isU ? 8 : 40,
          borderBottomRightRadius: isU ? 40 : 8,
          background: bg,
          color: fg,
          font: `700 44px/1.5 ${BODY}`,
          minHeight: 70,
          boxShadow: `0 24px 70px rgba(0,0,0,.55), 0 0 60px ${isU ? "#9AA6BD33" : T.chat + "55"}`,
        }}
      >
        {typed(text, lf, at, dur)}
        <span style={{ opacity: lf - at < dur ? 1 : 0, color: fg }}>▍</span>
      </div>
    </div>
  );
};

/** نقاط التفكير */
export const Dots: React.FC<{ lf: number; from: number; to: number; color: string }> = ({ lf, from, to, color }) => {
  if (lf < from || lf > to) return null;
  return (
    <div style={{ display: "flex", gap: 14 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 22, height: 22, borderRadius: "50%", background: color, translate: `0px ${Math.sin(lf / 3 - i * 1.2) * -10}px`, opacity: 0.6 + 0.4 * Math.sin(lf / 3 - i * 1.2) }} />
      ))}
    </div>
  );
};

/** كرة Claude: الشعار يطفو بتوهج ونبض الكيك */
export const Orb: React.FC<{ f: number; size?: number; color?: string }> = ({ f, size = 250, color = T.chat }) => {
  const { kick } = useMusic();
  const bob = Math.sin(f / 14) * 14;
  return (
    <div style={{ position: "relative", width: size, height: size, translate: `0px ${bob}px` }}>
      <div style={{ position: "absolute", inset: -size * 0.45, borderRadius: "50%", background: `radial-gradient(circle, ${color}${kick > 0.4 ? "66" : "44"} 0%, transparent 65%)` }} />
      <div style={{ position: "absolute", inset: -size * 0.12, borderRadius: "50%", border: `3px dashed ${color}88`, rotate: `${f * 1.1}deg` }} />
      <div style={{ position: "absolute", inset: size * 0.08, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, #2A3558, ${T.bg})`, border: `3px solid ${color}`, boxShadow: `0 0 ${50 + kick * 40}px ${color}77` }} />
      <div style={{ position: "absolute", inset: size * 0.22, display: "grid", placeItems: "center" }}>
        <ClaudeMark size={size * 0.56} glow={color} />
      </div>
    </div>
  );
};

/** شخصية علي: كاب + نظارة + لحية + ثوب. جالس يواجه اليمين. arm = وضع الذراع */
export const Person: React.FC<{ f: number; arm?: "type" | "phone" | "wave"; flip?: boolean; w?: number }> = ({ f, arm = "type", flip, w = 360 }) => {
  const jx = Math.sin(f * 1.3) * 3;
  const jy = Math.sin(f * 1.3 + 2) * 3;
  const hand = arm === "phone" ? { x: 238, y: 168 } : arm === "wave" ? { x: 232 + Math.sin(f / 4) * 14, y: 120 } : { x: 262 + jx, y: 240 + jy };
  const elbow = arm === "type" ? { x: 205, y: 232 } : { x: 214, y: 214 };
  return (
    <svg width={w} height={(w * 400) / 360} viewBox="0 0 360 400" style={{ overflow: "visible", scale: flip ? "-1 1" : "1 1" }}>
      {/* الكرسي */}
      <rect x={58} y={150} width={22} height={150} rx={10} fill="#2B3556" />
      <rect x={58} y={270} width={170} height={22} rx={10} fill="#2B3556" />
      <rect x={134} y={290} width={12} height={90} fill="#1E2744" />
      <rect x={96} y={376} width={90} height={12} rx={6} fill="#1E2744" />
      {/* الجسم (الثوب) */}
      <path d="M108 150 C 140 136, 188 142, 198 172 L 210 276 L 92 276 L 98 190 Z" fill={THOBE} />
      <path d="M170 150 C 190 158, 198 172, 200 190 L 210 276 L 176 276 Z" fill={THOBE2} opacity={0.7} />
      <rect x={96} y={262} width={178} height={38} rx={19} fill={THOBE} />
      <rect x={96} y={282} width={178} height={18} rx={9} fill={THOBE2} opacity={0.8} />
      <rect x={252} y={284} width={34} height={92} rx={14} fill={THOBE2} />
      <ellipse cx={288} cy={382} rx={32} ry={12} fill="#10141F" />
      {/* الرقبة والرأس */}
      <rect x={140} y={116} width={34} height={36} fill="#B98560" />
      <ellipse cx={126} cy={98} rx={9} ry={14} fill="#B98560" />
      <ellipse cx={158} cy={92} rx={38} ry={44} fill={SKIN} />
      {/* اللحية */}
      <path d="M121 100 C 122 142, 192 146, 197 98 C 190 118, 170 124, 158 124 C 146 124, 128 118, 121 100 Z" fill="#2A211D" />
      <path d="M146 112 Q 160 118 174 110" stroke="#2A211D" strokeWidth={5} strokeLinecap="round" fill="none" />
      {/* الكاب */}
      <path d="M116 74 C 116 26, 196 22, 200 70 Z" fill="#1F2533" />
      <path d="M192 66 L 244 76 C 246 84, 206 86, 192 78 Z" fill="#2E3750" />
      <path d="M130 62 C 140 44, 176 40, 192 54" stroke="#3B455F" strokeWidth={3} fill="none" strokeLinecap="round" />
      {/* النظارة */}
      <rect x={172} y={92} width={36} height={24} rx={6} fill="rgba(170,205,255,.5)" stroke="#0B0E14" strokeWidth={4.5} />
      <line x1={172} y1={100} x2={128} y2={96} stroke="#0B0E14" strokeWidth={4.5} strokeLinecap="round" />
      <circle cx={192} cy={105} r={3.4} fill="#0B0E14" />
      {/* الذراع */}
      <path d={`M170 168 L ${elbow.x} ${elbow.y} L ${hand.x} ${hand.y}`} stroke={THOBE} strokeWidth={28} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d={`M170 168 L ${elbow.x} ${elbow.y} L ${hand.x} ${hand.y}`} stroke={THOBE2} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={0.7} />
      <circle cx={hand.x} cy={hand.y} r={13} fill={SKIN} />
      {arm === "phone" ? <rect x={hand.x - 6} y={hand.y - 34} width={30} height={50} rx={7} fill="#10141F" stroke="#3B455F" strokeWidth={3} transform={`rotate(14 ${hand.x} ${hand.y})`} /> : null}
    </svg>
  );
};

/** شخصية علي نايمة على السرير (منظر جانبي) */
export const Sleeper: React.FC<{ f: number }> = ({ f }) => {
  const br = Math.sin(f / 16) * 4;
  return (
    <svg width={560} height={260} viewBox="0 0 560 260" style={{ overflow: "visible" }}>
      <rect x={0} y={150} width={560} height={26} rx={10} fill="#2B3556" />
      <rect x={10} y={176} width={14} height={54} fill="#1E2744" />
      <rect x={536} y={176} width={14} height={54} fill="#1E2744" />
      <rect x={0} y={120} width={560} height={36} rx={14} fill="#3A4672" />
      <rect x={14} y={86} width={140} height={44} rx={22} fill="#EDE9DF" />
      <circle cx={90} cy={84} r={38} fill={SKIN} />
      <path d="M56 92 C 60 128, 118 130, 126 90 C 116 104, 100 108, 90 108 C 78 108, 64 104, 56 92 Z" fill="#2A211D" />
      <path d="M62 78 C 74 74, 86 74, 98 78" stroke="#2A211D" strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d="M70 80 q 8 6 16 0" stroke="#2A211D" strokeWidth={3.5} fill="none" strokeLinecap="round" />
      <path d="M122 70 C 150 54, 560 50, 560 120 L 560 150 L 140 150 C 126 130, 118 100, 122 70 Z" fill="#5864C9" transform={`translate(0 ${br * -0.5})`} />
      <path d="M170 74 C 220 66, 300 70, 360 78" stroke="#7B87E6" strokeWidth={5} fill="none" strokeLinecap="round" opacity={0.7} transform={`translate(0 ${br * -0.5})`} />
    </svg>
  );
};

/** حرف Z يطفو للأعلى */
export const Zzz: React.FC<{ f: number }> = ({ f }) => (
  <div style={{ position: "relative", width: 200, height: 220 }}>
    {[0, 1, 2].map((i) => {
      const t = ((f + i * 22) % 66) / 66;
      return (
        <div key={i} style={{ position: "absolute", left: 20 + t * 90, bottom: t * 190, font: `900 ${40 + i * 16}px ${KUFI}`, color: T.code, opacity: Math.sin(t * Math.PI) * 0.9 }}>
          Z
        </div>
      );
    })}
  </div>
);

/** سحابة بساعة تدور داخلها */
export const CloudClock: React.FC<{ f: number; spin: number; color: string }> = ({ f, spin, color }) => {
  const { kick } = useMusic();
  return (
    <svg width={620} height={400} viewBox="0 0 620 400" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="cl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F5F7FF" />
          <stop offset="1" stopColor="#AEB9E6" />
        </linearGradient>
      </defs>
      <circle cx={310} cy={200} r={220 + kick * 10} fill={color} opacity={0.12} />
      <path
        d="M150 330 C 70 330, 40 250, 110 220 C 100 140, 200 100, 250 150 C 290 70, 420 80, 440 170 C 520 150, 580 230, 520 290 C 560 340, 500 350, 470 330 Z"
        fill="url(#cl)"
        opacity={0.98}
      />
      <g transform="translate(310 232)">
        <circle r={84} fill={T.bg} stroke={color} strokeWidth={8} />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={0} y1={-70} x2={0} y2={-i % 3 === 0 ? -56 : -63} stroke={`${T.ink}AA`} strokeWidth={3} transform={`rotate(${i * 30})`} />
        ))}
        <line x1={0} y1={0} x2={0} y2={-50} stroke={T.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${f * 1.2 * spin})`} />
        <line x1={0} y1={0} x2={0} y2={-34} stroke={color} strokeWidth={8} strokeLinecap="round" transform={`rotate(${f * 0.1 * spin})`} />
        <circle r={7} fill={color} />
      </g>
    </svg>
  );
};

/** ورقة ملف صغيرة: نوعها يحدد اللون والرمز */
export const Doc: React.FC<{ kind: 0 | 1 | 2; s?: number }> = ({ kind, s = 1 }) => {
  const c = [T.chat, T.code, T.cowork][kind];
  return (
    <div style={{ width: 120 * s, height: 150 * s, borderRadius: 16 * s, background: "#F6F4EE", boxShadow: `0 14px 40px rgba(0,0,0,.5), 0 0 30px ${c}44`, overflow: "hidden", position: "relative" }}>
      <div style={{ height: 34 * s, background: c, display: "grid", placeItems: "center", font: `900 ${22 * s}px ${KUFI}`, color: T.bg }}>{["$", "✎", "▣"][kind]}</div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", right: 16 * s, left: (i === 3 ? 56 : 16) * s, top: (52 + i * 20) * s, height: 7 * s, borderRadius: 4 * s, background: "#C8C4B8" }} />
      ))}
    </div>
  );
};

/** مجلد (ظهر + واجهة منفصلين لتدخل الأوراق بينهما) */
export const FolderBack: React.FC<{ color: string }> = ({ color }) => (
  <svg width={300} height={230} viewBox="0 0 300 230" style={{ overflow: "visible" }}>
    <path d="M10 40 a14 14 0 0 1 14 -14 h86 l22 24 h144 a14 14 0 0 1 14 14 v140 a14 14 0 0 1 -14 14 h-252 a14 14 0 0 1 -14 -14 z" fill={color} opacity={0.65} />
  </svg>
);
export const FolderFront: React.FC<{ color: string; label: string; check: number }> = ({ color, label, check }) => (
  <div style={{ position: "relative", width: 300, height: 230 }}>
    <svg width={300} height={230} viewBox="0 0 300 230" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d="M10 92 a14 14 0 0 1 14 -14 h252 a14 14 0 0 1 14 14 v110 a14 14 0 0 1 -14 14 h-252 a14 14 0 0 1 -14 -14 z" fill={color} />
      <path d="M10 92 a14 14 0 0 1 14 -14 h252 a14 14 0 0 1 14 14 v10 h-280 z" fill="#FFFFFF" opacity={0.18} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 0, top: 118, textAlign: "center", font: `900 48px ${KUFI}`, color: T.bg, direction: "rtl" }}>{label}</div>
    <div
      style={{
        position: "absolute",
        right: -22,
        top: -30,
        width: 76,
        height: 76,
        borderRadius: "50%",
        background: T.ok,
        display: "grid",
        placeItems: "center",
        scale: `${check}`,
        opacity: clamp(check),
        boxShadow: `0 0 40px ${T.ok}99`,
      }}
    >
      <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke={T.bg} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12.5l4.6 4.6L19 7.5" />
      </svg>
    </div>
  </div>
);

/** حشرة (bug) بمنظر علوي، تمشي بأرجل متحركة */
export const Bug: React.FC<{ f: number; dead?: number }> = ({ f, dead = 0 }) => {
  const sw = Math.sin(f * 0.9) * 10;
  return (
    <svg width={190} height={190} viewBox="-95 -95 190 190" style={{ overflow: "visible", scale: `${1 - dead * 0.1} ${1 - dead * 0.55}` }}>
      {[-1, 0, 1].map((r) =>
        [-1, 1].map((sd) => (
          <line key={`${r}${sd}`} x1={sd * 26} y1={r * 26} x2={sd * (62 + (r === 0 ? 8 : 0))} y2={r * 40 + sw * sd * (r === 0 ? -1 : 1) * (dead ? 0 : 1)} stroke="#FF8A96" strokeWidth={7} strokeLinecap="round" />
        )),
      )}
      <ellipse rx={38} ry={54} cy={8} fill={dead ? "#8C3A44" : T.bad} />
      <line x1={0} y1={-44} x2={0} y2={62} stroke="#7A1E2B" strokeWidth={4} />
      <circle cx={-14} cy={-8} r={7} fill="#7A1E2B" />
      <circle cx={14} cy={22} r={7} fill="#7A1E2B" />
      <circle cy={-54} r={22} fill={dead ? "#6E2C35" : "#E04C5C"} />
      <line x1={-8} y1={-70} x2={-20} y2={-92 + sw * 0.4} stroke="#FF8A96" strokeWidth={5} strokeLinecap="round" />
      <line x1={8} y1={-70} x2={20} y2={-92 - sw * 0.4} stroke="#FF8A96" strokeWidth={5} strokeLinecap="round" />
      {dead ? (
        <g stroke="#FFF" strokeWidth={4} strokeLinecap="round">
          <path d="M-12 -62 l8 8 M-4 -62 l-8 8" />
          <path d="M4 -62 l8 8 M12 -62 l-8 8" />
        </g>
      ) : null}
    </svg>
  );
};

/** ترس */
export const Gear: React.FC<{ size: number; rot: number; color: string }> = ({ size, rot, color }) => {
  const teeth = 10;
  const pts: string[] = [];
  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * Math.PI * 2;
    const da = Math.PI / teeth / 2.2;
    [[a - da * 1.3, 0.8], [a - da * 0.7, 1], [a + da * 0.7, 1], [a + da * 1.3, 0.8]].forEach(([ang, r]) => {
      pts.push(`${(Math.cos(ang) * r * 50).toFixed(1)},${(Math.sin(ang) * r * 50).toFixed(1)}`);
    });
  }
  return (
    <svg width={size} height={size} viewBox="-55 -55 110 110" style={{ rotate: `${rot}deg`, overflow: "visible", filter: `drop-shadow(0 0 16px ${color}77)` }}>
      <polygon points={pts.join(" ")} fill={`${color}33`} stroke={color} strokeWidth={3} strokeLinejoin="round" />
      <circle r={16} fill={T.bg} stroke={color} strokeWidth={3} />
    </svg>
  );
};

/** لابتوب كبير: شاشة بكود يُكتب، ثم يتحول لأخضر عند النجاح */
const CODE_LINES: { w: number; c: string; ind: number }[] = [
  { w: 220, c: T.code, ind: 0 },
  { w: 300, c: T.mute, ind: 1 },
  { w: 180, c: T.gold, ind: 1 },
  { w: 340, c: T.mute, ind: 2 },
  { w: 150, c: T.chat, ind: 2 },
  { w: 260, c: T.mute, ind: 1 },
  { w: 120, c: T.code, ind: 0 },
];
export const Laptop: React.FC<{ lf: number; typeAt: number; fixAt: number }> = ({ lf, typeAt, fixAt }) => {
  const { kick } = useMusic();
  const fixed = ramp(lf, fixAt, 10);
  return (
    <div style={{ position: "relative", width: 760, height: 560 }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 440, borderRadius: 26, background: "#0B1226", border: "7px solid #2A3556", boxShadow: `0 40px 120px rgba(0,0,0,.7), 0 0 ${60 + kick * 40}px ${fixed > 0.5 ? T.ok : T.code}55`, overflow: "hidden" }}>
        <div style={{ height: 46, background: "#141C38", display: "flex", alignItems: "center", gap: 10, padding: "0 20px" }}>
          {["#FF6B7A", "#F2D69B", "#3DDC97"].map((c) => (
            <div key={c} style={{ width: 14, height: 14, borderRadius: "50%", background: c }} />
          ))}
          <div style={{ marginLeft: 16, font: `600 22px ${MONO}`, color: T.mute, direction: "ltr" }}>checkout.ts</div>
        </div>
        <div style={{ padding: "26px 34px", direction: "ltr" }}>
          {CODE_LINES.map((l, i) => {
            const p = clamp((lf - typeAt - i * 6) / 12);
            const isBug = i === 3;
            const col = isBug ? (fixed > 0.5 ? T.ok : T.bad) : l.c;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, height: 44, marginLeft: l.ind * 36 }}>
                <div style={{ width: l.w * p, height: 14, borderRadius: 7, background: col, opacity: isBug ? 1 : 0.85, boxShadow: isBug ? `0 0 24px ${col}99` : undefined }} />
                {isBug && p > 0.9 ? <div style={{ font: `900 26px ${MONO}`, color: col }}>{fixed > 0.5 ? "✓" : "✕"}</div> : null}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: -50, right: -50, top: 440, height: 34, borderRadius: "6px 6px 30px 30px", background: "linear-gradient(#3A4672,#222B4A)", boxShadow: "0 30px 70px rgba(0,0,0,.6)" }} />
    </div>
  );
};

export const CodeMark: React.FC<{ size: number; glow: string }> = ({ size, glow }) => (
  <Img src={V("claudecode-color.svg")} style={{ width: size, height: size, filter: `drop-shadow(0 0 ${size * 0.3}px ${glow})` }} />
);

/** قمر هلال */
export const Moon: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", boxShadow: `inset ${-size * 0.22}px ${size * 0.04}px 0 0 ${T.gold}, 0 0 ${size * 0.5}px ${T.gold}55`, rotate: "-18deg" }} />
);

export const SunDisc: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: "50%", background: `radial-gradient(circle, #FFF6DC 0%, ${T.gold} 38%, #F2A65A 62%, transparent 72%)` }} />
);

/** درع صغير */
export const Shield: React.FC<{ s?: number; c: string }> = ({ s = 52, c }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6z" />
    <path d="M9 12l2.2 2.2L15.5 10" />
  </svg>
);
