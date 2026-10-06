import { useCurrentFrame, useVideoConfig } from "remotion";
import { C, F, lerp } from "./theme";

const TT = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.8 5.8 0 1 0 4.9 5.7V9a7.4 7.4 0 0 0 4.3 1.4V7.3a4.3 4.3 0 0 1-3.2-1.5z" /></svg>
);
const IG = (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4.2" /><circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" stroke="none" /></svg>
);

export const Handles: React.FC<{ light?: boolean; size?: number }> = ({ light, size = 30 }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 26,
      padding: "14px 30px",
      borderRadius: 999,
      background: light ? "#fff" : "rgba(7,9,15,.78)",
      color: light ? C.ink : "#fff",
      border: light ? "none" : "2px solid rgba(255,255,255,.16)",
      fontFamily: F.en,
      fontWeight: 700,
      fontSize: size,
      direction: "ltr",
      whiteSpace: "nowrap",
    }}
  >
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{IG}@al_t506</span>
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>{TT}@ali_altamimy_tech</span>
  </div>
);

/** طبقة ثابتة: شريط تقدم + وسم + الحسابين (تختفي في الختام) */
export const Hud: React.FC<{
  hideFrom: number;
  kicker: string;
  icon?: React.ReactNode; // أيقونة الوسم (الافتراضي: هدف الرماية)
  bar?: [string, string]; // تدرّج شريط التقدم
}> = ({ hideFrom, kicker, icon, bar = [C.cyan, C.y] }) => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = lerp(f, [hideFrom, hideFrom + 8], [1, 0]);
  return (
    <>
      <div style={{ position: "absolute", top: 0, right: 0, height: 10, width: `${(f / durationInFrames) * 100}%`, background: `linear-gradient(90deg, ${bar[0]}, ${bar[1]})`, boxShadow: `0 0 20px ${bar[1]}` }} />
      <div
        style={{
          position: "absolute",
          top: 250,
          right: 80,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "10px 22px",
          borderRadius: 999,
          background: "rgba(7,9,15,.7)",
          border: "2px solid rgba(255,255,255,.14)",
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 28,
          color: "#fff",
          direction: "rtl",
          opacity: o * lerp(f, [4, 14], [0, 1]),
        }}
      >
        {icon ?? (
          <span style={{ width: 30, height: 30, borderRadius: "50%", background: `radial-gradient(circle, ${C.y} 0 22%, ${C.r} 23% 45%, ${C.b} 46% 68%, #fff 69%)` }} />
        )}
        {kicker}
      </div>
      <div style={{ position: "absolute", top: 1412, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: o }}>
        <Handles size={28} />
      </div>
    </>
  );
};
