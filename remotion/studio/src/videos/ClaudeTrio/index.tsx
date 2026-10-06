import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PERSPECTIVE, smooth, worldTransform } from "../../lib/camera3d";
import { DustField, FilmLook, FlashBurst, LightLine, Obj } from "../../lib/world3d";
import { MusicProvider, SFX_RISER_PEAK, Sfx } from "../../lib/music";
import { FRAMES, HIT, S, Z, camAt } from "./tl";
import { Handles, T } from "./parts";
import { Hook } from "./Hook";
import { ChatIsland, CodeIsland, CompareIsland, CoworkIsland, RoutineIsland } from "./Scenes";
import { End } from "./End";

/**
 * «Claude · ٣ طرق» — تدريب 52ث بلقطة واحدة متواصلة (1080×1920 · 30fps).
 * عالم ليلي واحد: الكاميرا تطير فوقه ولا تتوقف، وكل جزيرة فيها شخصيات ورسومات تتحرك (بدون بطاقات):
 * المحادثة ← Cowork ← Claude Code ← الجدولة ← الفرق ← الختام. الموسيقى: ElevenLabs معاد ترتيبها (drop عند 120).
 * المصادر: support.claude.com (Cowork + المحادثة = Claude واحد · جدولة Cowork) و code.claude.com/docs (overview · routines).
 */
export const CLAUDE_TRIO_FRAMES = FRAMES;

const TINTS: { z: number; c: string }[] = [
  { z: Z.hook, c: T.chat },
  { z: Z.chat, c: T.chat },
  { z: Z.cowork, c: T.cowork },
  { z: Z.code, c: T.code },
  { z: Z.routine, c: T.code },
  { z: Z.compare, c: T.gold },
  { z: Z.end, c: T.chat },
];

const Tint: React.FC<{ camZv: number }> = ({ camZv }) => (
  <>
    {TINTS.map((t, i) => {
      const w = Math.max(0, 1 - Math.abs(camZv - 1250 - t.z) / 1500);
      if (w <= 0) return null;
      return <AbsoluteFill key={i} style={{ background: `radial-gradient(90% 55% at 50% 42%, ${t.c}38, transparent 72%)`, opacity: w }} />;
    })}
  </>
);

/** الأرض: شريط ضوئي طويل يمر تحت كل الجزر (يربطها كعالم واحد) */
const Ribbon: React.FC<{ f: number }> = ({ f }) => {
  const len = 12000;
  const mid = (Z.hook + Z.end) / 2;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 360,
        height: len,
        transform: `translate3d(0px, 396px, ${mid}px) rotateX(90deg) translate(-50%, -50%)`,
        backgroundImage: `repeating-linear-gradient(180deg, transparent 0 80px, ${T.gold}55 80px 92px, transparent 92px 200px), linear-gradient(90deg, transparent, ${T.chat}22 30%, ${T.code}22 70%, transparent)`,
        backgroundPosition: `0 ${f * 8}px, 0 0`,
        maskImage: "linear-gradient(90deg, transparent, #000 25%, #000 75%, transparent)",
      }}
    />
  );
};

