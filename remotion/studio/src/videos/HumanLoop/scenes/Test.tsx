import { AbsoluteFill, Img, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { lerp } from "../../../lib/theme";
import { Burst, Words } from "../../../lib/ui";
import { SFX_RISER_PEAK, Sfx, useMusic } from "../../../lib/music";
import { B, D, H, PaperBg, V, hazard } from "../parts";

/** الاختبار + الأدوات (1320–1560 مطلق). ذروة الموسيقى 1500 = محلي 180 على بطاقة «لا ← بوابة» */
const PEAK = 180;

const Branch: React.FC<{ at: number; yes?: boolean }> = ({ at, yes }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const { kick } = useMusic();
  const s = spring({ frame: f - at, fps, config: { damping: 12, stiffness: 180 } });
  const hit = !yes && f >= PEAK ? spring({ frame: f - PEAK, fps, config: { damping: 7, stiffness: 260 } }) : 0;
  const c = yes ? H.g : H.r;
  return (
    <div
      style={{
        position: "relative",
        width: 420,
        height: 250,
        borderRadius: 34,
        background: yes ? "#fff" : H.y,
        border: `6px solid ${c}`,
        boxShadow: !yes && f >= PEAK ? `0 0 ${60 + kick * 40}px ${H.y}` : "0 24px 40px rgba(0,0,0,.35)",
        direction: "rtl",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        overflow: "hidden",
        scale: `${(0.5 + 0.5 * s) * (1 + (hit > 0 ? 0.12 * (1 - Math.min(1, (f - PEAK) / 20)) : 0))}`,
        opacity: Math.min(1, s * 2),
      }}
    >
      {!yes ? <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 26, background: hazard(18) }} /> : null}
      <div style={{ fontFamily: D, fontWeight: 800, fontSize: 104, color: c, lineHeight: 1.05 }}>{yes ? "نعم" : "لا"}</div>
      <div style={{ fontFamily: B, fontWeight: 700, fontSize: 40, color: H.ink }}>{yes ? "← خلّه يمشي لحاله" : "← بوابة إلزامية"}</div>
    </div>
  );
};

const Tool: React.FC<{ at: number; logo: string; mark: string; markW: number; what: React.ReactNode }> = ({ at, logo, mark, markW, what }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - at, fps, config: { damping: 14, stiffness: 170 } });
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        width: 860,
        padding: "20px 30px",
        borderRadius: 28,
        background: "#fff",
        direction: "rtl",
        opacity: Math.min(1, s * 2),
        translate: `${(1 - s) * 160}px 0px`,
      }}
    >
      <div style={{ width: 84, height: 84, flex: "none", borderRadius: 20, background: "#F6F4EF", display: "grid", placeItems: "center" }}>
        <Img src={V(logo)} style={{ width: 60, height: 60 }} />
      </div>
      <div>
        <Img src={V(mark)} style={{ height: 40, width: markW, display: "block", marginBottom: 6 }} />
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 36, color: H.steel }}>{what}</div>
      </div>
    </div>
  );
};

export const Test: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <PaperBg dark />
      <div style={{ position: "absolute", top: 330, left: 60, right: 60, textAlign: "center", direction: "rtl" }}>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 46, color: H.y, opacity: lerp(f, [4, 14], [0, 1]) }}>اختبار سريع لأي خطوة</div>
        <Words text="لو غلط فيها الوكيل…" at={12} style={{ fontFamily: D, fontWeight: 800, fontSize: 80, color: "#fff", lineHeight: 1.3 }} />
        <Words text="أقدر أتراجع؟" at={30} style={{ fontFamily: D, fontWeight: 800, fontSize: 108, color: H.y, lineHeight: 1.2 }} />
      </div>
      <div style={{ position: "absolute", top: 660, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40, direction: "rtl" }}>
        <Branch at={60} yes />
        <Branch at={86} />
      </div>
      {f >= PEAK ? <Burst at={PEAK} x={290} y={785} color={H.y} n={26} /> : null}
      <div style={{ position: "absolute", top: 950, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
        <div style={{ fontFamily: B, fontWeight: 700, fontSize: 40, color: "rgba(255,255,255,.75)", direction: "rtl", opacity: lerp(f, [112, 122], [0, 1]) }}>
          تطبّقها اليوم في:
        </div>
        <Tool at={124} logo="zapier-color.svg" mark="zapier-text.svg" markW={118} what={<>خطوة <span style={{ fontFamily: "Space Grotesk" }}>Human in the Loop</span> للموافقة</>} />
        <Tool at={144} logo="n8n-color.svg" mark="n8n-text.svg" markW={100} what="مراجعة بشرية قبل ما الوكيل يستخدم الأداة" />
      </div>
      <Sfx name="whoosh_soft" at={0} volume={0.4} />
      <Sfx name="pop" at={60} volume={0.35} />
      <Sfx name="pop" at={86} volume={0.35} />
      <Sfx name="click" at={124} volume={0.3} />
      <Sfx name="click" at={144} volume={0.3} />
      <Sfx name="riser" at={PEAK - SFX_RISER_PEAK} volume={0.35} />
      <Sfx name="impact" at={PEAK} volume={0.46} />
    </AbsoluteFill>
  );
};
