import { Img, staticFile } from "remotion";
import { smooth } from "../../lib/camera3d";
import { useMusic } from "../../lib/music";

/** هوية «Claude Trio»: ليل أزرق عميق + لون لكل طريقة (محادثة · Cowork · Code) */
export const T = {
  bg: "#0A0F1D",
  panel: "#0F1730",
  ink: "#F3F5FA",
  mute: "#9AA6BD",
  chat: "#F28B5E",
  cowork: "#34D6AE",
  code: "#8F94FF",
  gold: "#F2D69B",
  ok: "#3DDC97",
  bad: "#FF6B7A",
};
export const KUFI = "Noto Kufi Arabic";
export const BODY = "IBM Plex Sans Arabic";
export const MONO = "JetBrains Mono";
export const LAT = "Space Grotesk";
export const SIG = "Aref Ruqaa";

export const V = (p: string) => staticFile(`videos/claude-trio/${p}`);
export const clamp = (v: number) => Math.min(1, Math.max(0, v));
export const draw = (p: number) => ({ pathLength: 1, strokeDasharray: 1, strokeDashoffset: 1 - clamp(p) });
export const ramp = (f: number, a: number, d = 10) => smooth((f - a) / d);

/** نص يُكتب حرفاً حرفاً */
export const typed = (text: string, lf: number, at: number, dur: number) =>
  text.slice(0, Math.round(clamp((lf - at) / dur) * text.length));

/** اللوح الزجاجي الأساسي لكل محطة */
export const Panel: React.FC<{ w?: number; h?: number; accent: string; children: React.ReactNode; lf: number }> = ({
  w = 960,
  h = 820,
  accent,
  children,
  lf,
}) => {
  const { kick } = useMusic();
  const sweep = ((lf - 8) / 30) * 170 - 35;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: 44,
        overflow: "hidden",
        direction: "rtl",
        background: `linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.02) 50%), radial-gradient(120% 80% at 100% 0%, ${accent}2E, transparent 60%), ${T.panel}F2`,
        border: `2px solid ${accent}88`,
        boxShadow: `0 40px 120px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.25), 0 0 ${60 + kick * 40}px ${accent}33`,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `linear-gradient(105deg, transparent ${sweep - 10}%, rgba(255,255,255,.16) ${sweep}%, transparent ${sweep + 10}%)`,
        }}
      />
    </div>
  );
};

/** رأس المحطة: رقم + اسم + جملة الوظيفة */
export const Header: React.FC<{ n: string; title: React.ReactNode; sub: string; accent: string; lf: number; icon?: React.ReactNode }> = ({
  n,
  title,
  sub,
  accent,
  lf,
  icon,
}) => {
  const p = ramp(lf, 0, 14);
  return (
    <div style={{ width: 960, direction: "rtl", opacity: p, translate: `0px ${(1 - p) * 36}px` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <div
          style={{
            flex: "none",
            width: 96,
            height: 96,
            borderRadius: 28,
            background: accent,
            color: T.bg,
            display: "grid",
            placeItems: "center",
            font: `900 62px ${KUFI}`,
            rotate: `${(1 - p) * -40}deg`,
            boxShadow: `0 0 50px ${accent}77`,
          }}
        >
          {icon ?? n}
        </div>
        <div style={{ font: `900 98px/1.15 ${KUFI}`, color: T.ink, whiteSpace: "nowrap" }}>{title}</div>
      </div>
      <div style={{ marginTop: 14, font: `700 46px/1.35 ${BODY}`, color: accent, paddingRight: 118 }}>{sub}</div>
    </div>
  );
};

/** شريحة الفوتر الصغيرة أسفل اللوح */
export const Foot: React.FC<{ lf: number; at: number; accent: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ lf, at, accent, children, icon }) => {
  const p = ramp(lf, at, 12);
  return (
    <div
      style={{
        direction: "rtl",
        display: "inline-flex",
        alignItems: "center",
        gap: 16,
        padding: "16px 34px 20px",
        borderRadius: 999,
        background: "rgba(10,15,29,.92)",
        border: `2px solid ${accent}99`,
        font: `700 40px/1.2 ${BODY}`,
        color: T.ink,
        whiteSpace: "nowrap",
        opacity: p,
        translate: `0px ${(1 - p) * 30}px`,
        boxShadow: `0 0 40px ${accent}22`,
      }}
    >
      {icon}
      {children}
    </div>
  );
};

export const ClaudeMark: React.FC<{ size?: number; glow?: string }> = ({ size = 80, glow }) => (
  <Img src={V("claude-color.svg")} style={{ width: size, height: size, filter: glow ? `drop-shadow(0 0 ${size * 0.3}px ${glow})` : undefined }} />
);

const IG = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4.2" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);
const TT = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" />
  </svg>
);
export const Handles: React.FC<{ size: number; color?: string }> = ({ size, color = T.gold }) => (
  <div style={{ display: "inline-flex", gap: size * 1.1, alignItems: "center", fontFamily: LAT, fontWeight: 700, fontSize: size, color, direction: "ltr", whiteSpace: "nowrap" }}>
    <span style={{ display: "inline-flex", gap: size * 0.3, alignItems: "center" }}>{IG}@al_t506</span>
    <span style={{ display: "inline-flex", gap: size * 0.3, alignItems: "center" }}>{TT}@ali_altamimy_tech</span>
  </div>
);

/** أيقونات المحطات الثلاث (خطية) */
export const IcoChat: React.FC<{ s?: number; c?: string }> = ({ s = 56, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 5h16a1 1 0 011 1v9a1 1 0 01-1 1h-9l-5 4v-4H4a1 1 0 01-1-1V6a1 1 0 011-1z" />
    <path d="M8 10h8M8 13h5" />
  </svg>
);
export const IcoFolder: React.FC<{ s?: number; c?: string }> = ({ s = 56, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
    <path d="M12 11l.8 1.7 1.7.8-1.7.8L12 16l-.8-1.7-1.7-.8 1.7-.8z" fill={c} stroke="none" />
  </svg>
);
export const IcoTerm: React.FC<{ s?: number; c?: string }> = ({ s = 56, c = "currentColor" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M7 9l3 3-3 3M12.5 15H17" />
  </svg>
);
