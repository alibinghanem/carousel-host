import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PERSPECTIVE, smooth, worldTransform } from "../../lib/camera3d";
import { DustField, FilmLook, FlashBurst, LightLine } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { FRAMES, HIT, S, Z, camAt } from "./tl";
import { Handles, P } from "./parts";
import { G1, G2, G3, Hook, Test, Verdict } from "./Scenes";
import { End } from "./End";

/**
 * «Claude أو ChatGPT؟» — تدريب 57ث بلقطة واحدة متواصلة فوق مضمار سباق وقت الغروب.
 * مسار برتقالي لـ Claude ومسار أخضر لـ ChatGPT، وكل بوابة مهمة: صور ← بحث ← ملفات ← الاختبار ← الخلاصة.
 * المصادر: support.claude.com (Can Claude produce images · Research · رفع الملفات) + ChatGPT Deep Research (5–30 دقيقة، مصدر ثانوي لأن help.openai.com محجوب).
 */
export const CLAUDE_VS_GPT_FRAMES = FRAMES;

/** الطريق: رقع قصيرة (1040) محاذية للعالم وكلها أمام الكاميرا (لوح يعبر الكاميرا ينقصّ) */
const TILE = 520;
const Road: React.FC<{ camZ: number }> = ({ camZ }) => {
  const hi = Math.floor((camZ - 150) / TILE) - 1;
  const lo = hi - 15;
  const tiles: number[] = [];
  for (let i = lo; i <= hi; i++) tiles.push(i);
  return (
    <>
      {tiles.map((i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1100,
            height: TILE + 2,
            transform: `translate3d(0px, 396px, ${(i + 0.5) * TILE}px) rotateX(90deg) translate(-50%, -50%)`,
            backgroundImage: `repeating-linear-gradient(180deg, transparent 0 90px, #ffffffcc 90px 170px, transparent 170px 260px),
              repeating-linear-gradient(180deg, ${P.cl}00 0 40px, ${P.cl}33 40px 80px),
              linear-gradient(90deg, #5B3AA8 0, #5B3AA8 1.2%, ${P.gp}66 1.2%, ${P.gp}2A 48.7%, #ffffff 48.7%, #ffffff 49.1%, transparent 49.1%, transparent 50.9%, #ffffff 50.9%, #ffffff 51.3%, ${P.cl}2A 51.3%, ${P.cl}66 98.8%, #5B3AA8 98.8%, #5B3AA8 100%),
              linear-gradient(90deg, #3A2480 0, #2C1A66 100%)`,
            backgroundSize: "14px 100%, 100% 100%, 100% 100%, 100% 100%",
            backgroundPosition: "50% 0, 0 0, 0 0, 0 0",
            backgroundRepeat: "repeat-y, no-repeat, no-repeat, no-repeat",
          }}
        />
      ))}
    </>
  );
};

const Sky: React.FC<{ f: number }> = ({ f }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #1B0F47 0%, #4B2A8A 28%, #C2477F 46%, #FF8F6B 56%, #FFC27A 60%, #1B0D45 60.3%, #0E0624 100%)" }}>
    <div style={{ position: "absolute", left: 540 - 300, top: 560 + Math.sin(f / 90) * 4, width: 600, height: 300, overflow: "hidden", opacity: 0.9 }}>
      <div style={{ width: 600, height: 600, borderRadius: "50%", background: "linear-gradient(180deg, #FFF0B0 0%, #FFB86B 55%, #FF6F8E 100%)", boxShadow: "0 0 140px #FF9A7A" }} />
      {[40, 90, 135, 175, 210, 240].map((y, i) => (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 140 + y * 0.9, height: 4 + i * 2, background: "#C2477F" }} />
      ))}
    </div>
  </AbsoluteFill>
);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const footer = smooth(f / 12) * (1 - smooth((f - (S.end - 40)) / 14));
  const fadeOut = smooth((f - (FRAMES - 34)) / 26);
  return (
    <AbsoluteFill style={{ background: P.bg, overflow: "hidden" }}>
      <Sky f={f} />
      <AbsoluteFill style={{ background: `radial-gradient(75% 24% at 50% 47%, ${P.bg}99, transparent 100%)` }} />
      <AbsoluteFill style={{ background: P.bg, opacity: 0.82 * smooth((f - (S.end - 50)) / 45) }} />
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransform(cam) }}>
          <Road camZ={cam.z} />
          <DustField cam={cam} f={f} colors={[P.gold, P.cl, P.gp]} zFrom={Z.hook + 1500} zTo={Z.end - 600} count={190} />
          <Hook cam={cam} f={f} />
          <G1 cam={cam} f={f} />
          <G2 cam={cam} f={f} />
          <G3 cam={cam} f={f} />
          <Test cam={cam} f={f} />
          <Verdict cam={cam} f={f} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <LightLine f={f} hit={HIT} end={FRAMES - 40} color={P.cl} accent={P.gp} />
      <FlashBurst f={f} at={HIT} color={P.gold} max={0.6} />
      <FlashBurst f={f} at={S.end} color={P.gold} max={0.25} dur={16} />
      <FilmLook f={f} />
      {footer > 0 ? (
        <div style={{ position: "absolute", top: 1780, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: footer * 0.9 }}>
          <Handles size={28} color={P.mute} />
        </div>
      ) : null}
      {fadeOut > 0 ? <AbsoluteFill style={{ background: P.bg, opacity: fadeOut }} /> : null}
    </AbsoluteFill>
  );
};

export const ClaudeVsGpt: React.FC = () => (
  <MusicProvider src="videos/claude-vs-gpt/music.mp3" volume={0.72}>
    <Scene />
    <Sfx name="whoosh_soft" at={0} volume={0.22} />
    {[14, 26, 56].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.22} />
    ))}
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.24} />
    <Sfx name="impact" at={HIT} volume={0.3} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.28} />
    {[S.g1, S.g2, S.g3, S.test, S.verdict, S.end].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={t - 14} volume={0.3} />
    ))}
    {/* كل محطة: بوابة ثم المساران */}
    {[S.g1, S.g2, S.g3].map((s) => (
      <span key={s}>
        <Sfx name="impact" at={s + 4} volume={0.26} />
        <Sfx name="pop" at={s + 14} volume={0.24} />
        <Sfx name="pop" at={s + 30} volume={0.24} />
        <Sfx name="click" at={s + 80} volume={0.16} />
        <Sfx name="click" at={s + 96} volume={0.16} />
      </span>
    ))}
    <Sfx name="success" at={S.g1 + 110} volume={0.14} />
    <Sfx name="success" at={S.g2 + 170} volume={0.14} />
    {/* الاختبار */}
    <Sfx name="impact" at={S.test + 4} volume={0.26} />
    {[20, 48, 76].map((t) => (
      <Sfx key={t} name="click" at={S.test + t} volume={0.2} />
    ))}
    <Sfx name="success" at={S.test + 90} volume={0.2} />
    {/* الخلاصة */}
    {[4, 12, 24, 44].map((t) => (
      <Sfx key={t} name="pop" at={S.verdict + t} volume={0.22} />
    ))}
    <Sfx name="success" at={S.verdict + 50} volume={0.2} />
    {/* الختام */}
    <Sfx name="impact" at={S.end} volume={0.26} />
    <Sfx name="success" at={S.end + 8} volume={0.18} />
  </MusicProvider>
);
