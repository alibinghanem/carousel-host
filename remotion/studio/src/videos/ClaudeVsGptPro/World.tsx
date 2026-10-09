import { AbsoluteFill, staticFile } from "remotion";
import { useMusic } from "../../lib/music";
import { CL, EN, GP, H, IN_OUT, MID, OUT, STAGE, W, ease } from "./theme";
import { Logo, SplitLayer } from "./kit";
import { CUTS, SEG } from "./tl";

/** فتح الستارة في الختام: النصفان ينزلقان للخارج */
export const doorOpen = (f: number) => ease(f, SEG.end[0] - 4, 30, IN_OUT);

const Grid: React.FC<{ color: string; dy: number }> = ({ color, dy }) => (
  <AbsoluteFill
    style={{
      backgroundImage: `radial-gradient(${color} 2.2px, transparent 2.6px)`,
      backgroundSize: "44px 44px",
      backgroundPosition: `0px ${dy}px`,
      maskImage: "linear-gradient(180deg, transparent 0%, #000 18%, #000 82%, transparent 100%)",
    }}
  />
);

/** الخلفيتان + الخط الفاصل + الهيدر + الرقم العملاق */
export const World: React.FC<{ f: number; round: number; roundAt: number }> = ({ f, round, roundAt }) => {
  const { kick, bass } = useMusic();
  const open = doorOpen(f);
  const draw = ease(f, -4, 16, OUT);
  // حزمة ضوء تجري على الخط عند كل قطع
  const packet = CUTS.map((c) => (f >= c - 12 && f <= c + 8 ? (f - (c - 12)) / 20 : -1)).find((v) => v >= 0) ?? -1;
  const numIn = ease(f, roundAt, 26, OUT);
  return (
    <>
      <AbsoluteFill style={{ background: `radial-gradient(90% 60% at 50% 45%, #2A2622 0%, ${STAGE} 70%)` }} />
      {/* يمين: Claude */}
      <div style={{ position: "absolute", top: 0, left: MID, width: MID, height: H, overflow: "hidden", transform: `translateX(${open * 560}px)` }}>
        <AbsoluteFill style={{ background: CL.bg }} />
        <AbsoluteFill style={{ background: `radial-gradient(70% 40% at 80% 18%, ${CL.acc}${Math.round(18 + bass * 20).toString(16)}, transparent 70%)` }} />
        <div style={{ position: "absolute", left: -MID, top: 0, width: W, height: H }}>
          <Grid color="rgba(20,20,19,.075)" dy={-f * 0.5} />
        </div>
      </div>
      {/* يسار: ChatGPT */}
      <div style={{ position: "absolute", top: 0, left: 0, width: MID, height: H, overflow: "hidden", transform: `translateX(${-open * 560}px)` }}>
        <AbsoluteFill style={{ background: GP.bg }} />
        <AbsoluteFill style={{ background: `radial-gradient(70% 40% at 20% 82%, ${GP.acc}${Math.round(16 + bass * 18).toString(16)}, transparent 70%)` }} />
        <Grid color="rgba(255,255,255,.07)" dy={f * 0.5} />
      </div>
      {/* الرقم العملاق للجولة (خلفية، مقصوص على الخط) */}
      {round > 0 && open < 0.5 ? (
        <SplitLayer y={620} h={720}>
          <div
            style={{
              width: W,
              textAlign: "center",
              font: `700 640px/1 ${EN}`,
              color: "transparent",
              WebkitTextStroke: "3px var(--line)",
              transform: `translateY(${(1 - numIn) * 120 - (f - roundAt) * 0.25}px)`,
              opacity: numIn * 0.9 * (1 - open * 2),
              letterSpacing: -20,
            }}
          >
            {String(round).padStart(2, "0")}
          </div>
        </SplitLayer>
      ) : null}
      {/* الخط الفاصل */}
      {open < 0.98 ? (
        <div style={{ position: "absolute", left: MID - 2, top: 0, width: 4, height: H, transform: `scaleY(${draw})`, opacity: Math.max(0, 1 - open * 3) }}>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 0%, #8C877C 12%, #8C877C 88%, transparent 100%)", boxShadow: `0 0 ${6 + kick * 22}px rgba(217,119,87,${0.25 + kick * 0.5})` }} />
          {packet >= 0 ? (
            <div
              style={{
                position: "absolute",
                left: -3,
                width: 10,
                top: -260 + packet * (H + 260),
                height: 260,
                borderRadius: 5,
                background: `linear-gradient(180deg, transparent, #fff 50%, transparent)`,
                boxShadow: `0 0 30px ${CL.acc}, 0 0 60px ${GP.acc}`,
              }}
            />
          ) : null}
        </div>
      ) : null}
      {/* الهيدر: الشعاران */}
      {(["r", "l"] as const).map((s, i) => {
        const p = ease(f, i * 4, 16, OUT);
        const x = s === "r" ? MID + 215 + open * 560 : 325 - open * 560;
        return (
          <div
            key={s}
            style={{
              position: "absolute",
              top: 252,
              left: x - 200,
              width: 400,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 16,
              direction: "ltr",
              opacity: p,
              transform: `translateY(${(1 - p) * -30}px) scale(${1 + kick * 0.025})`,
            }}
          >
            <Logo side={s} size={58} />
            <span style={{ font: `700 50px ${EN}`, color: s === "r" ? CL.ink : GP.ink, letterSpacing: -1 }}>{s === "r" ? "Claude" : "ChatGPT"}</span>
          </div>
        );
      })}
    </>
  );
};

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
export const HandlesRow: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div style={{ display: "inline-flex", gap: size * 1.2, alignItems: "center", font: `700 ${size}px ${EN}`, color, direction: "ltr", whiteSpace: "nowrap" }}>
    <span style={{ display: "inline-flex", gap: size * 0.3, alignItems: "center" }}>{IG}@al_t506</span>
    <span style={{ display: "inline-flex", gap: size * 0.3, alignItems: "center" }}>{TT}@ali_altamimy_tech</span>
  </div>
);

/** الحسابان أسفل الشاشة طول الجولات */
export const Footer: React.FC<{ f: number }> = ({ f }) => {
  const o = ease(f, 10, 16) * (1 - ease(f, SEG.end[0] - 14, 10));
  if (o <= 0) return null;
  return (
    <SplitLayer y={1466} h={50} style={{ opacity: o * 0.9 }}>
      <div style={{ width: W, display: "flex", justifyContent: "center" }}>
        <HandlesRow size={26} color="var(--sub)" />
      </div>
    </SplitLayer>
  );
};

export const AVATAR = staticFile("avatar.png");