/** بوابات ضوئية بين الجزر: الكاميرا تعبر منها */
const Gates: React.FC<{ cam: ReturnType<typeof camAt>; f: number }> = ({ cam, f }) => {
  const zs = [Z.chat, Z.cowork, Z.code, Z.routine, Z.compare, Z.end];
  const cols = [T.chat, T.cowork, T.code, T.gold, T.gold, T.chat];
  return (
    <>
      {zs.map((z, i) => (
        <Obj key={i} cam={cam} z={z + 780} y={0} near={600} far={2800} farSoft={600}>
          <div style={{ width: 1500, height: 1500, borderRadius: "50%", border: `4px solid ${cols[i]}`, boxShadow: `0 0 80px ${cols[i]}, inset 0 0 80px ${cols[i]}55`, opacity: 0.4, rotate: `${f * 0.3}deg` }} />
        </Obj>
      ))}
    </>
  );
};

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camAt(f);
  const footer = smooth(f / 12) * (1 - smooth((f - (S.end - 40)) / 14));
  const fadeOut = smooth((f - (FRAMES - 34)) / 26);
  const dawn = smooth((f - (S.routine + 110)) / 40) * (1 - smooth((f - (S.compare + 10)) / 40));
  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 70% at 50% 40%, #121B33 0%, ${T.bg} 70%)`, overflow: "hidden" }}>
      <Tint camZv={cam.z} />
      {dawn > 0 ? <AbsoluteFill style={{ background: `radial-gradient(110% 70% at 50% 75%, #F2A65A88, ${T.gold}33 40%, transparent 75%)`, opacity: dawn }} /> : null}
      <AbsoluteFill style={{ perspective: `${PERSPECTIVE}px`, perspectiveOrigin: "50% 50%" }}>
        <div style={{ position: "absolute", left: 540, top: 960, width: 0, height: 0, transformStyle: "preserve-3d", transform: worldTransform(cam) }}>
          <Ribbon f={f} />
          <DustField cam={cam} f={f} colors={[T.gold, T.chat, T.cowork, T.code]} zFrom={Z.hook + 1500} zTo={Z.end - 600} count={210} />
          <Gates cam={cam} f={f} />
          <Hook cam={cam} f={f} />
          <ChatIsland cam={cam} f={f} />
          <CoworkIsland cam={cam} f={f} />
          <CodeIsland cam={cam} f={f} />
          <RoutineIsland cam={cam} f={f} />
          <CompareIsland cam={cam} f={f} />
          <End cam={cam} f={f} />
        </div>
      </AbsoluteFill>
      <LightLine f={f} hit={HIT} end={FRAMES - 40} color={T.chat} accent={T.code} />
      <FlashBurst f={f} at={HIT} color={T.chat} max={0.7} />
      <FlashBurst f={f} at={S.end} color={T.gold} max={0.25} dur={16} />
      <FilmLook f={f} />
      {footer > 0 ? (
        <div style={{ position: "absolute", top: 1780, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: footer * 0.85 }}>
          <Handles size={28} color={T.mute} />
        </div>
      ) : null}
      {fadeOut > 0 ? <AbsoluteFill style={{ background: T.bg, opacity: fadeOut }} /> : null}
    </AbsoluteFill>
  );
};

export const ClaudeTrio: React.FC = () => (
  <MusicProvider src="videos/claude-trio/music.mp3" volume={0.72}>
    <Scene />
    {/* افتتاحية */}
    <Sfx name="whoosh_soft" at={0} volume={0.22} />
    {[58, 67, 76].map((t) => (
      <Sfx key={t} name="pop" at={t} volume={0.22} />
    ))}
    <Sfx name="riser" at={HIT - SFX_RISER_PEAK} volume={0.24} />
    <Sfx name="impact" at={HIT} volume={0.3} />
    <Sfx name="whoosh_fast" at={HIT - 4} volume={0.28} />
    {/* العبور بين الجزر */}
    {[S.cowork - 18, S.code - 18, S.routine - 18, S.compare - 18, S.end - 18].map((t) => (
      <Sfx key={t} name="whoosh_soft" at={t} volume={0.3} />
    ))}
    {/* المحادثة */}
    <Sfx name="pop" at={S.chat + 6} volume={0.22} />
    {[12, 102].map((t) => (
      <Sfx key={t} name="typing" at={S.chat + t} volume={0.12} />
    ))}
    {[54, 130].map((t) => (
      <Sfx key={t} name="pop" at={S.chat + t} volume={0.22} />
    ))}
    <Sfx name="success" at={S.chat + 96} volume={0.1} />
    {/* Cowork */}
    <Sfx name="typing" at={S.cowork + 12} volume={0.12} />
    {Array.from({ length: 9 }, (_, i) => (
      <Sfx key={i} name="click" at={S.cowork + 44 + i * 8 + 20} volume={0.12} />
    ))}
    <Sfx name="success" at={S.cowork + 140} volume={0.2} />
    <Sfx name="pop" at={S.cowork + 150} volume={0.2} />
    {/* Code */}
    <Sfx name="typing" at={S.code + 12} volume={0.14} />
    {[18, 30, 42, 54, 66, 78].map((t) => (
      <Sfx key={t} name="click" at={S.code + t} volume={0.1} />
    ))}
    <Sfx name="impact" at={S.code + 118} volume={0.3} />
    <Sfx name="success" at={S.code + 124} volume={0.22} />
    {/* الجدولة */}
    <Sfx name="pop" at={S.routine + 26} volume={0.2} />
    {[56, 70, 84, 98].map((t) => (
      <Sfx key={t} name="click" at={S.routine + t} volume={0.14} />
    ))}
    <Sfx name="success" at={S.routine + 130} volume={0.22} />
    {/* الفرق */}
    {[14, 28, 42].map((t) => (
      <Sfx key={t} name="pop" at={S.compare + t} volume={0.22} />
    ))}
    {/* الختام */}
    <Sfx name="impact" at={S.end} volume={0.26} />
    <Sfx name="success" at={S.end + 8} volume={0.18} />
  </MusicProvider>
);
