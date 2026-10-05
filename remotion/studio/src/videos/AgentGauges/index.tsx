import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PERSPECTIVE, smooth, worldTransform } from "../../lib/camera3d";
import { FilmLook, FlashBurst } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { Handles } from "../ClaudeTrio/parts";
import { FRAMES, HIT, S, X, camAt } from "./tl";
import { P } from "./parts";
import { G1, G2, G3, G4, Hook, Tip } from "./Scenes";
import { End } from "./End";

/**
 * «كيف تقيس أداء وكيلك؟» — تدريب 53ث بلقطة واحدة متواصلة (1080×1920 · 30fps).
 * الاستعارة: لوحة قيادة سيارة طويلة؛ الكاميرا تنزلق عليها بلا توقف وكل مقياس عدّاد له مؤشر يتحرك:
 * نسبة الإنجاز ← معدّل التصعيد ← الوقت الموفّر ← رضا المستخدم ← ابدأ بحالات حقيقية.
 * المصدر: anthropic.com/engineering/demystifying-evals-for-ai-agents (٢٠–٥٠ حالة من إخفاقات حقيقية).
 */
export const AGENT_GAUGES_FRAMES = FRAMES;

/** خلفية الزجاج الأمامي: أفق ليلي + أضواء مدينة بحركة منظورية */
const Windshield: React.FC<{ camX: number }> = ({ camX }) => {
  const lights = Array.from({ length: 46 }, (_, i) => {
    const r = (n: number) => {
      const v = Math.sin(i * 91.7 + n * 37.3) * 43758.5453;
      return v - Math.floor(v);
    };
    return { x: r(1) * 3200, y: 560 + r(2) * 330, s: 6 + r(3) * 22, c: [P.amber, P.cyan, "#FFFFFF", P.em][Math.floor(r(4) * 4)], o: 0.35 + r(5) * 0.6 };
  });
  const off = -((camX * 0.16) % 3200);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, #050A09 0%, #0A1714 45%, #12332A 62%, #061210 70%)` }} />
      <AbsoluteFill style={{ background: `radial-gradient(70% 18% at 50% 64%, ${P.em}44, transparent 70%)` }} />
      {[0, 1].map((k) => (
        <div key={k} style={{ position: "absolute", left: off + k * 3200, top: 0, width: 3200, height: 1920 }}>
          {lights.map((l, i) => (
            <div key={i} style={{ position: "absolute", left: l.x, top: l.y, width: l.s, height: l.s, borderRadius: "50%", background: l.c, opacity: l.o, boxShadow: `0 0 ${l.s * 2.4}px ${l.c}` }} />
          ))}
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** رقع لوحة القيادة: كربون بخطوط عمودية محاذية لإحداثيات العالم (تبدو لوحاً واحداً طويلاً) */
const Dash: React.FC = () => (
  <>
    {Object.values(X).map((x, i) => {
      const w = 1900;
      const off = ((((-(Math.round(x) - w / 2)) % 24) + 24) % 24);
      return (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: 1100,
            transform: `translate3d(${Math.round(x)}px, 460px, 0px) translate(-50%, -50%)`,
            // eslint-disable-next-line @remotion/no-background-image
            backgroundImage: `linear-gradient(180deg, ${P.em}99 0px, ${P.em}00 8px), repeating-linear-gradient(90deg, rgba(255,255,255,.06) 0 2px, transparent 2px 24px), linear-gradient(180deg, #1B2E26 0%, #101D18 45%, #08100D 100%)`,
            backgroundPosition: `0 0, ${off}px 0, 0 0`,
          }}
        />
      );
    })}
  </>
);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const footer = smooth(f / 12) * (1 - smooth((f - (S.end - 30)) / 14));
  const fadeOut = smooth((f - (FRAMES - 30)) / 24);
  return (
    <AbsoluteFill style={{ background: P.bg, overflow: "hidden" }}>
      <Windshield camX={cam.x} />
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransform(cam) }}>
          <Dash />
          <Hook cam={cam} f={f} />
          <G1 cam={cam} f={f} />
          <G2 cam={cam} f={f} />
          <G3 cam={cam} f={f} />
          <G4 cam={cam} f={f} />
          <Tip cam={cam} f={f} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <FlashBurst f={f} at={HIT} color={P.em} max={0.5} />
      <FilmLook f={f} vignette={0.55} />
      {footer > 0 ? (
        <div style={{ position: "absolute", top: 1780, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: footer * 0.8 }}>
          <Handles size={28} color={P.mute} />
        </div>
      ) : null}
      {fadeOut > 0 ? <AbsoluteFill style={{ background: P.bg, opacity: fadeOut }} /> : null}
    </AbsoluteFill>
  );
};

export const AgentGauges: React.FC = () => (
  <MusicProvider src="videos/agent-gauges/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.2} />
    {[48, 60, 74].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.18} />
    ))}
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.24} />
    <Sfx name="impact" at={HIT} volume={0.3} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.26} />
    {[S.g1, S.g2, S.g3, S.g4, S.tip, S.end].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={t - 16} volume={0.26} />
    ))}
    {/* مقاييس: نقرة عند وصول المؤشر */}
    {[S.g1, S.g2, S.g3, S.g4].map((t) => (
      <Sfx key={t} name="pop" at={t + 70} volume={0.22} />
    ))}
    {Array.from({ length: 10 }, (_, i) => (
      <Sfx key={i} name="click" at={S.g1 + 30 + i * 6} volume={0.1} />
    ))}
    {[40, 70, 100].map((t) => (
      <Sfx key={t} name="click" at={S.g2 + t + 20} volume={0.14} />
    ))}
    <Sfx name="success" at={S.g3 + 100} volume={0.18} />
    <Sfx name="success" at={S.g4 + 92} volume={0.18} />
    {Array.from({ length: 8 }, (_, i) => (
      <Sfx key={i} name="click" at={S.tip + 24 + i * 11} volume={0.1} />
    ))}
    <Sfx name="success" at={S.tip + 116} volume={0.2} />
    <Sfx name="impact" at={S.end} volume={0.26} />
    <Sfx name="success" at={S.end + 8} volume={0.16} />
  </MusicProvider>
);
